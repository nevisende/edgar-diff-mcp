import { describe, expect, it } from 'vitest';
import { EdgarClient } from '../src/edgar/client.js';

const MAIN_URL = 'https://data.sec.gov/submissions/CIK0000000001.json';
const PAGE_URL = 'https://data.sec.gov/submissions/CIK0000000001-submissions-001.json';

function filings(accessions: string[], forms: string[]) {
  return {
    accessionNumber: accessions,
    form: forms,
    filingDate: accessions.map(() => '2025-01-01'),
    reportDate: accessions.map(() => '2024-12-31'),
    primaryDocument: accessions.map((_, index) => `filing-${index}.htm`),
  };
}

describe('EdgarClient paginated submissions', () => {
  it('loads and memoises older submission pages for filtered lists and accession lookup', async () => {
    const calls: string[] = [];
    const routes: Record<string, unknown> = {
      [MAIN_URL]: {
        filings: {
          recent: filings(['0000000001-25-000001', '0000000001-25-000002'], ['10-K', '8-K']),
          files: [{ name: 'CIK0000000001-submissions-001.json' }],
        },
      },
      [PAGE_URL]: filings(['0000000001-24-000001', '0000000001-23-000001'], ['10-K', '10-K']),
    };
    const client = new EdgarClient({
      userAgent: 'pagination tests@example.com',
      minIntervalMs: 0,
      fetchImpl: async (input) => {
        const url = String(input);
        calls.push(url);
        return new Response(JSON.stringify(routes[url]), { status: routes[url] === undefined ? 404 : 200 });
      },
    });

    await expect(client.listFilings('1', { form: '10-K', limit: 2 })).resolves.toMatchObject([
      { accession: '0000000001-25-000001' },
      { accession: '0000000001-24-000001' },
    ]);
    await expect(client.findFiling('1', '0000000001-23-000001')).resolves.toMatchObject({ accession: '0000000001-23-000001' });
    expect(calls).toEqual([MAIN_URL, PAGE_URL]);
  });

  it('validates supplemental submission pages', async () => {
    const client = new EdgarClient({
      userAgent: 'pagination tests@example.com',
      minIntervalMs: 0,
      fetchImpl: async (input) => new Response(JSON.stringify(String(input) === MAIN_URL
        ? { filings: { recent: filings([], []), files: [{ name: 'CIK0000000001-submissions-001.json' }] } }
        : { accessionNumber: 'not-an-array' }), { status: 200 }),
    });

    await expect(client.listFilings('1', { form: '10-K', limit: 1 })).rejects.toThrow(/did not match the expected shape/);
  });
});

describe('EdgarClient request retries', () => {
  it('retries network errors and succeeds on the third attempt', async () => {
    let attempts = 0;
    const client = new EdgarClient({
      userAgent: 'retry tests@example.com',
      minIntervalMs: 0,
      fetchImpl: async () => {
        attempts++;
        if (attempts < 3) throw new TypeError('socket closed');
        return new Response('recovered', { status: 200 });
      },
    });

    await expect(client.getText('https://example.test/retry')).resolves.toBe('recovered');
    expect(attempts).toBe(3);
  });

  it('stops after three 429 responses and includes the URL in the error', async () => {
    let attempts = 0;
    const client = new EdgarClient({
      userAgent: 'retry tests@example.com',
      minIntervalMs: 0,
      fetchImpl: async () => {
        attempts++;
        return new Response('slow down', { status: 429, statusText: 'Too Many Requests' });
      },
    });
    const url = 'https://example.test/always-throttled';

    await expect(client.getText(url)).rejects.toThrow(new RegExp(`429.*${url}`));
    expect(attempts).toBe(3);
  });
});
