/**
 * Live evaluation harness — measures the parser's real-world precision against
 * a corpus of EDGAR filings.
 *
 *   EDGAR_USER_AGENT="edgar-diff-mcp/0.1 you@example.com" npm run eval:live > evals/latest.md
 *
 * Reads from and writes to `.edgar-cache` so re-runs are free after the first.
 * Exit code is always 0 — this is a report, not a gate.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { EdgarClient } from '../src/edgar/client.js';
import { FileCache } from '../src/edgar/cache.js';
import { FilingService } from '../src/service.js';
import type { FilingRef, DiffStats } from '../src/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_CORPUS = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK-B',
  'JPM', 'XOM', 'CVX', 'WMT', 'KO', 'PFE', 'BA', 'DIS',
  'NFLX', 'COST', 'UNH', 'CAT', 'GE', 'HD', 'INTC', 'PLD',
  'O', 'AMD', 'ORCL', 'CRM', 'ABBV', 'MCD',
];

const TICKERS_WITH_10Q = DEFAULT_CORPUS.slice(0, 8);

/** Core Items expected in every 10-K. */
const EXPECTED_10K_BASE = ['1', '1A', '1B', '2', '3', '5', '7', '7A', '8', '9A', '9B', '10', '11', '12', '13', '14', '15'];
/** Item 1C is only expected for filings dated >= 2023-12-15 (SEC cyber rule). */
const ITEM_1C_CUTOFF = '2023-12-15';

/** Expected Items for 10-Q filings. */
const EXPECTED_10Q = ['I.1', 'I.2', 'I.3', 'I.4', 'II.1', 'II.1A', 'II.2', 'II.6'];

// ---------------------------------------------------------------------------
// Types for results
// ---------------------------------------------------------------------------

interface FilingResult {
  ticker: string;
  form: string;
  filingDate: string;
  accession: string;
  cik: string;
  url: string;
  expectedItems: string[];
  foundItems: string[];
  missingItems: string[];
  itemChars: Record<string, number>;
  flags: string[];
  warnings: string[];
  error?: string;
}

interface DiffResult {
  ticker: string;
  baseDateStr: string;
  targetDateStr: string;
  baseAccession: string;
  targetAccession: string;
  stats: DiffStats;
  flags: string[];
  error?: string;
}

interface EvalResults {
  runDate: string;
  corpus: string[];
  filings: FilingResult[];
  diffs: DiffResult[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ua = process.env['EDGAR_USER_AGENT'] ?? '';
if (!/@/.test(ua)) {
  console.error('Set EDGAR_USER_AGENT with a contact email.');
  process.exit(1);
}

const corpus = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_CORPUS;
const client = new EdgarClient({ userAgent: ua, cache: new FileCache('.edgar-cache') });
const service = new FilingService(client);

const filingResults: FilingResult[] = [];
const diffResults: DiffResult[] = [];

for (const ticker of corpus) {
  let cik = '';
  let companyName = '';
  try {
    const [company] = await client.resolveCompany(ticker);
    if (!company) {
      console.error(`[SKIP] ${ticker}: no company found`);
      continue;
    }
    cik = company.cik;
    companyName = company.name;
  } catch (e) {
    console.error(`[ERROR] ${ticker}: resolveCompany failed: ${e instanceof Error ? e.message : String(e)}`);
    continue;
  }

  // Fetch 10-K filings (2 most recent)
  let tenKFilings: FilingRef[] = [];
  try {
    tenKFilings = await client.listFilings(cik, { form: '10-K', limit: 2 });
  } catch (e) {
    console.error(`[ERROR] ${ticker}: listFilings 10-K failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Fetch 10-Q filing (most recent) for first 8 tickers
  let tenQFilings: FilingRef[] = [];
  if (TICKERS_WITH_10Q.includes(ticker)) {
    try {
      tenQFilings = await client.listFilings(cik, { form: '10-Q', limit: 1 });
    } catch (e) {
      console.error(`[ERROR] ${ticker}: listFilings 10-Q failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const allFilings = [...tenKFilings, ...tenQFilings];

  for (const filing of allFilings) {
    const result: FilingResult = {
      ticker,
      form: filing.form,
      filingDate: filing.filingDate,
      accession: filing.accession,
      cik: filing.cik,
      url: filing.url,
      expectedItems: [],
      foundItems: [],
      missingItems: [],
      itemChars: {},
      flags: [],
      warnings: [],
    };

    try {
      const is10K = filing.form === '10-K';
      const is10Q = filing.form.startsWith('10-Q');

      if (is10K) {
        result.expectedItems = [...EXPECTED_10K_BASE];
        if (filing.filingDate >= ITEM_1C_CUTOFF) {
          result.expectedItems.push('1C');
        }
      } else if (is10Q) {
        result.expectedItems = [...EXPECTED_10Q];
      }

      const listed = await service.listItems(filing);
      result.foundItems = listed.items.map((i) => i.key);
      result.warnings = [...listed.warnings];

      for (const item of listed.items) {
        result.itemChars[item.key] = item.chars;
      }

      result.missingItems = result.expectedItems.filter((k) => !result.foundItems.includes(k));

      // Suspicion checks
      const item1aChars = result.itemChars['1A'] ?? result.itemChars['II.1A'] ?? 0;
      if (item1aChars > 0 && item1aChars < 4000) {
        result.flags.push(`Item 1A suspiciously short: ${item1aChars} chars`);
      }
      const item7Chars = result.itemChars['7'] ?? result.itemChars['I.2'] ?? 0;
      if (item7Chars > 0 && item7Chars < 4000) {
        result.flags.push(`Item 7/MD&A suspiciously short: ${item7Chars} chars`);
      }
      const item15Chars = result.itemChars['15'] ?? 0;
      if (item15Chars > 60000) {
        result.flags.push(`Item 15 suspiciously long: ${item15Chars} chars`);
      }

      // Check for "appeared N times" warnings
      for (const w of listed.warnings) {
        if (/appeared \d+ times/.test(w)) {
          result.flags.push(`Duplicate heading: ${w}`);
        }
      }
      for (const item of listed.items) {
        // We need to get section-level warnings too
        const section = await service.getSection(filing, item.key);
        if (section.status === 'ok') {
          for (const w of section.section.warnings) {
            if (/appeared \d+ times/.test(w)) {
              result.flags.push(`Duplicate heading: ${w}`);
            }
          }
        }
      }

      // Document-level warnings
      if (listed.warnings.length > 0) {
        result.flags.push(`Document warnings: ${listed.warnings.join('; ')}`);
      }

      console.error(`[OK] ${ticker} ${filing.form} ${filing.filingDate} — found ${result.foundItems.length}/${result.expectedItems.length} items, missing: ${result.missingItems.length > 0 ? result.missingItems.join(',') : 'none'}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      result.error = msg;
      console.error(`[ERROR] ${ticker} ${filing.form} ${filing.filingDate}: ${msg}`);
    }

    filingResults.push(result);
  }

  // Diff the two 10-K filings if we have them
  if (tenKFilings.length === 2) {
    const [newer, older] = tenKFilings;
    if (newer && older) {
      const dr: DiffResult = {
        ticker,
        baseDateStr: older.filingDate,
        targetDateStr: newer.filingDate,
        baseAccession: older.accession,
        targetAccession: newer.accession,
        stats: { baseParagraphs: 0, targetParagraphs: 0, added: 0, removed: 0, changed: 0, unchanged: 0, similarity: 0 },
        flags: [],
      };
      try {
        const d = await service.diff(older, newer, '1A');
        if (d.status === 'ok') {
          dr.stats = d.stats;
          if (d.stats.similarity < 0.15) {
            dr.flags.push(`Suspiciously low similarity ${d.stats.similarity} — possible parsing or alignment issue`);
          }
        } else {
          dr.error = `Diff not_found on ${d.side}: ${JSON.stringify(d.detail.status === 'not_found' ? { reason: d.detail.reason, available: d.detail.availableItems } : {})}`;
        }
        console.error(`[DIFF] ${ticker} ${older.filingDate} → ${newer.filingDate}: similarity=${dr.stats.similarity}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        dr.error = msg;
        console.error(`[DIFF ERROR] ${ticker}: ${msg}`);
      }
      diffResults.push(dr);
    }
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const results: EvalResults = {
  runDate: new Date().toISOString(),
  corpus,
  filings: filingResults,
  diffs: diffResults,
};

await mkdir('evals', { recursive: true });
await writeFile('evals/results.json', JSON.stringify(results, null, 2));

// Compute headline numbers
const totalExpected = filingResults.reduce((n, f) => n + f.expectedItems.length, 0);
const totalFound = filingResults.reduce((n, f) => n + f.foundItems.filter((k) => f.expectedItems.includes(k)).length, 0);
const precision = totalExpected > 0 ? ((totalFound / totalExpected) * 100).toFixed(1) : '0.0';

// Markdown report to stdout
const lines: string[] = [];
lines.push('# EDGAR Parser Evaluation Report');
lines.push('');
lines.push(`**Run date:** ${results.runDate}`);
lines.push(`**Corpus:** ${corpus.length} tickers`);
lines.push('');
lines.push('## Headline');
lines.push('');
lines.push(`| Metric | Value |`);
lines.push(`|--------|-------|`);
lines.push(`| Filings evaluated | ${filingResults.filter((f) => !f.error).length} |`);
lines.push(`| Expected Item slots | ${totalExpected} |`);
lines.push(`| Found | ${totalFound} |`);
lines.push(`| **Precision** | **${precision}%** |`);
lines.push('');

// Per-filing table
lines.push('## Per-Filing Results');
lines.push('');
lines.push('| Ticker | Form | Filing Date | Accession | Missing Items | Flags |');
lines.push('|--------|------|-------------|-----------|---------------|-------|');
for (const f of filingResults) {
  const missing = f.missingItems.length > 0 ? f.missingItems.join(', ') : '—';
  const flags = f.flags.length > 0 ? f.flags.map((fl) => fl.replace(/\|/g, '\\|')).join('; ') : (f.error ? `ERROR: ${f.error.slice(0, 80)}` : '—');
  lines.push(`| ${f.ticker} | ${f.form} | ${f.filingDate} | ${f.accession} | ${missing} | ${flags} |`);
}
lines.push('');

// Diff table
lines.push('## Item 1A Diff Results');
lines.push('');
lines.push('| Ticker | Base → Target | +/−/~ | Similarity | Flags |');
lines.push('|--------|---------------|-------|------------|-------|');
for (const d of diffResults) {
  const changes = d.error ? 'ERROR' : `+${d.stats.added} −${d.stats.removed} ~${d.stats.changed}`;
  const sim = d.error ? '—' : d.stats.similarity.toFixed(3);
  const flags = d.flags.length > 0 ? d.flags.join('; ') : (d.error ? d.error.slice(0, 100) : '—');
  lines.push(`| ${d.ticker} | ${d.baseDateStr} → ${d.targetDateStr} | ${changes} | ${sim} | ${flags} |`);
}
lines.push('');

// Distinct warnings
lines.push('## Distinct Warnings');
lines.push('');
const warningCounts = new Map<string, number>();
for (const f of filingResults) {
  for (const w of f.warnings) {
    warningCounts.set(w, (warningCounts.get(w) ?? 0) + 1);
  }
}
if (warningCounts.size === 0) {
  lines.push('No document-level warnings.');
} else {
  lines.push('| Warning | Count |');
  lines.push('|---------|-------|');
  for (const [w, count] of [...warningCounts.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${w.replace(/\|/g, '\\|')} | ${count} |`);
  }
}
lines.push('');

console.log(lines.join('\n'));
process.exit(0);
