import { mkdir, writeFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { scenarios, type PlanArgument, type PlanAssertion, type PlanStep } from '../scenarios/scenarios.js';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUTPUT_DIR = `${REPO}/evals/scenarios`;
const USER_AGENT = process.env['EDGAR_USER_AGENT'] ?? 'edgar-diff-mcp/0.1 furkandenizhan@gmail.com';
const CACHE_DIR = process.env['EDGAR_CACHE_DIR'] ?? `${REPO}/.edgar-cache`;

interface AssertionResult {
  name: string;
  pass: boolean;
  actual: unknown;
  expected: unknown;
}

interface StepResult {
  tool: string;
  saveAs: string;
  status: string;
  assertions: AssertionResult[];
}

interface ScenarioResult {
  id: string;
  title: string;
  pass: boolean;
  steps: StepResult[];
  notes: string;
  excerpt: string;
}

function valueAtPath(root: unknown, path: string): unknown {
  if (path === '$') return root;
  let current = root;
  for (const part of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function display(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value) ?? String(value);
}

function compactActual(actual: unknown, assertion: PlanAssertion): unknown {
  if (assertion.path === '$') return `${assertion.operator} ${JSON.stringify(assertion.expected)}: matched`;
  if (Array.isArray(actual)) return { length: actual.length };
  if (typeof actual === 'string' && actual.length > 240) return `${actual.slice(0, 240)}...`;
  if (typeof actual === 'object' && actual !== null) return { serializedChars: display(actual).length };
  return actual;
}

function evaluateAssertion(output: unknown, assertion: PlanAssertion): AssertionResult {
  const actual = valueAtPath(output, assertion.path);
  let pass = false;
  switch (assertion.operator) {
    case 'equals':
      pass = actual === assertion.expected;
      break;
    case 'greaterThan':
      pass = typeof actual === 'number' && typeof assertion.expected === 'number' && actual > assertion.expected;
      break;
    case 'lengthEquals':
      pass = Array.isArray(actual) && actual.length === assertion.expected;
      break;
    case 'lengthGreaterThan':
      pass = Array.isArray(actual) && typeof assertion.expected === 'number' && actual.length > assertion.expected;
      break;
    case 'includes':
      pass = display(actual).includes(String(assertion.expected));
      break;
    case 'matches':
      pass = new RegExp(String(assertion.expected), assertion.flags).test(display(actual));
      break;
  }
  return { name: assertion.name, pass, actual: compactActual(actual, assertion), expected: assertion.expected };
}

function resolveArgument(value: PlanArgument, outputs: Record<string, unknown>): string | number | boolean {
  if (typeof value !== 'object') return value;
  const resolved = valueAtPath(outputs, value.ref);
  if (!['string', 'number', 'boolean'].includes(typeof resolved)) {
    throw new Error(`Reference ${value.ref} did not resolve to a scalar value.`);
  }
  return resolved as string | number | boolean;
}

function stepArguments(step: PlanStep, outputs: Record<string, unknown>): Record<string, string | number | boolean> {
  return Object.fromEntries(Object.entries(step.arguments).map(([key, value]) => [key, resolveArgument(value, outputs)]));
}

function outputStatus(output: unknown): string {
  const status = valueAtPath(output, 'status');
  if (typeof status === 'string') return status;
  const results = valueAtPath(output, 'results');
  if (Array.isArray(results)) return `${results.length} result${results.length === 1 ? '' : 's'}`;
  const items = valueAtPath(output, 'items');
  if (Array.isArray(items)) return `${items.length} item${items.length === 1 ? '' : 's'}`;
  return 'ok';
}

function citedExcerpt(output: unknown): string | undefined {
  const changes = valueAtPath(output, 'changes');
  if (Array.isArray(changes)) {
    const preferred = changes.find((entry) => valueAtPath(entry, 'type') === 'added') ?? changes[0];
    if (preferred) {
      const side = valueAtPath(preferred, 'target') ?? valueAtPath(preferred, 'base');
      const text = valueAtPath(side, 'text');
      const citation = valueAtPath(side, 'citation');
      if (typeof text === 'string' && citation) return `${text}\nCitation: ${JSON.stringify(citation)}`;
    }
  }
  const matches = valueAtPath(output, 'matches');
  if (Array.isArray(matches) && matches[0]) {
    const text = valueAtPath(matches[0], 'text');
    const citation = valueAtPath(matches[0], 'citation');
    if (typeof text === 'string' && citation) return `${text}\nCitation: ${JSON.stringify(citation)}`;
  }
  return undefined;
}

function scenarioExcerpt(id: string, outputs: Record<string, unknown>): string {
  if (id === 'nvda-risk-factors') {
    const changes = valueAtPath(outputs, 'riskDiff.changes');
    const groq = Array.isArray(changes)
      ? changes.find((change) => /license arrangement with Groq/i.test(display(change)))
      : undefined;
    if (groq) {
      const side = valueAtPath(groq, 'target');
      return `${truncate(String(valueAtPath(side, 'text')), 1200)}\nCitation: ${JSON.stringify(valueAtPath(side, 'citation'))}`;
    }
  }
  if (id === 'aapl-mdna-tariffs') {
    const match = valueAtPath(outputs, 'tariffSearch.matches.1');
    if (match) return `${truncate(String(valueAtPath(match, 'text')), 1200)}\nCitation: ${JSON.stringify(valueAtPath(match, 'citation'))}`;
  }
  if (id === 'tsla-where-it-moved') {
    return JSON.stringify((valueAtPath(outputs, 'overview.items') as unknown[] | undefined)?.slice(0, 3) ?? [], null, 2);
  }
  if (id === 'ge-honest-not-found') return JSON.stringify(outputs['riskSection'], null, 2);
  if (id === 'jpm-legal-proceedings') {
    return `Accessions: ${String(valueAtPath(outputs, 'filings.results.1.accession'))} -> ${String(valueAtPath(outputs, 'filings.results.0.accession'))}\nBase URL: ${String(valueAtPath(outputs, 'legalDiff.base.url'))}\nTarget URL: ${String(valueAtPath(outputs, 'legalDiff.target.url'))}\n${JSON.stringify(valueAtPath(outputs, 'legalDiff.stats'), null, 2)}`;
  }
  if (id === 'xom-holding-company') {
    const changes = valueAtPath(outputs, 'riskDiff.changes');
    const changed = Array.isArray(changes) ? changes.find((change) => valueAtPath(change, 'type') === 'changed') : undefined;
    const side = valueAtPath(changed, 'target');
    const excerpt = side
      ? `${truncate(String(valueAtPath(side, 'text')), 1000)}\nCitation: ${JSON.stringify(valueAtPath(side, 'citation'))}`
      : '';
    return `XOM resolution: ${JSON.stringify(valueAtPath(outputs, 'tickerCompany.results.0'))}\nXOM 10-K count: ${(valueAtPath(outputs, 'holdingFilings.results') as unknown[] | undefined)?.length ?? 0}\nOperating company: ${JSON.stringify(valueAtPath(outputs, 'operatingCompany.results.0'))}\n${excerpt}`;
  }
  for (const output of Object.values(outputs).reverse()) {
    const excerpt = citedExcerpt(output);
    if (excerpt) return excerpt;
  }
  return JSON.stringify(outputs, null, 2);
}

function truncate(text: string, limit = 1800): string {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

const childEnv = Object.fromEntries(
  Object.entries({ ...process.env, EDGAR_USER_AGENT: USER_AGENT, EDGAR_CACHE_DIR: CACHE_DIR }).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  ),
);
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [`${REPO}/dist/main.js`],
  cwd: REPO,
  env: childEnv,
  stderr: 'inherit',
  maxBufferSize: 50_000_000,
});
const client = new Client({ name: 'edgar-diff-scenario-client', version: '0.1.0' });
const results: ScenarioResult[] = [];

try {
  await client.connect(transport);
  for (const scenario of scenarios) {
    const outputs: Record<string, unknown> = {};
    const steps: StepResult[] = [];
    let error = '';
    for (const step of scenario.plan) {
      try {
        const result = await client.callTool({ name: step.tool, arguments: stepArguments(step, outputs) });
        if (result.isError) {
          throw new Error(`${step.tool} returned an MCP error`);
        }
        const output = result.structuredContent;
        if (!output) throw new Error(`${step.tool} returned no structuredContent.`);
        outputs[step.saveAs] = output;
        const assertions = step.assertions.map((assertion) => evaluateAssertion(output, assertion));
        steps.push({ tool: step.tool, saveAs: step.saveAs, status: outputStatus(output), assertions });
        if (assertions.some((assertion) => !assertion.pass)) break;
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
        steps.push({ tool: step.tool, saveAs: step.saveAs, status: 'error', assertions: [] });
        break;
      }
    }
    const failures = steps.flatMap((step) => step.assertions.filter((assertion) => !assertion.pass));
    const pass = !error && steps.length === scenario.plan.length && failures.length === 0;
    const notes = error || (failures.length > 0 ? failures.map((failure) => failure.name).join('; ') : 'All structural assertions passed.');
    results.push({ id: scenario.id, title: scenario.title, pass, steps, notes, excerpt: truncate(scenarioExcerpt(scenario.id, outputs)) });
    console.error(`[${pass ? 'PASS' : 'FAIL'}] ${scenario.id}: ${notes}`);
  }
} finally {
  await client.close();
}

const report = {
  kind: 'deterministic model-free MCP scenario run',
  generatedAt: new Date().toISOString(),
  server: 'node dist/main.js over stdio',
  userAgent: USER_AGENT,
  cacheDir: CACHE_DIR,
  passed: results.filter((result) => result.pass).length,
  total: results.length,
  scenarios: results,
};

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(`${OUTPUT_DIR}/mcp-client.json`, `${JSON.stringify(report, null, 2)}\n`);

const rows = results.map((result) => {
  const steps = result.steps.map((step) => `${step.tool} (${step.status})`).join(' -> ');
  return `| ${result.id} | ${steps} | ${result.pass ? 'PASS' : 'FAIL'} | ${result.notes.replaceAll('|', '\\|')} |`;
});
const htmlText = (value: string): string => [...value]
  .map((character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint > 0x7f ? `&#${codePoint};` : character;
  })
  .join('');
const excerpts = results.map((result) => `### ${result.id}\n\n<pre>${htmlText(result.excerpt)}</pre>`).join('\n\n');
const markdown = `# Deterministic MCP-client scenarios\n\nGenerated ${report.generatedAt}. Model-free run through a real MCP client using stdio against \`node dist/main.js\` and real SEC EDGAR data.\n\n**Result: ${report.passed}/${report.total} passed.**\n\n| Scenario | Steps | Result | Notes |\n|---|---|---:|---|\n${rows.join('\n')}\n\n## Key output excerpts\n\n${excerpts}\n`;
await writeFile(`${OUTPUT_DIR}/mcp-client.md`, markdown);

if (report.passed !== report.total) process.exitCode = 1;
