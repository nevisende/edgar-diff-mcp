/**
 * Live smoke test against real EDGAR. Not part of `npm test` (needs network).
 *
 *   EDGAR_USER_AGENT="edgar-diff-mcp/0.1 you@example.com" npm run smoke:live -- AAPL
 *
 * Diffs Item 1A (Risk Factors) between the two most recent 10-Ks of the given ticker
 * and prints the summary. Exit code 1 if anything is not_found; that is a real
 * parser gap worth a fixture, not something to paper over.
 */
import { EdgarClient } from '../src/edgar/client.js';
import { FileCache } from '../src/edgar/cache.js';
import { FilingService } from '../src/service.js';

const ticker = process.argv[2] ?? 'AAPL';
const item = process.argv[3] ?? '1A';
const ua = process.env['EDGAR_USER_AGENT'] ?? '';
if (!/@/.test(ua)) throw new Error('Set EDGAR_USER_AGENT with a contact email.');

const client = new EdgarClient({ userAgent: ua, cache: new FileCache('.edgar-cache') });
const service = new FilingService(client);

const [company] = await client.resolveCompany(ticker);
if (!company) throw new Error(`No company for ${ticker}`);
const [newer, older] = await client.listFilings(company.cik, { form: '10-K', limit: 2 });
if (!newer || !older) throw new Error('Need two 10-Ks');
console.log(`${company.name} (CIK ${company.cik})\n  base:   ${older.filingDate} ${older.accession}\n  target: ${newer.filingDate} ${newer.accession}\n`);

const items = await service.listItems(newer);
console.log('Items found in target:', items.items.map((i) => `${i.key}(${i.paragraphs} paragraphs)`).join(' '));
if (items.warnings.length) console.log('warnings:', items.warnings);

const d = await service.diff(older, newer, item);
if (d.status !== 'ok') {
  console.error('NOT FOUND:', JSON.stringify(d, null, 2));
  process.exit(1);
}
console.log(`\nItem ${d.item} ${d.title}: +${d.stats.added} -${d.stats.removed} ~${d.stats.changed} (similarity ${d.stats.similarity})`);
for (const c of d.changes.slice(0, 5)) {
  const t = c.type === 'removed' ? c.base?.text : c.target?.text;
  console.log(`\n[${c.type}] ${(t ?? '').slice(0, 220)}...`);
}
