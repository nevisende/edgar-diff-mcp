export type ToolName =
  | 'resolve_company'
  | 'list_filings'
  | 'list_items'
  | 'get_section'
  | 'diff_all_items'
  | 'diff_sections'
  | 'search_filing';

export interface ValueReference {
  ref: string;
}

export type PlanArgument = string | number | boolean | ValueReference;

export interface PlanAssertion {
  name: string;
  path: string;
  operator: 'equals' | 'greaterThan' | 'lengthEquals' | 'lengthGreaterThan' | 'includes' | 'matches';
  expected: string | number | boolean;
  flags?: string;
}

export interface PlanStep {
  tool: ToolName;
  saveAs: string;
  arguments: Record<string, PlanArgument>;
  assertions: PlanAssertion[];
}

export interface AnswerCheck {
  name: string;
  predicate: string | RegExp;
  negate?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  persona: string;
  prompt: string;
  plan: PlanStep[];
  checks: AnswerCheck[];
}

const ref = (path: string): ValueReference => ({ ref: path });
const archiveUrl: AnswerCheck = {
  name: 'includes an SEC Archives citation URL',
  predicate: 'https://www.sec.gov/Archives/',
};

export const scenarios: Scenario[] = [
  {
    id: 'nvda-risk-factors',
    title: 'NVIDIA newly added risk factors',
    persona: 'A technology-sector equity analyst preparing an annual risk-factor update.',
    prompt: 'What new risk factors did NVIDIA add in its latest 10-K compared with the prior one? Quote the added paragraphs verbatim with citations.',
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'NVDA' },
        assertions: [
          { name: 'NVDA resolves to NVIDIA CIK', path: 'results.0.cik', operator: 'equals', expected: '0001045810' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'two 10-Ks are returned', path: 'results', operator: 'lengthEquals', expected: 2 },
        ],
      },
      {
        tool: 'diff_all_items',
        saveAs: 'overview',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
        },
        assertions: [
          { name: 'all-Item diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'shared Items are compared', path: 'items', operator: 'lengthGreaterThan', expected: 0 },
        ],
      },
      {
        tool: 'diff_sections',
        saveAs: 'riskDiff',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
          item: '1A',
          maxChanges: 1000,
          maxChars: 400000,
        },
        assertions: [
          { name: 'Item 1A diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'added paragraphs exist', path: 'stats.added', operator: 'greaterThan', expected: 0 },
          { name: 'Groq license paragraph is genuinely added', path: '$', operator: 'matches', expected: 'intellectual property license arrangement with Groq', flags: 'i' },
          { name: 'diff changes carry SEC Archives citations', path: '$', operator: 'includes', expected: 'https://www.sec.gov/Archives/' },
        ],
      },
    ],
    checks: [
      { name: 'mentions the distinctive added Groq paragraph', predicate: /intellectual property license arrangement with Groq/i },
      { name: 'identifies the new NVIDIA accession', predicate: '0001045810-26-000021' },
      archiveUrl,
    ],
  },
  {
    id: 'aapl-mdna-tariffs',
    title: 'Apple MD&A tariff references',
    persona: 'A consumer-hardware analyst tracing tariff exposure through annual disclosures.',
    prompt: "In Apple's most recent 10-K, does the MD&A (Item 7) mention tariffs? Quote every matching paragraph with citations, then tell me whether those paragraphs are new compared with the previous 10-K.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'AAPL' },
        assertions: [
          { name: 'AAPL resolves to Apple CIK', path: 'results.0.cik', operator: 'equals', expected: '0000320193' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'two 10-Ks are returned', path: 'results', operator: 'lengthEquals', expected: 2 },
        ],
      },
      {
        tool: 'search_filing',
        saveAs: 'tariffSearch',
        arguments: {
          cik: ref('company.results.0.cik'),
          accession: ref('filings.results.0.accession'),
          pattern: 'tariff',
          item: '7',
          limit: 200,
          maxChars: 400000,
        },
        assertions: [
          { name: 'Item 7 search succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'four tariff paragraphs match', path: 'total', operator: 'equals', expected: 4 },
          { name: 'search includes the 2025 tariff disclosure', path: '$', operator: 'matches', expected: 'Beginning in the second quarter of 2025, new U\\.S\\. Tariffs', flags: 'i' },
          { name: 'matches carry SEC Archives citations', path: '$', operator: 'includes', expected: 'https://www.sec.gov/Archives/' },
        ],
      },
      {
        tool: 'diff_sections',
        saveAs: 'mdnaDiff',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
          item: '7',
          maxChanges: 1000,
          maxChars: 400000,
        },
        assertions: [
          { name: 'Item 7 diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'tariff matches are reported as added', path: '$', operator: 'matches', expected: '"type":"added"[^}]*"paragraph":24[\\s\\S]*"type":"added"[^}]*"paragraph":25', flags: 'i' },
        ],
      },
    ],
    checks: [
      { name: 'quotes the distinctive 2025 tariff disclosure', predicate: /Beginning in the second quarter of 2025, new U\.S\. Tariffs/i },
      { name: 'states that the tariff paragraphs are new', predicate: /(?:new|added|not present in the previous)/i },
      archiveUrl,
    ],
  },
  {
    id: 'tsla-where-it-moved',
    title: 'Tesla Items with the most change',
    persona: 'An automotive analyst triaging which annual-report sections deserve close review.',
    prompt: "Between Tesla's last two 10-Ks, which Items changed the most? Rank the top three by similarity and say how many paragraphs were added, removed and changed in each.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'TSLA' },
        assertions: [
          { name: 'TSLA resolves to Tesla CIK', path: 'results.0.cik', operator: 'equals', expected: '0001318605' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'two 10-Ks are returned', path: 'results', operator: 'lengthEquals', expected: 2 },
        ],
      },
      {
        tool: 'diff_all_items',
        saveAs: 'overview',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
        },
        assertions: [
          { name: 'all-Item diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'Item 9B has the lowest similarity', path: 'items.0.item', operator: 'equals', expected: '9B' },
          { name: 'Item 15 ranks second', path: 'items.1.item', operator: 'equals', expected: '15' },
          { name: 'Item 7 ranks third', path: 'items.2.item', operator: 'equals', expected: '7' },
          { name: 'Item 9B similarity is 0.12', path: 'items.0.stats.similarity', operator: 'equals', expected: 0.12 },
        ],
      },
    ],
    checks: [
      { name: 'names Item 9B as most changed', predicate: /Item\s+9B/i },
      { name: 'names Item 15 in the top three', predicate: /Item\s+15/i },
      { name: 'names Item 7 in the top three', predicate: /Item\s+7\b/i },
      { name: 'reports the lowest similarity', predicate: /(?:0\.12\b|12(?:\.0)?%)/i },
      archiveUrl,
    ],
  },
  {
    id: 'brk-10q-part-ii',
    title: 'Berkshire Part II Item 1A',
    persona: 'An insurance and conglomerates analyst checking quarterly risk-factor updates.',
    prompt: "Compare Berkshire Hathaway's Part II Item 1A (Risk Factors) between its two most recent 10-Q filings. Use the qualified item II.1A. If nothing changed, say so explicitly.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'BRK-B' },
        assertions: [
          { name: 'BRK-B resolves to Berkshire CIK', path: 'results.0.cik', operator: 'equals', expected: '0001067983' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-Q', limit: 2 },
        assertions: [
          { name: 'two 10-Qs are returned', path: 'results', operator: 'lengthEquals', expected: 2 },
        ],
      },
      {
        tool: 'diff_sections',
        saveAs: 'riskDiff',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
          item: 'II.1A',
          maxChanges: 1000,
          maxChars: 400000,
        },
        assertions: [
          { name: 'qualified Item II.1A diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'qualified Item is preserved', path: 'item', operator: 'equals', expected: 'II.1A' },
          { name: '14 paragraphs were added', path: 'stats.added', operator: 'equals', expected: 14 },
          { name: '10 paragraphs were removed', path: 'stats.removed', operator: 'equals', expected: 10 },
          { name: 'one paragraph changed', path: 'stats.changed', operator: 'equals', expected: 1 },
          { name: 'diff changes carry SEC Archives citations', path: '$', operator: 'includes', expected: 'https://www.sec.gov/Archives/' },
        ],
      },
    ],
    checks: [
      { name: 'uses the qualified Item', predicate: 'II.1A' },
      { name: 'reports the added count', predicate: /(?:14\s+(?:paragraphs?\s+)?added|added\D{0,12}14|\+14)/i },
      { name: 'reports the removed count', predicate: /(?:10\s+(?:paragraphs?\s+)?removed|removed\D{0,12}10|-10)/i },
      { name: 'reports the changed count', predicate: /(?:1\s+(?:paragraph\s+)?changed|changed\D{0,12}1|~1)/i },
      archiveUrl,
    ],
  },
  {
    id: 'ge-honest-not-found',
    title: 'GE Aerospace honest not-found result',
    persona: 'An aerospace analyst who needs source text and cannot accept a guessed cross-reference.',
    prompt: "What are GE Aerospace's risk factors in its latest 10-K? Quote them with citations.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'GE' },
        assertions: [
          { name: 'GE resolves to its CIK', path: 'results.0.cik', operator: 'equals', expected: '0000040545' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-K', limit: 1 },
        assertions: [
          { name: 'latest 10-K is returned', path: 'results', operator: 'lengthEquals', expected: 1 },
        ],
      },
      {
        tool: 'list_items',
        saveAs: 'items',
        arguments: { cik: ref('company.results.0.cik'), accession: ref('filings.results.0.accession') },
        assertions: [
          { name: 'cross-reference filing exposes no confident Items', path: 'items', operator: 'lengthEquals', expected: 0 },
        ],
      },
      {
        tool: 'get_section',
        saveAs: 'riskSection',
        arguments: { cik: ref('company.results.0.cik'), accession: ref('filings.results.0.accession'), item: '1A', maxChars: 400000 },
        assertions: [
          { name: 'Item 1A is honestly not found', path: 'status', operator: 'equals', expected: 'not_found' },
          { name: 'reason identifies Item 1A', path: 'reason', operator: 'matches', expected: 'Item "1A" was not found', flags: 'i' },
        ],
      },
    ],
    checks: [
      { name: 'plainly says the section could not be located', predicate: /(?:not[_ -]?found|could not (?:be )?locat|unable to locat)/i },
      { name: 'does not invent an Item 1A quote-source URL', predicate: 'https://www.sec.gov/Archives/', negate: true },
    ],
  },
  {
    id: 'jpm-legal-proceedings',
    title: 'JPMorgan Legal Proceedings',
    persona: 'A bank analyst checking annual legal-disclosure changes and their provenance.',
    prompt: "How did JPMorgan's Legal Proceedings (Item 3) change between its last two 10-Ks? Quote added and removed paragraphs with citations.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'company',
        arguments: { query: 'JPM' },
        assertions: [
          { name: 'JPM resolves to JPMorgan CIK', path: 'results.0.cik', operator: 'equals', expected: '0000019617' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'filings',
        arguments: { cik: ref('company.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'two 10-Ks are returned from paginated submissions', path: 'results', operator: 'lengthEquals', expected: 2 },
          { name: 'new accession is correct', path: 'results.0.accession', operator: 'equals', expected: '0001628280-26-008131' },
          { name: 'prior accession is correct', path: 'results.1.accession', operator: 'equals', expected: '0000019617-25-000270' },
        ],
      },
      {
        tool: 'diff_sections',
        saveAs: 'legalDiff',
        arguments: {
          cik: ref('company.results.0.cik'),
          baseAccession: ref('filings.results.1.accession'),
          targetAccession: ref('filings.results.0.accession'),
          item: '3',
          maxChanges: 1000,
          maxChars: 400000,
        },
        assertions: [
          { name: 'Item 3 diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'no paragraphs were added', path: 'stats.added', operator: 'equals', expected: 0 },
          { name: 'no paragraphs were removed', path: 'stats.removed', operator: 'equals', expected: 0 },
          { name: 'no paragraphs changed', path: 'stats.changed', operator: 'equals', expected: 0 },
          { name: 'Item 3 is identical', path: 'stats.similarity', operator: 'equals', expected: 1 },
          { name: 'filing metadata carries SEC Archives URLs', path: '$', operator: 'includes', expected: 'https://www.sec.gov/Archives/' },
        ],
      },
    ],
    checks: [
      { name: 'includes the new accession', predicate: '0001628280-26-008131' },
      { name: 'includes the prior accession', predicate: '0000019617-25-000270' },
      { name: 'plainly reports no changes', predicate: /(?:no changes|identical|unchanged|no paragraphs? (?:were )?(?:added|removed|changed))/i },
      archiveUrl,
    ],
  },
  {
    id: 'xom-holding-company',
    title: 'Exxon ticker reassignment and operating-company fallback',
    persona: 'An energy analyst guarding against entity-resolution errors during corporate restructuring.',
    prompt: "Diff Exxon's risk factors between its last two 10-Ks.",
    plan: [
      {
        tool: 'resolve_company',
        saveAs: 'tickerCompany',
        arguments: { query: 'XOM' },
        assertions: [
          { name: 'XOM resolves to the holding-company CIK', path: 'results.0.cik', operator: 'equals', expected: '0002115436' },
          { name: 'resolved entity is the holding company', path: 'results.0.name', operator: 'matches', expected: 'Holdings Corp', flags: 'i' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'holdingFilings',
        arguments: { cik: ref('tickerCompany.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'holding-company CIK has no 10-Ks', path: 'results', operator: 'lengthEquals', expected: 0 },
        ],
      },
      {
        tool: 'resolve_company',
        saveAs: 'nameLookup',
        arguments: { query: 'Exxon Mobil Corp' },
        assertions: [
          { name: 'current ticker index has no operating-company name match', path: 'results', operator: 'lengthEquals', expected: 0 },
        ],
      },
      {
        tool: 'resolve_company',
        saveAs: 'operatingCompany',
        arguments: { query: '34088' },
        assertions: [
          { name: 'known operating-company CIK resolves', path: 'results.0.cik', operator: 'equals', expected: '0000034088' },
          { name: 'CIK belongs to Exxon Mobil Corp', path: 'results.0.name', operator: 'matches', expected: 'EXXON MOBIL CORP', flags: 'i' },
        ],
      },
      {
        tool: 'list_filings',
        saveAs: 'operatingFilings',
        arguments: { cik: ref('operatingCompany.results.0.cik'), form: '10-K', limit: 2 },
        assertions: [
          { name: 'operating-company CIK has two 10-Ks', path: 'results', operator: 'lengthEquals', expected: 2 },
          { name: 'filing URLs use operating-company CIK', path: '$', operator: 'includes', expected: '/edgar/data/34088/' },
        ],
      },
      {
        tool: 'diff_sections',
        saveAs: 'riskDiff',
        arguments: {
          cik: ref('operatingCompany.results.0.cik'),
          baseAccession: ref('operatingFilings.results.1.accession'),
          targetAccession: ref('operatingFilings.results.0.accession'),
          item: '1A',
          maxChanges: 1000,
          maxChars: 400000,
        },
        assertions: [
          { name: 'operating-company Item 1A diff succeeds', path: 'status', operator: 'equals', expected: 'ok' },
          { name: 'diff has substantive changes', path: 'total', operator: 'greaterThan', expected: 0 },
          { name: 'citations use operating-company CIK', path: '$', operator: 'includes', expected: '"cik":"0000034088"' },
        ],
      },
    ],
    checks: [
      {
        name: 'discloses the holding-company mismatch or uses operating-company CIK',
        predicate: /(?:holding company[\s\S]{0,160}no 10-K|no 10-K[\s\S]{0,160}holding company|0000034088)/i,
      },
      {
        name: 'does not attribute a filing diff to holding-company CIK',
        predicate: /https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/2115436\//i,
        negate: true,
      },
    ],
  },
];
