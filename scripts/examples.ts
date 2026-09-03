import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { FileCache } from '../src/edgar/cache.js';
import { EdgarClient } from '../src/edgar/client.js';
import { FilingService } from '../src/service.js';
import { buildServer } from '../src/server.js';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const EXAMPLES_DIR = join(REPO, 'examples');
const MCP_DIR = join(EXAMPLES_DIR, 'mcp');
const CLI_DIR = join(EXAMPLES_DIR, 'cli');
const USER_AGENT = process.env['EDGAR_USER_AGENT'] ?? 'edgar-diff-mcp/0.1 furkandenizhan@gmail.com';
const CACHE_DIR = process.env['EDGAR_CACHE_DIR'] ?? join(REPO, '.edgar-cache');
const TSX_CLI = fileURLToPath(import.meta.resolve('tsx/cli'));
const MAX_CHARS = 32_000;

interface ToolStep {
  tool: string;
  input: Record<string, unknown>;
  structuredContent: Record<string, unknown>;
}

interface CliCall {
  display: string;
  args: string[];
}

interface ExampleCase extends ToolStep {
  id: string;
  name: string;
  inputSummary: string;
  notice: string;
  cliCalls?: CliCall[];
}

interface MultiStepCase {
  id: string;
  name: string;
  tool: string;
  inputSummary: string;
  notice: string;
  steps: ToolStep[];
  cliCalls?: CliCall[];
}

type GeneratedCase = ExampleCase | MultiStepCase;

function isMultiStep(example: GeneratedCase): example is MultiStepCase {
  return 'steps' in example;
}

function firstObjectAt(value: Record<string, unknown>, key: string): Record<string, unknown> {
  const entries = value[key];
  const first = Array.isArray(entries) ? entries[0] : undefined;
  if (typeof first !== 'object' || first === null) throw new Error(`Expected ${key}[0] in tool output.`);
  return first as Record<string, unknown>;
}

function stringAt(value: Record<string, unknown>, key: string): string {
  const entry = value[key];
  if (typeof entry !== 'string') throw new Error(`Expected string field ${key} in tool output.`);
  return entry;
}

function cli(display: string, ...args: string[]): CliCall {
  return { display, args };
}

function stripAnsi(value: string): string {
  return value
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trimEnd();
}

async function runCli(call: CliCall): Promise<string> {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [TSX_CLI, join(REPO, 'src/cli.ts'), ...call.args], {
      cwd: REPO,
      env: { ...process.env, EDGAR_USER_AGENT: USER_AGENT, EDGAR_CACHE_DIR: CACHE_DIR },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`CLI command failed (${call.display}): ${stripAnsi(stderr)}`));
        return;
      }
      resolve(stripAnsi(stdout));
    });
  });
}

function jsonText(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const edgar = new EdgarClient({ userAgent: USER_AGENT, cache: new FileCache(CACHE_DIR) });
const server = buildServer(edgar, new FilingService(edgar));
const mcp = new Client({ name: 'edgar-diff-example-generator', version: '0.1.0' });
const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();

await server.connect(serverTransport);
await mcp.connect(clientTransport);

async function callTool(tool: string, input: Record<string, unknown>): Promise<ToolStep> {
  const result = await mcp.callTool({ name: tool, arguments: input });
  if (result.isError) throw new Error(`${tool} returned an MCP error: ${JSON.stringify(result.content)}`);
  if (typeof result.structuredContent !== 'object' || result.structuredContent === null) {
    throw new Error(`${tool} returned no structuredContent.`);
  }
  const structuredContent = result.structuredContent as Record<string, unknown>;
  const textContent = Array.isArray(result.content)
    ? result.content.find((entry): entry is { type: 'text'; text: string } => {
        if (typeof entry !== 'object' || entry === null) return false;
        const candidate = entry as Record<string, unknown>;
        return candidate['type'] === 'text' && typeof candidate['text'] === 'string';
      })
    : undefined;
  if (!textContent || JSON.stringify(structuredContent) !== textContent.text) {
    throw new Error(`${tool} text and structuredContent differ.`);
  }
  return { tool, input, structuredContent };
}

const examples: GeneratedCase[] = [];

try {
  const aaplResolve = await callTool('resolve_company', { query: 'AAPL' });
  examples.push({
    id: '01',
    name: 'resolve-company',
    ...aaplResolve,
    inputSummary: '`query: "AAPL"`',
    notice: 'An exact ticker resolves to a padded CIK that can be passed directly to the other tools.',
    cliCalls: [cli('npm run cli -- resolve AAPL', 'resolve', 'AAPL')],
  });

  const aaplFilings = await callTool('list_filings', { cik: '0000320193', form: '10-K', limit: 3 });
  examples.push({
    id: '02',
    name: 'list-filings-aapl',
    ...aaplFilings,
    inputSummary: 'AAPL 10-K filings, limit 3',
    notice: 'Each filing includes the accession and immutable SEC Archives URL needed by later calls.',
    cliCalls: [cli('npm run cli -- filings 0000320193 --form 10-K --limit 3', 'filings', '0000320193', '--form', '10-K', '--limit', '3')],
  });
  const aaplLatest = stringAt(firstObjectAt(aaplFilings.structuredContent, 'results'), 'accession');

  const msftFilings = await callTool('list_filings', { cik: '0000789019', form: '10-K', limit: 1 });
  const msftLatest = stringAt(firstObjectAt(msftFilings.structuredContent, 'results'), 'accession');
  const msftItems = await callTool('list_items', { cik: '0000789019', accession: msftLatest });
  examples.push({
    id: '03',
    name: 'list-items-msft',
    ...msftItems,
    inputSummary: `MSFT latest 10-K (${msftLatest})`,
    notice: 'The filing is parsed once into confidently located Items with paragraph counts and warnings.',
    cliCalls: [cli(`npm run cli -- items 0000789019 ${msftLatest}`, 'items', '0000789019', msftLatest)],
  });

  examples.push({
    id: '04',
    name: 'get-section-aapl-risk-factors',
    ...(await callTool('get_section', { cik: '0000320193', accession: aaplLatest, item: '1A', maxParagraphs: 6, maxChars: MAX_CHARS })),
    inputSummary: `AAPL ${aaplLatest}, Item 1A, 6 paragraphs`,
    notice: 'Every verbatim paragraph carries its own accession, Item, paragraph index, and SEC URL citation.',
  });

  examples.push({
    id: '05',
    name: 'diff-sections-aapl-risk-factors',
    ...(await callTool('diff_sections', {
      cik: '0000320193',
      baseAccession: '0000320193-24-000123',
      targetAccession: '0000320193-25-000079',
      item: '1A',
      maxChanges: 6,
      maxChars: MAX_CHARS,
      includeWordDiff: true,
    })),
    inputSummary: 'AAPL Item 1A, FY2024 -> FY2025, 6 changes with word diffs',
    notice: 'Changed paragraphs retain citations for both sides and opt-in word-level edit runs.',
  });

  const tslaFilings = await callTool('list_filings', { cik: '0001318605', form: '10-K', limit: 2 });
  const tslaResults = tslaFilings.structuredContent['results'];
  if (!Array.isArray(tslaResults) || tslaResults.length < 2) throw new Error('Expected two TSLA 10-K filings.');
  const tslaTarget = stringAt(tslaResults[0] as Record<string, unknown>, 'accession');
  const tslaBase = stringAt(tslaResults[1] as Record<string, unknown>, 'accession');
  examples.push({
    id: '06',
    name: 'diff-all-items-tsla',
    ...(await callTool('diff_all_items', { cik: '0001318605', baseAccession: tslaBase, targetAccession: tslaTarget })),
    inputSummary: `TSLA two latest 10-Ks (${tslaBase} -> ${tslaTarget})`,
    notice: 'The statistics-only overview ranks Items by change without pulling bulky paragraph text.',
    cliCalls: [cli(`npm run cli -- diff-all 0001318605 ${tslaBase} ${tslaTarget}`, 'diff-all', '0001318605', tslaBase, tslaTarget)],
  });

  examples.push({
    id: '07',
    name: 'search-filing-aapl-tariffs',
    ...(await callTool('search_filing', {
      cik: '0000320193', accession: aaplLatest, pattern: 'tariff', item: '7', limit: 5, maxChars: MAX_CHARS,
    })),
    inputSummary: `AAPL ${aaplLatest}, Item 7, /tariff/i, limit 5`,
    notice: 'Search returns full matching paragraphs verbatim, each with a citation rather than an isolated snippet.',
    cliCalls: [cli(`npm run cli -- search 0000320193 ${aaplLatest} tariff --item 7 --limit 5`, 'search', '0000320193', aaplLatest, 'tariff', '--item', '7', '--limit', '5')],
  });

  const geFilings = await callTool('list_filings', { cik: '0000040545', form: '10-K', limit: 1 });
  const geLatest = stringAt(firstObjectAt(geFilings.structuredContent, 'results'), 'accession');
  examples.push({
    id: '08',
    name: 'get-section-ge-not-found',
    ...(await callTool('get_section', { cik: '0000040545', accession: geLatest, item: '1A' })),
    inputSummary: `GE latest 10-K (${geLatest}), Item 1A`,
    notice: '`not_found` includes `availableItems` instead of returning a guessed section.',
    cliCalls: [cli(`npm run cli -- section 0000040545 ${geLatest} 1A`, 'section', '0000040545', geLatest, '1A')],
  });

  examples.push({
    id: '09',
    name: 'diff-sections-brk-risk-factors',
    ...(await callTool('diff_sections', {
      cik: '0001067983',
      baseAccession: '0001193125-26-202243',
      targetAccession: '0001193125-26-341032',
      item: 'II.1A',
    })),
    inputSummary: 'BRK-B 10-Q Part II Item 1A across two quarters',
    notice: 'The qualified 10-Q key stays within Part II, and the adjacent Item 2 repurchase tables do not leak into the risk-factor diff.',
    cliCalls: [cli('npm run cli -- diff 0001067983 0001193125-26-202243 0001193125-26-341032 II.1A', 'diff', '0001067983', '0001193125-26-202243', '0001193125-26-341032', 'II.1A')],
  });

  const xomTicker = await callTool('resolve_company', { query: 'XOM' });
  const holdingCik = stringAt(firstObjectAt(xomTicker.structuredContent, 'results'), 'cik');
  const xomFilings = await callTool('list_filings', { cik: holdingCik, form: '10-K' });
  const xomName = await callTool('resolve_company', { query: 'Exxon Mobil Corp' });
  examples.push({
    id: '10',
    name: 'xom-holding-company',
    tool: 'resolve_company -> list_filings -> resolve_company',
    inputSummary: 'XOM ticker, its 10-Ks, then company-name fallback',
    notice: 'The ticker points at a holding company with no 10-K, and the name fallback is empty rather than silently substituting another CIK.',
    steps: [xomTicker, xomFilings, xomName],
    cliCalls: [
      cli('npm run cli -- resolve XOM', 'resolve', 'XOM'),
      cli(`npm run cli -- filings ${holdingCik} --form 10-K`, 'filings', holdingCik, '--form', '10-K'),
      cli('npm run cli -- resolve "Exxon Mobil Corp"', 'resolve', 'Exxon Mobil Corp'),
    ],
  });

  examples.push({
    id: '11',
    name: 'diff-sections-jpm-legal-proceedings',
    ...(await callTool('diff_sections', {
      cik: '0000019617',
      baseAccession: '0000019617-25-000270',
      targetAccession: '0001628280-26-008131',
      item: '3',
      maxChanges: 6,
    })),
    inputSummary: 'JPM Item 3 across its two latest 10-Ks, max 6 changes',
    notice: 'An identical one-paragraph cross-reference is reported honestly as zero changes with similarity 1.',
    cliCalls: [cli('npm run cli -- diff 0000019617 0000019617-25-000270 0001628280-26-008131 3', 'diff', '0000019617', '0000019617-25-000270', '0001628280-26-008131', '3')],
  });

  examples.push({
    id: '12',
    name: 'get-section-aapl-offset',
    ...(await callTool('get_section', {
      cik: '0000320193', accession: aaplLatest, item: '1A', offset: 3, maxParagraphs: 3, maxChars: MAX_CHARS,
    })),
    inputSummary: `AAPL ${aaplLatest}, Item 1A, offset 3, 3 paragraphs`,
    notice: '`offset`, `returned`, and `total` make bounded continuation explicit and reproducible.',
  });
} finally {
  await mcp.close();
}

await rm(EXAMPLES_DIR, { recursive: true, force: true });
await mkdir(MCP_DIR, { recursive: true });
await mkdir(CLI_DIR, { recursive: true });

for (const example of examples) {
  const basename = `${example.id}-${example.name}`;
  const mcpOutput = isMultiStep(example)
    ? { steps: example.steps }
    : { tool: example.tool, input: example.input, structuredContent: example.structuredContent };
  await writeFile(join(MCP_DIR, `${basename}.json`), jsonText(mcpOutput));

  if (example.cliCalls) {
    const sections: string[] = [];
    for (const call of example.cliCalls) {
      sections.push(`$ ${call.display}\n\n${await runCli(call)}`);
    }
    await writeFile(join(CLI_DIR, `${basename}.txt`), `${sections.join('\n\n')}\n`);
  }
}

const rows = examples.map((example) => {
  const basename = `${example.id}-${example.name}`;
  const links = [`[MCP JSON](mcp/${basename}.json)`];
  if (example.cliCalls) links.push(`[CLI text](cli/${basename}.txt)`);
  return `| ${links.join('<br>')} | ${example.tool} | ${example.inputSummary} | ${example.notice} |`;
});
const readme = `# Real-output examples

These files are generated by \`npm run examples\` from real SEC filings. The script constructs the real server with \`buildServer()\` and calls it through the MCP SDK's linked in-memory transport, so each JSON file records exactly the \`structuredContent\` an MCP client receives. CLI examples are captured from the same engine via \`src/cli.ts\`; ANSI styling is removed. No output is manually truncated.

Set \`EDGAR_USER_AGENT\` to a descriptive value containing an email address. \`EDGAR_CACHE_DIR\` is optional but recommended; filing documents are immutable and can be reused, while live EDGAR indexes are refreshed.

| File | Tool | Input summary | What to notice |
|---|---|---|---|
${rows.join('\n')}
`;
await writeFile(join(EXAMPLES_DIR, 'README.md'), readme);

console.log(`Generated ${examples.length} MCP examples and ${examples.filter((example) => example.cliCalls).length} CLI examples in ${EXAMPLES_DIR}.`);
