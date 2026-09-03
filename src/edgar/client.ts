import { z } from 'zod';
import type { FilingRef } from '../types.js';

/**
 * Minimal, polite EDGAR client.
 *
 * SEC rules we honour:
 *  - a descriptive User-Agent with a contact address is mandatory;
 *  - at most 10 requests per second.
 * We do not persist anything unless the caller passes a `cache`.
 */

export interface EdgarClientOptions {
  /** e.g. "edgar-diff-mcp/0.1 you@example.com" - the SEC requires a contact. */
  userAgent: string;
  fetchImpl?: typeof fetch;
  /** Minimum spacing between requests in ms. Default 110 (about 9 req/s). */
  minIntervalMs?: number;
  /** Request timeout in ms. Default 30000. */
  timeoutMs?: number;
  cache?: KeyValueCache;
}

export interface KeyValueCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

export interface CompanyMatch {
  cik: string;
  ticker: string;
  name: string;
}

export interface ListFilingsOptions {
  form?: string;
  limit?: number;
}

const TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
const SUBMISSIONS_URL = (cik: string) => `https://data.sec.gov/submissions/CIK${cik}.json`;
const SUBMISSIONS_PAGE_URL = (name: string) => `https://data.sec.gov/submissions/${name}`;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

/** Filings are immutable and safe to cache forever; indexes change daily and are not. */
export function isImmutableUrl(url: string): boolean {
  return url.includes('/Archives/edgar/data/');
}

const TickersSchema = z.record(z.string(), z.object({ cik_str: z.number(), ticker: z.string(), title: z.string() }));
const CompanySubmissionsSchema = z.object({ name: z.string(), tickers: z.array(z.string()) });
const FilingArraysSchema = z.object({
  accessionNumber: z.array(z.string().min(1, 'accessionNumber entries must be non-empty')),
  form: z.array(z.string()),
  filingDate: z.array(z.string()),
  reportDate: z.array(z.string()),
  primaryDocument: z.array(z.string().min(1, 'primaryDocument entries must be non-empty')),
}).superRefine((filings, ctx) => {
  const lengths = [
    filings.accessionNumber.length,
    filings.form.length,
    filings.filingDate.length,
    filings.reportDate.length,
    filings.primaryDocument.length,
  ];
  if (new Set(lengths).size !== 1) {
    ctx.addIssue({
      code: 'custom',
      message: `filing arrays must have equal lengths; received ${lengths.join(', ')}`,
    });
  }
});
const SubmissionsSchema = z.object({
  filings: z.object({
    recent: FilingArraysSchema,
    files: z.array(z.object({ name: z.string() })).default([]),
  }),
});

interface SubmissionsState {
  filings: FilingRef[];
  files: string[];
  nextFile: number;
  loading?: Promise<void>;
}

class EdgarHttpError extends Error {
  constructor(readonly status: number, statusText: string, url: string) {
    super(`EDGAR ${status} ${statusText} for ${url}`);
  }
}

export function padCik(cik: string | number): string {
  return String(cik).replace(/\D/g, '').padStart(10, '0');
}

export function accessionToPath(accession: string): string {
  return accession.replace(/-/g, '');
}

export class EdgarClient {
  private readonly ua: string;
  private readonly fetchImpl: typeof fetch;
  private readonly minInterval: number;
  private readonly timeoutMs: number;
  private readonly cache: KeyValueCache | undefined;
  private lastRequestAt = 0;
  private queue: Promise<void> = Promise.resolve();
  /** In-process memo of the submissions index, per CIK, for the life of this client. */
  private readonly submissions = new Map<string, Promise<SubmissionsState>>();

  constructor(opts: EdgarClientOptions) {
    if (!opts.userAgent || !/@/.test(opts.userAgent)) {
      throw new Error('EdgarClient: userAgent must include a contact email (SEC fair-access policy).');
    }
    this.ua = opts.userAgent;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.minInterval = opts.minIntervalMs ?? 110;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.cache = opts.cache;
  }

  /** Rate-limited GET returning text. Concurrent responses do not block later request starts. */
  async getText(url: string): Promise<string> {
    const cacheable = isImmutableUrl(url);
    const cached = cacheable ? await this.cache?.get(url) : undefined;
    if (cached !== undefined) return cached;

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await this.waitForRequestSlot();
      let res: Response;
      try {
        res = await this.fetchImpl(url, {
          headers: { 'User-Agent': this.ua, 'Accept-Encoding': 'gzip, deflate', Accept: '*/*' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (error) {
        lastError = new Error(`EDGAR request failed for ${url}: ${errorMessage(error)}`);
        if (attempt < MAX_ATTEMPTS) await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        const error = new EdgarHttpError(res.status, res.statusText, url);
        if (res.status !== 429 && res.status < 500) throw error;
        lastError = error;
        if (attempt < MAX_ATTEMPTS) await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
        continue;
      }

      try {
        const text = await res.text();
        if (cacheable) await this.cache?.set(url, text);
        return text;
      } catch (error) {
        lastError = new Error(`EDGAR response failed for ${url}: ${errorMessage(error)}`);
        if (attempt < MAX_ATTEMPTS) await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
    throw lastError ?? new Error(`EDGAR request failed for ${url}`);
  }

  private async waitForRequestSlot(): Promise<void> {
    const takeSlot = async (): Promise<void> => {
      const wait = this.lastRequestAt + this.minInterval - Date.now();
      if (wait > 0) await delay(wait);
      this.lastRequestAt = Date.now();
    };
    const slot = this.queue.then(takeSlot, takeSlot);
    this.queue = slot;
    await slot;
  }

  /** Fetch + validate. Schema drift at EDGAR becomes a readable error, not a TypeError deep in a loop. */
  async getJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
    const parsed = schema.safeParse(JSON.parse(await this.getText(url)));
    if (!parsed.success) throw new Error(`EDGAR response at ${url} did not match the expected shape: ${parsed.error.issues[0]?.message ?? 'unknown'}`);
    return parsed.data;
  }

  /** Ticker (exact, case-insensitive) or company-name substring. */
  async resolveCompany(query: string): Promise<CompanyMatch[]> {
    const q = query.trim();
    if (!q) return [];
    if (/^\d{1,10}$/.test(q)) {
      const cik = padCik(q);
      try {
        const company = await this.getJson(SUBMISSIONS_URL(cik), CompanySubmissionsSchema);
        return [{ cik, ticker: company.tickers[0] ?? '', name: company.name }];
      } catch (error) {
        if (error instanceof EdgarHttpError && error.status === 404) return [];
        throw error;
      }
    }
    const data = await this.getJson(TICKERS_URL, TickersSchema);
    const rows = Object.values(data);
    const byTicker = rows.filter((r) => r.ticker.toUpperCase() === q.toUpperCase());
    const pool = byTicker.length ? byTicker : rows.filter((r) => r.title.toUpperCase().includes(q.toUpperCase()));
    return pool.slice(0, 10).map((r) => ({ cik: padCik(r.cik_str), ticker: r.ticker, name: r.title }));
  }

  async listFilings(cik: string, opts: ListFilingsOptions = {}): Promise<FilingRef[]> {
    const padded = padCik(cik);
    const state = await this.getSubmissions(padded);
    const form = opts.form?.toUpperCase();
    if (form) {
      const wanted = opts.limit ?? Number.POSITIVE_INFINITY;
      while (state.filings.filter((ref) => ref.form === form).length < wanted && state.nextFile < state.files.length) {
        await this.loadNextSubmissionsPage(padded, state);
      }
    }
    const out: FilingRef[] = [];
    for (const ref of state.filings) {
      if (form && ref.form !== form) continue;
      out.push(ref);
      if (opts.limit && out.length >= opts.limit) break;
    }
    return out;
  }

  private async getSubmissions(padded: string): Promise<SubmissionsState> {
    let state = this.submissions.get(padded);
    if (!state) {
      state = this.loadSubmissions(padded);
      this.submissions.set(padded, state);
      state.catch(() => this.submissions.delete(padded));
    }
    return state;
  }

  private async loadSubmissions(padded: string): Promise<SubmissionsState> {
    const sub = await this.getJson(SUBMISSIONS_URL(padded), SubmissionsSchema);
    return {
      filings: this.toFilingRefs(padded, sub.filings.recent),
      files: sub.filings.files.map((file) => file.name),
      nextFile: 0,
    };
  }

  private async loadNextSubmissionsPage(padded: string, state: SubmissionsState): Promise<void> {
    if (state.loading) return state.loading;
    const name = state.files[state.nextFile];
    if (!name) return;
    const loading = this.getJson(SUBMISSIONS_PAGE_URL(name), FilingArraysSchema).then((page) => {
      state.filings.push(...this.toFilingRefs(padded, page));
      state.nextFile++;
    });
    state.loading = loading;
    try {
      await loading;
    } finally {
      delete state.loading;
    }
  }

  private toFilingRefs(padded: string, r: z.infer<typeof FilingArraysSchema>): FilingRef[] {
    const out: FilingRef[] = [];
    for (let i = 0; i < r.accessionNumber.length; i++) {
      const accession = r.accessionNumber[i] ?? '';
      const ref: FilingRef = {
        cik: padded,
        accession,
        form: r.form[i] ?? '',
        filingDate: r.filingDate[i] ?? '',
        url: `https://www.sec.gov/Archives/edgar/data/${Number(padded)}/${accessionToPath(accession)}/${r.primaryDocument[i] ?? ''}`,
      };
      const rd = r.reportDate[i];
      if (rd) ref.reportDate = rd;
      out.push(ref);
    }
    return out;
  }

  /** Find a filing by accession number for a CIK (searches recent filings). */
  async findFiling(cik: string, accession: string): Promise<FilingRef | undefined> {
    const padded = padCik(cik);
    const state = await this.getSubmissions(padded);
    let found = state.filings.find((filing) => filing.accession === accession);
    while (!found && state.nextFile < state.files.length) {
      await this.loadNextSubmissionsPage(padded, state);
      found = state.filings.find((filing) => filing.accession === accession);
    }
    return found;
  }

  async fetchDocument(ref: FilingRef): Promise<string> {
    return this.getText(ref.url);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
