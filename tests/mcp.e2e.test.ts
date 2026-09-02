import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EdgarClient } from '../src/edgar/client.js';
import { FilingService } from '../src/service.js';
import { buildServer } from '../src/server.js';

/**
 * End-to-end through the real MCP protocol layer (in-memory transport),
 * against a fake EDGAR. This is what an agent actually sees.
 */
const fx = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const oversizedCybersecurityParagraph = `We require multi-factor authentication for all employees and contractors. ${'Our security program continuously evaluates material risks across systems, suppliers and customer deployments. '.repeat(12)}`;
const routes: Record<string, string> = {
  'https://www.sec.gov/files/company_tickers.json': JSON.stringify({ '0': { cik_str: 1, ticker: 'ACME', title: 'Acme Robotics, Inc.' } }),
  'https://data.sec.gov/submissions/CIK0000000001.json': JSON.stringify({
    cik: '1',
    filings: {
      recent: {
        accessionNumber: ['0000000001-25-000001', '0000000001-24-000001', '0000000001-25-000020', '0000000001-24-000020'],
        form: ['10-K', '10-K', '20-F', '20-F'],
        filingDate: ['2026-02-15', '2025-02-15', '2025-04-01', '2024-04-01'],
        reportDate: ['2025-12-31', '2024-12-31', '2024-12-31', '2023-12-31'],
        primaryDocument: ['acme-10k-2025.htm', 'acme-10k-2024.htm', 'acme-20f-2025.htm', 'acme-20f-2024.htm'],
      },
    },
  }),
  'https://www.sec.gov/Archives/edgar/data/1/000000000125000001/acme-10k-2025.htm': fx('acme-10k-2025.htm').replace(
    'We require multi-factor authentication for all employees and contractors, and we conduct phishing simulations at least twice per year.',
    oversizedCybersecurityParagraph,
  ),
  'https://www.sec.gov/Archives/edgar/data/1/000000000124000001/acme-10k-2024.htm': fx('acme-10k-2024.htm').replace(
    'We require multi-factor authentication for all employees and contractors, and we conduct phishing simulations at least twice per year.',
    oversizedCybersecurityParagraph,
  ),
  'https://www.sec.gov/Archives/edgar/data/1/000000000125000020/acme-20f-2025.htm': fx('acme-20f-2025.htm'),
  'https://www.sec.gov/Archives/edgar/data/1/000000000124000020/acme-20f-2024.htm': fx('acme-20f-2024.htm'),
};
let fetchCalls = 0;
const fakeFetch: typeof fetch = async (input) => {
  fetchCalls++;
  const body = routes[String(input)];
  return body === undefined ? new Response('nope', { status: 404, statusText: 'Not Found' }) : new Response(body, { status: 200 });
};

const mcp = new Client({ name: 'test-client', version: '0.0.0' });
const text = (r: Awaited<ReturnType<Client['callTool']>>): string => {
  const c = (r.content as { type: string; text?: string }[])[0];
  return c?.text ?? '';
};
const call = async (name: string, arguments_: Record<string, unknown>): Promise<Record<string, any>> => {
  const result = await mcp.callTool({ name, arguments: arguments_ });
  const parsed = JSON.parse(text(result)) as Record<string, any>;
  expect(result.structuredContent).toBeDefined();
  const structured = result.structuredContent as Record<string, any>;
  expect(structured).toEqual(parsed);
  expect(text(result)).toBe(JSON.stringify(structured));
  return structured;
};

beforeAll(async () => {
  const client = new EdgarClient({ userAgent: 'e2e tests@example.com', fetchImpl: fakeFetch, minIntervalMs: 0 });
  const server = buildServer(client, new FilingService(client));
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await mcp.connect(b);
});

describe('MCP surface', () => {
  it('exposes exactly the seven read-only tools', async () => {
    const { tools } = await mcp.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['diff_all_items', 'diff_sections', 'get_section', 'list_filings', 'list_items', 'resolve_company', 'search_filing']);
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint).toBe(true);
      expect(t.annotations?.destructiveHint).toBe(false);
      expect(t.outputSchema).toBeDefined();
      expect(t.outputSchema?.type).toBe('object');
    }
    for (const name of ['get_section', 'diff_all_items', 'diff_sections', 'search_filing']) {
      const tool = tools.find((t) => t.name === name);
      expect(tool?.outputSchema).toMatchObject({ properties: { status: { enum: ['ok', 'not_found'] } } });
      expect(tool?.outputSchema?.properties).not.toHaveProperty('result');
    }
    const overview = tools.find((t) => t.name === 'diff_all_items');
    expect(overview?.annotations?.idempotentHint).toBe(true);
    expect(overview?.description).toMatch(/statistics only.*diff_sections/is);
  });

  it('walks the whole flow: resolve → list → diff', async () => {
    const { results: companies } = await call('resolve_company', { query: 'ACME' });
    expect(companies[0].cik).toBe('0000000001');

    const { results: filings } = await call('list_filings', { cik: '1', form: '10-K' });
    expect(filings).toHaveLength(2);

    const diff = await call('diff_sections', {
      cik: '1',
      baseAccession: filings[1].accession,
      targetAccession: filings[0].accession,
      item: '1A',
    });
    expect(diff.status).toBe('ok');
    expect(diff.stats).toMatchObject({ added: 1, removed: 1, changed: 1, similarity: 0.827 });
    expect(diff).toMatchObject({ offset: 0, returned: 3, total: 3, truncated: false });
    expect(diff.changes.find((c: { type: string }) => c.type === 'changed')).not.toHaveProperty('wordDiff');
    const added = diff.changes.find((c: { type: string }) => c.type === 'added');
    expect(added.target.text).toMatch(/tariffs/);
  });

  it('returns the all-Item overview through the MCP protocol', async () => {
    const overview = await call('diff_all_items', {
      cik: '1',
      baseAccession: '0000000001-24-000001',
      targetAccession: '0000000001-25-000001',
    });
    expect(overview.status).toBe('ok');
    expect(overview.items.map((entry: { item: string }) => entry.item)).toEqual(['7', '1A', '1', '1B', '1C']);
    expect(overview.items.slice(0, 2).map((entry: { stats: { similarity: number } }) => entry.stats.similarity)).toEqual([0.799, 0.827]);
    expect(overview.onlyInBase).toEqual([]);
    expect(overview.onlyInTarget).toEqual([]);
    expect(JSON.stringify(overview)).not.toContain('changes');
  });

  it('never guesses: unknown item → not_found with availableItems', async () => {
    const r = await call('get_section', { cik: '1', accession: '0000000001-25-000001', item: '9A' });
    expect(r.status).toBe('not_found');
    expect(r.availableItems).toEqual(['1', '1A', '1B', '1C', '7']);
  });

  it('validates input shapes before doing any network work', async () => {
    const before = fetchCalls;
    const r = await mcp.callTool({ name: 'get_section', arguments: { cik: 'abc', accession: 'bad', item: '1A' } });
    expect(r.isError).toBe(true);
    expect(r.structuredContent).toBeUndefined();
    expect(fetchCalls).toBe(before);
  });

  it('every change in a diff carries a full citation on its side', async () => {
    const diff = await call('diff_sections', {
      cik: '1',
      baseAccession: '0000000001-24-000001',
      targetAccession: '0000000001-25-000001',
      item: '1A',
      maxChanges: 2,
    });
    expect(diff.truncated).toBe(true);
    expect(diff.truncatedReason).toMatch(/maxChanges=2/);
    expect(diff.changes).toHaveLength(2);
    expect(diff).toMatchObject({ offset: 0, returned: 2, total: 3 });
    for (const c of diff.changes) {
      for (const side of ['base', 'target'] as const) {
        if (c[side]) expect(c[side].citation).toMatchObject({ cik: '0000000001', item: '1A', itemTitle: 'Risk Factors', paragraph: c[side].paragraph });
      }
    }
  });

  it('pages through a fixture diff without losing or repeating changes', async () => {
    const args = {
      cik: '1',
      baseAccession: '0000000001-24-000001',
      targetAccession: '0000000001-25-000001',
      item: '1A',
    };
    const full = await call('diff_sections', args);
    const first = await call('diff_sections', { ...args, maxChanges: 2 });
    const second = await call('diff_sections', { ...args, maxChanges: 2, offset: first.offset + first.returned });

    expect(first).toMatchObject({ offset: 0, returned: 2, total: full.total, truncated: true });
    expect(second).toMatchObject({ offset: 2, returned: 1, total: full.total, truncated: false });
    expect([...first.changes, ...second.changes]).toEqual(full.changes);
  });

  it('uses each filing\'s own Item title in diff citations', async () => {
    const diff = await call('diff_sections', {
      cik: '1',
      baseAccession: '0000000001-24-000020',
      targetAccession: '0000000001-25-000020',
      item: '3',
    });
    expect(diff).toMatchObject({ status: 'ok', title: 'Key Information', targetTitle: 'Key Information and Company Overview' });
    const changed = diff.changes.find((change: { type: string }) => change.type === 'changed');
    expect(changed.base.citation.itemTitle).toBe('Key Information');
    expect(changed.target.citation.itemTitle).toBe('Key Information and Company Overview');
  });

  it('announces its rules to the client via instructions', async () => {
    expect(mcp.getInstructions()).toMatch(/verbatim/i);
    expect(mcp.getInstructions()).toMatch(/raise maxChars.*offset = offset \+ returned/i);
    const { tools } = await mcp.listTools();
    for (const name of ['get_section', 'diff_sections', 'search_filing']) {
      expect(tools.find((tool) => tool.name === name)?.description).toMatch(/offset = offset \+ returned/i);
    }
  });

  it('returns verbatim paragraphs with per-paragraph citations', async () => {
    const r = await call('get_section', { cik: '1', accession: '0000000001-25-000001', item: '1C', maxParagraphs: 2 });
    expect(r.status).toBe('ok');
    expect(r).toMatchObject({ offset: 0, returned: 2, truncated: true });
    expect(r.total).toBeGreaterThan(r.returned);
    expect(r.truncatedReason).toMatch(/maxParagraphs=2/);
    expect(r.paragraphs[0].citation).toMatchObject({ accession: '0000000001-25-000001', item: '1C', paragraph: 0 });
    expect(r.paragraphs[0].text).toMatch(/^We maintain a cybersecurity risk management program/);

    const next = await call('get_section', {
      cik: '1',
      accession: '0000000001-25-000001',
      item: '1C',
      offset: r.offset + r.returned,
      maxParagraphs: 2,
    });
    expect(next).toMatchObject({ offset: 2, total: r.total });
    expect(next.paragraphs[0].citation.paragraph).toBe(2);
  });

  it('returns typed item listings and cited search matches', async () => {
    const items = await call('list_items', { cik: '1', accession: '0000000001-25-000001' });
    expect(items.items.map((item: { key: string }) => item.key)).toEqual(['1', '1A', '1B', '1C', '7']);
    expect(items.items.find((item: { key: string }) => item.key === '1B').warnings.join(' ')).toMatch(/placeholder/);

    const search = await call('search_filing', {
      cik: '1',
      accession: '0000000001-25-000001',
      pattern: 'tariffs',
      item: '1A',
    });
    expect(search.status).toBe('ok');
    expect(search.matches[0].citation).toMatchObject({ item: '1A', paragraph: 4 });
    expect(search.matches[0].text).toMatch(/tariffs/);
    expect(search).toMatchObject({ offset: 0, returned: 1, total: 1, truncated: false });

    const warnedSearch = await call('search_filing', {
      cik: '1',
      accession: '0000000001-25-000001',
      pattern: 'None',
      item: '1B',
    });
    expect(warnedSearch.warnings.join(' ')).toMatch(/placeholder/);

    const allMatches = await call('search_filing', {
      cik: '1',
      accession: '0000000001-25-000001',
      pattern: '.',
      item: '1A',
      limit: 200,
    });
    const matchPage = await call('search_filing', {
      cik: '1',
      accession: '0000000001-25-000001',
      pattern: '.',
      item: '1A',
      offset: 1,
      limit: 2,
    });
    expect(matchPage).toMatchObject({ offset: 1, returned: 2, total: allMatches.total, truncated: true });
    expect(matchPage.matches).toEqual(allMatches.matches.slice(1, 3));
  });

  it('makes word-level diffs opt-in', async () => {
    const diff = await call('diff_sections', {
      cik: '1',
      baseAccession: '0000000001-24-000001',
      targetAccession: '0000000001-25-000001',
      item: '1A',
      includeWordDiff: true,
    });
    expect(diff.changes.find((c: { type: string }) => c.type === 'changed').wordDiff).toBeDefined();
  });

  it('drops trailing entries to stay within maxChars and reports truncation', async () => {
    const section = await call('get_section', {
      cik: '1',
      accession: '0000000001-25-000001',
      item: '1A',
      maxChars: 1000,
    });
    expect(JSON.stringify(section.paragraphs).length).toBeLessThanOrEqual(1000);
    expect(section).toMatchObject({ truncated: true, truncatedReason: expect.stringMatching(/maxChars=1000/) });

    const diff = await call('diff_sections', {
      cik: '1',
      baseAccession: '0000000001-24-000001',
      targetAccession: '0000000001-25-000001',
      item: '1A',
      maxChars: 1000,
    });
    expect(JSON.stringify(diff.changes).length).toBeLessThanOrEqual(1000);
    expect(diff).toMatchObject({ truncated: true, truncatedReason: expect.stringMatching(/maxChars=1000/) });

    const search = await call('search_filing', {
      cik: '1',
      accession: '0000000001-25-000001',
      pattern: '.',
      item: '1A',
      maxChars: 1000,
    });
    expect(JSON.stringify(search.matches).length).toBeLessThanOrEqual(1000);
    expect(search).toMatchObject({ truncated: true, truncatedReason: expect.stringMatching(/maxChars=1000/) });

    const oversized = await call('get_section', {
      cik: '1',
      accession: '0000000001-25-000001',
      item: '1C',
      offset: 2,
      maxChars: 1000,
    });
    expect(oversized).toMatchObject({
      offset: 2,
      returned: 0,
      truncated: true,
      truncatedReason: 'entry at offset 2 alone exceeds maxChars=1000; raise maxChars.',
    });
  });
});
