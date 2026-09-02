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
const routes: Record<string, string> = {
  'https://www.sec.gov/files/company_tickers.json': JSON.stringify({ '0': { cik_str: 1, ticker: 'ACME', title: 'Acme Robotics, Inc.' } }),
  'https://data.sec.gov/submissions/CIK0000000001.json': JSON.stringify({
    cik: '1',
    filings: {
      recent: {
        accessionNumber: ['0000000001-25-000001', '0000000001-24-000001'],
        form: ['10-K', '10-K'],
        filingDate: ['2026-02-15', '2025-02-15'],
        reportDate: ['2025-12-31', '2024-12-31'],
        primaryDocument: ['acme-10k-2025.htm', 'acme-10k-2024.htm'],
      },
    },
  }),
  'https://www.sec.gov/Archives/edgar/data/1/000000000125000001/acme-10k-2025.htm': fx('acme-10k-2025.htm'),
  'https://www.sec.gov/Archives/edgar/data/1/000000000124000001/acme-10k-2024.htm': fx('acme-10k-2024.htm'),
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
    }
    const overview = tools.find((t) => t.name === 'diff_all_items');
    expect(overview?.annotations?.idempotentHint).toBe(true);
    expect(overview?.description).toMatch(/statistics only.*diff_sections/is);
  });

  it('walks the whole flow: resolve → list → diff', async () => {
    const companies = JSON.parse(text(await mcp.callTool({ name: 'resolve_company', arguments: { query: 'ACME' } })));
    expect(companies[0].cik).toBe('0000000001');

    const filings = JSON.parse(text(await mcp.callTool({ name: 'list_filings', arguments: { cik: '1', form: '10-K' } })));
    expect(filings).toHaveLength(2);

    const diff = JSON.parse(
      text(
        await mcp.callTool({
          name: 'diff_sections',
          arguments: { cik: '1', baseAccession: filings[1].accession, targetAccession: filings[0].accession, item: '1A' },
        }),
      ),
    );
    expect(diff.stats).toMatchObject({ added: 1, removed: 1, changed: 1 });
    expect(diff.truncated).toBe(false);
    const added = diff.changes.find((c: { type: string }) => c.type === 'added');
    expect(added.target.text).toMatch(/tariffs/);
  });

  it('returns the all-Item overview through the MCP protocol', async () => {
    const overview = JSON.parse(
      text(
        await mcp.callTool({
          name: 'diff_all_items',
          arguments: { cik: '1', baseAccession: '0000000001-24-000001', targetAccession: '0000000001-25-000001' },
        }),
      ),
    );
    expect(overview.status).toBe('ok');
    expect(overview.items.map((entry: { item: string }) => entry.item)).toEqual(['7', '1A', '1', '1B', '1C']);
    expect(overview.items[0].stats.similarity).toBeLessThanOrEqual(overview.items[1].stats.similarity);
    expect(overview.onlyInBase).toEqual([]);
    expect(overview.onlyInTarget).toEqual([]);
    expect(JSON.stringify(overview)).not.toContain('changes');
  });

  it('never guesses: unknown item → not_found with availableItems', async () => {
    const r = JSON.parse(text(await mcp.callTool({ name: 'get_section', arguments: { cik: '1', accession: '0000000001-25-000001', item: '9A' } })));
    expect(r.status).toBe('not_found');
    expect(r.availableItems).toEqual(['1', '1A', '1B', '1C', '7']);
  });

  it('validates input shapes before doing any network work', async () => {
    const before = fetchCalls;
    const r = await mcp.callTool({ name: 'get_section', arguments: { cik: 'abc', accession: 'bad', item: '1A' } });
    expect(r.isError).toBe(true);
    expect(fetchCalls).toBe(before);
  });

  it('every change in a diff carries a full citation on its side', async () => {
    const diff = JSON.parse(text(await mcp.callTool({ name: 'diff_sections', arguments: { cik: '1', baseAccession: '0000000001-24-000001', targetAccession: '0000000001-25-000001', item: '1A', maxChanges: 2 } })));
    expect(diff.truncated).toBe(true);
    expect(diff.changes).toHaveLength(2);
    for (const c of diff.changes) {
      for (const side of ['base', 'target'] as const) {
        if (c[side]) expect(c[side].citation).toMatchObject({ cik: '0000000001', item: '1A', itemTitle: 'Risk Factors', paragraph: c[side].paragraph });
      }
    }
  });

  it('announces its rules to the client via instructions', async () => {
    expect(mcp.getInstructions()).toMatch(/verbatim/i);
  });

  it('returns verbatim paragraphs with per-paragraph citations', async () => {
    const r = JSON.parse(text(await mcp.callTool({ name: 'get_section', arguments: { cik: '1', accession: '0000000001-25-000001', item: '1C', maxParagraphs: 2 } })));
    expect(r.status).toBe('ok');
    expect(r.truncated).toBe(true);
    expect(r.paragraphs[0].citation).toMatchObject({ accession: '0000000001-25-000001', item: '1C', paragraph: 0 });
    expect(r.paragraphs[0].text).toMatch(/^We maintain a cybersecurity risk management program/);
  });
});
