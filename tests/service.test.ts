import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EdgarClient } from '../src/edgar/client.js';
import { FilingService } from '../src/service.js';
import type { FilingRef } from '../src/types.js';

const fx = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

/** A fake EDGAR: tickers file, one submissions file, two documents. */
const routes: Record<string, string> = {
  'https://www.sec.gov/files/company_tickers.json': JSON.stringify({
    '0': { cik_str: 1, ticker: 'ACME', title: 'Acme Robotics, Inc.' },
    '1': { cik_str: 2, ticker: 'ZZZ', title: 'Zeta Zebras Corp' },
  }),
  'https://data.sec.gov/submissions/CIK0000000001.json': JSON.stringify({
    cik: '1',
    filings: {
      recent: {
        accessionNumber: ['0000000001-25-000001', '0000000001-24-000001', '0000000001-24-000009'],
        form: ['10-K', '10-K', '8-K'],
        filingDate: ['2026-02-15', '2025-02-15', '2024-11-01'],
        reportDate: ['2025-12-31', '2024-12-31', ''],
        primaryDocument: ['acme-10k-2025.htm', 'acme-10k-2024.htm', 'acme-8k.htm'],
      },
    },
  }),
  'https://www.sec.gov/Archives/edgar/data/1/000000000125000001/acme-10k-2025.htm': fx('acme-10k-2025.htm'),
  'https://www.sec.gov/Archives/edgar/data/1/000000000124000001/acme-10k-2024.htm': fx('acme-10k-2024.htm'),
};

const calls: { url: string; ua: string | undefined }[] = [];
const fakeFetch: typeof fetch = async (input, init) => {
  const url = String(input);
  const headers = init?.headers as Record<string, string> | undefined;
  calls.push({ url, ua: headers?.['User-Agent'] });
  const body = routes[url];
  if (body === undefined) return new Response('not found', { status: 404, statusText: 'Not Found' });
  return new Response(body, { status: 200 });
};

const client = new EdgarClient({ userAgent: 'edgar-diff-mcp-tests tests@example.com', fetchImpl: fakeFetch, minIntervalMs: 0 });
const service = new FilingService(client);

describe('EdgarClient', () => {
  it('refuses a User-Agent without a contact address', () => {
    expect(() => new EdgarClient({ userAgent: 'anonymous' })).toThrow(/contact email/);
  });

  it('sends the User-Agent on every request', async () => {
    await client.resolveCompany('ACME');
    expect(calls.at(-1)?.ua).toMatch(/@/);
  });

  it('resolves by ticker exactly and by name loosely', async () => {
    expect(await client.resolveCompany('acme')).toEqual([{ cik: '0000000001', ticker: 'ACME', name: 'Acme Robotics, Inc.' }]);
    expect((await client.resolveCompany('zebra'))[0]?.ticker).toBe('ZZZ');
    expect(await client.resolveCompany('nothing-here')).toEqual([]);
  });

  it('lists filings filtered by form and builds archive URLs', async () => {
    const tenKs = await client.listFilings('1', { form: '10-K' });
    expect(tenKs.map((f) => f.accession)).toEqual(['0000000001-25-000001', '0000000001-24-000001']);
    expect(tenKs[0]!.url).toBe('https://www.sec.gov/Archives/edgar/data/1/000000000125000001/acme-10k-2025.htm');
    expect(tenKs[0]!.reportDate).toBe('2025-12-31');
  });

  it('surfaces HTTP errors instead of returning empty text', async () => {
    await expect(client.getText('https://www.sec.gov/nope')).rejects.toThrow(/404/);
  });
});

describe('FilingService', () => {
  it('lists items with sizes', async () => {
    const ref = await service.resolveFiling('1', '0000000001-24-000001');
    const { items, warnings } = await service.listItems(ref);
    expect(items.map((i) => i.key)).toEqual(['1', '1A', '1B', '1C', '7']);
    expect(warnings).toEqual([]);
  });

  it('returns not_found with the available items instead of guessing', async () => {
    const ref = await service.resolveFiling('1', '0000000001-24-000001');
    const r = await service.getSection(ref, '9A');
    expect(r.status).toBe('not_found');
    if (r.status === 'not_found') {
      expect(r.availableItems).toContain('1A');
      expect(r.reason).toMatch(/not found/);
    }
  });

  it('diffs Risk Factors between the two 10-Ks', async () => {
    const base = await service.resolveFiling('1', '0000000001-24-000001');
    const target = await service.resolveFiling('1', '0000000001-25-000001');
    const d = await service.diff(base, target, 'item 1a');
    expect(d.status).toBe('ok');
    if (d.status === 'ok') {
      expect(d.stats).toMatchObject({ added: 1, removed: 1, changed: 1, similarity: 0.827 });
      expect(d.changes.every((c) => c.type !== 'unchanged')).toBe(true);
    }
  });

  it('summarises every shared Item with most-changed first and no paragraphs', async () => {
    const base = await service.resolveFiling('1', '0000000001-24-000001');
    const target = await service.resolveFiling('1', '0000000001-25-000001');
    const d = await service.diffAll(base, target);
    expect(d.status).toBe('ok');
    if (d.status !== 'ok') return;

    expect(d).toMatchObject({ status: 'ok', base, target, onlyInBase: [], onlyInTarget: [] });
    expect(d.items.map((entry) => entry.item)).toEqual(['7', '1A', '1', '1B', '1C']);
    expect(d.items.map((entry) => entry.stats.similarity)).toEqual([...d.items.map((entry) => entry.stats.similarity)].sort((a, b) => a - b));
    expect(d.items.find((entry) => entry.item === '7')?.stats.similarity).toBe(0.799);
    expect(d.items.find((entry) => entry.item === '1A')?.stats).toMatchObject({ added: 1, removed: 1, changed: 1, similarity: 0.827 });
    expect(Object.keys(d.items[0] ?? {}).sort()).toEqual(['item', 'stats', 'title']);
    expect(d.items.every((entry) => !('changes' in entry))).toBe(true);
  });

  it('reports Items found on only one side', async () => {
    const baseHtml = fx('acme-10k-2024.htm');
    const targetHtml = fx('acme-10k-2025.htm').replaceAll('Item 1B.', 'Item 2.').replaceAll('Item&#160;1B.', 'Item&#160;2.');
    const { service: isolated, refs } = serviceForDocuments({ base: baseHtml, target: targetHtml });
    const d = await isolated.diffAll(refs.base, refs.target);
    expect(d.status).toBe('ok');
    if (d.status !== 'ok') return;
    expect(d.onlyInBase).toEqual([{ item: '1B', title: 'Unresolved Staff Comments' }]);
    expect(d.onlyInTarget).toEqual([{ item: '2', title: 'Properties' }]);
    expect(d.items.map((entry) => entry.item)).not.toContain('1B');
    expect(d.items.map((entry) => entry.item)).not.toContain('2');
  });

  it('returns not_found for either filing when parsing yields zero Items', async () => {
    const { service: missingBase, refs: baseRefs } = serviceForDocuments({ base: '<html><body>No filing Items here.</body></html>', target: fx('acme-10k-2025.htm') });
    await expect(missingBase.diffAll(baseRefs.base, baseRefs.target)).resolves.toMatchObject({
      status: 'not_found',
      side: 'base',
      filing: baseRefs.base,
      reason: expect.stringMatching(/No .*Item/i),
    });

    const { service: missingTarget, refs: targetRefs } = serviceForDocuments({ base: fx('acme-10k-2024.htm'), target: '<html><body>No filing Items here.</body></html>' });
    await expect(missingTarget.diffAll(targetRefs.base, targetRefs.target)).resolves.toMatchObject({
      status: 'not_found',
      side: 'target',
      filing: targetRefs.target,
      reason: expect.stringMatching(/No .*Item/i),
    });
  });

  it('reports which side is missing an item', async () => {
    const base = await service.resolveFiling('1', '0000000001-24-000001');
    const target = await service.resolveFiling('1', '0000000001-25-000001');
    const d = await service.diff(base, target, '7A');
    expect(d).toMatchObject({ status: 'not_found', side: 'base' });
  });

  it('searches verbatim paragraphs with citations', async () => {
    const ref = await service.resolveFiling('1', '0000000001-25-000001');
    const r = await service.search(ref, 'tariff', '1A');
    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(r.matches).toHaveLength(1);
    expect(r.matches[0]!.citation).toMatchObject({ item: '1A', itemTitle: 'Risk Factors', accession: '0000000001-25-000001' });
    expect(r.matches[0]!.text).toMatch(/^Changes in trade policy/);
  });

  it('search on an unknown item is not_found, not an empty list', async () => {
    const ref = await service.resolveFiling('1', '0000000001-25-000001');
    const r = await service.search(ref, 'tariff', '9A');
    expect(r).toMatchObject({ status: 'not_found', item: '9A' });
  });

  it('diffs MD&A including the changed table row', async () => {
    const base = await service.resolveFiling('1', '0000000001-24-000001');
    const target = await service.resolveFiling('1', '0000000001-25-000001');
    const d = await service.diff(base, target, '7');
    expect(d.status).toBe('ok');
    if (d.status !== 'ok') return;
    // Revenue paragraph is an edit; the table row shares no word bigrams after the numbers change,
    // so it is reported conservatively as remove+add rather than as an invented edit.
    expect(d.stats).toMatchObject({ changed: 1, added: 1, removed: 1 });
    expect(d.changes.find((c) => c.type === 'removed')?.base?.text).toBe('Hardware $243.5 million 12%');
    expect(d.changes.find((c) => c.type === 'added')?.target?.text).toBe('Hardware $286.9 million 18%');
  });

  it('fetches the submissions index once per CIK and never caches it on disk', async () => {
    const seen: string[] = [];
    const store = new Map<string, string>();
    const cache = { get: async (k: string) => store.get(k), set: async (k: string, v: string) => void store.set(k, v) };
    const c = new EdgarClient({ userAgent: 'x y@example.com', fetchImpl: async (i, init) => { seen.push(String(i)); return fakeFetch(i, init); }, minIntervalMs: 0, cache });
    await c.listFilings('1', { form: '10-K' });
    await c.listFilings('1', { form: '8-K' });
    await c.findFiling('1', '0000000001-24-000001');
    expect(seen.filter((u) => u.includes('/submissions/'))).toHaveLength(1);
    expect([...store.keys()].some((k) => k.includes('/submissions/'))).toBe(false);
  });

  it('turns EDGAR schema drift into a readable error', async () => {
    const c = new EdgarClient({ userAgent: 'x y@example.com', minIntervalMs: 0, fetchImpl: async () => new Response(JSON.stringify({ filings: {} }), { status: 200 }) });
    await expect(c.listFilings('1')).rejects.toThrow(/did not match the expected shape/);
  });

  it('rejects an invalid regex loudly', async () => {
    const ref = await service.resolveFiling('1', '0000000001-25-000001');
    await expect(service.search(ref, '(')).rejects.toThrow(/Invalid pattern/);
  });
});

function serviceForDocuments(documents: { base: string; target: string }): { service: FilingService; refs: { base: FilingRef; target: FilingRef } } {
  const refs = {
    base: { cik: '0000000001', accession: '0000000001-24-000001', form: '10-K', filingDate: '2025-02-15', url: 'https://example.test/base.htm' },
    target: { cik: '0000000001', accession: '0000000001-25-000001', form: '10-K', filingDate: '2026-02-15', url: 'https://example.test/target.htm' },
  } satisfies { base: FilingRef; target: FilingRef };
  const byUrl: Record<string, string> = { [refs.base.url]: documents.base, [refs.target.url]: documents.target };
  const fake = new EdgarClient({
    userAgent: 'diff-all tests@example.com',
    minIntervalMs: 0,
    fetchImpl: async (input) => new Response(byUrl[String(input)] ?? 'not found', { status: byUrl[String(input)] === undefined ? 404 : 200 }),
  });
  return { service: new FilingService(fake), refs };
}
