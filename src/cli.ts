#!/usr/bin/env node
/**
 * edgar-diff — the same read-only operations as the MCP server, for humans.
 *
 *   edgar-diff resolve AAPL
 *   edgar-diff filings 320193 --form 10-K --limit 3
 *   edgar-diff items 320193 0000320193-24-000123
 *   edgar-diff section 320193 0000320193-24-000123 1A
 *   edgar-diff diff 320193 <olderAccession> <newerAccession> 1A [--json]
 *   edgar-diff diff-all 320193 <olderAccession> <newerAccession>
 *   edgar-diff search 320193 0000320193-24-000123 "tariff|export control" [--item 1A]
 */
import { EdgarClient } from './edgar/client.js';
import { FileCache } from './edgar/cache.js';
import { FilingService } from './service.js';
import { printDiff, printDiffAll, RED, RESET } from './format.js';

const argv = process.argv.slice(2);
const flags = new Map<string, string | true>();
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i] ?? '';
  if (a.startsWith('--')) {
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(a.slice(2), next);
      i++;
    } else flags.set(a.slice(2), true);
  } else positional.push(a);
}
const str = (k: string): string | undefined => {
  const v = flags.get(k);
  return typeof v === 'string' ? v : undefined;
};

const ua = process.env['EDGAR_USER_AGENT'] ?? '';
if (!/@/.test(ua)) {
  console.error('Set EDGAR_USER_AGENT="edgar-diff/0.1 you@example.com" — the SEC requires a contact address.');
  process.exit(2);
}
// Opt-in, same as the server. Filings are large; set EDGAR_CACHE_DIR to keep them.
const cacheDir = process.env['EDGAR_CACHE_DIR'];
const client = new EdgarClient({ userAgent: ua, ...(cacheDir ? { cache: new FileCache(cacheDir) } : {}) });
const service = new FilingService(client);
const out = (v: unknown) => console.log(JSON.stringify(v, null, 2));

async function main(): Promise<void> {
  const [cmd, ...rest] = positional;
  switch (cmd) {
    case 'resolve': {
      const [q] = rest;
      if (!q) throw new Error('usage: resolve <ticker|name|cik>');
      return out(await client.resolveCompany(q));
    }
    case 'filings': {
      const [cik] = rest;
      if (!cik) throw new Error('usage: filings <cik> [--form 10-K] [--limit N]');
      const opts: { form?: string; limit?: number } = { limit: Number(str('limit') ?? 10) };
      const form = str('form');
      if (form) opts.form = form;
      return out(await client.listFilings(cik, opts));
    }
    case 'items': {
      const [cik, acc] = rest;
      if (!cik || !acc) throw new Error('usage: items <cik> <accession>');
      return out(await service.listItems(await service.resolveFiling(cik, acc)));
    }
    case 'section': {
      const [cik, acc, item] = rest;
      if (!cik || !acc || !item) throw new Error('usage: section <cik> <accession> <item>');
      return out(await service.getSection(await service.resolveFiling(cik, acc), item));
    }
    case 'diff': {
      const [cik, a, b, item] = rest;
      if (!cik || !a || !b || !item) throw new Error('usage: diff <cik> <olderAccession> <newerAccession> <item> [--json] [--all]');
      const d = await service.diff(await service.resolveFiling(cik, a), await service.resolveFiling(cik, b), item, flags.has('all'));
      if (d.status !== 'ok') return out(d);
      return flags.has('json') ? out(d) : printDiff(d);
    }
    case 'diff-all': {
      const [cik, baseAccession, targetAccession] = rest;
      if (!cik || !baseAccession || !targetAccession) throw new Error('usage: diff-all <cik> <baseAccession> <targetAccession>');
      const d = await service.diffAll(await service.resolveFiling(cik, baseAccession), await service.resolveFiling(cik, targetAccession));
      return d.status === 'ok' ? printDiffAll(d) : out(d);
    }
    case 'search': {
      const [cik, acc, pattern] = rest;
      if (!cik || !acc || !pattern) throw new Error('usage: search <cik> <accession> <pattern> [--item 1A] [--limit N]');
      return out(await service.search(await service.resolveFiling(cik, acc), pattern, str('item'), Number(str('limit') ?? 20)));
    }
    default:
      console.error('commands: resolve | filings | items | section | diff | diff-all | search');
      process.exit(2);
  }
}

main().catch((e: Error) => {
  console.error(`${RED}${e.message}${RESET}`);
  process.exit(1);
});
