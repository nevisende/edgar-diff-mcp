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
  /** e.g. "edgar-diff-mcp/0.1 you@example.com" — the SEC requires a contact. */
  userAgent: string;
  fetchImpl?: typeof fetch;
  /** Minimum spacing between requests in ms. Default 110 (≈9 req/s). */
  minIntervalMs?: number;
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

/** Filings are immutable and safe to cache forever; indexes change daily and are not. */
export function isImmutableUrl(url: string): boolean {
  return url.includes('/Archives/edgar/data/');
}

const TickersSchema = z.record(z.string(), z.object({ cik_str: z.number(), ticker: z.string(), title: z.string() }));
const SubmissionsSchema = z.object({
  filings: z.object({
    recent: z.object({
      accessionNumber: z.array(z.string()),
      form: z.array(z.string()),
      filingDate: z.array(z.string()),
      reportDate: z.array(z.string()),
      primaryDocument: z.array(z.string()),
    }),
  }),
});

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
  private readonly cache: KeyValueCache | undefined;
  private lastRequestAt = 0;
  private queue: Promise<void> = Promise.resolve();
  /** In-process memo of the submissions index, per CIK, for the life of this client. */
  private readonly submissions = new Map<string, Promise<FilingRef[]>>();

  constructor(opts: EdgarClientOptions) {
    if (!opts.userAgent || !/@/.test(opts.userAgent)) {
      throw new Error('EdgarClient: userAgent must include a contact email (SEC fair-access policy).');
    }
    this.ua = opts.userAgent;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.minInterval = opts.minIntervalMs ?? 110;
    this.cache = opts.cache;
  }

  /** Serialised, rate-limited GET returning text. */
  async getText(url: string): Promise<string> {
    const cacheable = isImmutableUrl(url);
    const cached = cacheable ? await this.cache?.get(url) : undefined;
    if (cached !== undefined) return cached;

    const run = async (): Promise<string> => {
      const wait = this.lastRequestAt + this.minInterval - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.lastRequestAt = Date.now();
      const res = await this.fetchImpl(url, {
        headers: { 'User-Agent': this.ua, 'Accept-Encoding': 'gzip, deflate', Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`EDGAR ${res.status} ${res.statusText} for ${url}`);
      const text = await res.text();
      if (cacheable) await this.cache?.set(url, text);
      return text;
    };

    const result = this.queue.then(run, run);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
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
    if (/^\d{1,10}$/.test(q)) return [{ cik: padCik(q), ticker: '', name: '' }];
    const data = await this.getJson(TICKERS_URL, TickersSchema);
    const rows = Object.values(data);
    const byTicker = rows.filter((r) => r.ticker.toUpperCase() === q.toUpperCase());
    const pool = byTicker.length ? byTicker : rows.filter((r) => r.title.toUpperCase().includes(q.toUpperCase()));
    return pool.slice(0, 10).map((r) => ({ cik: padCik(r.cik_str), ticker: r.ticker, name: r.title }));
  }

  async listFilings(cik: string, opts: ListFilingsOptions = {}): Promise<FilingRef[]> {
    const padded = padCik(cik);
    let all = this.submissions.get(padded);
    if (!all) {
      all = this.loadSubmissions(padded);
      this.submissions.set(padded, all);
      all.catch(() => this.submissions.delete(padded));
    }
    const out: FilingRef[] = [];
    for (const ref of await all) {
      if (opts.form && ref.form !== opts.form) continue;
      out.push(ref);
      if (opts.limit && out.length >= opts.limit) break;
    }
    return out;
  }

  private async loadSubmissions(padded: string): Promise<FilingRef[]> {
    const sub = await this.getJson(SUBMISSIONS_URL(padded), SubmissionsSchema);
    const r = sub.filings.recent;
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
    const all = await this.listFilings(cik);
    return all.find((f) => f.accession === accession);
  }

  async fetchDocument(ref: FilingRef): Promise<string> {
    return this.getText(ref.url);
  }
}
