import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { EdgarClient } from './edgar/client.js';
import { MAX_PATTERN_CHARS, cite, citeItem, type FilingService } from './service.js';
import {
  DiffAllItemsOutputSchema,
  DiffSectionsOutputSchema,
  GetSectionOutputSchema,
  ListFilingsOutputSchema,
  ListItemsOutputSchema,
  ResolveCompanyOutputSchema,
  SearchFilingOutputSchema,
  type DiffAllItemsOutput,
  type DiffSectionsOutput,
  type DiffSectionsResult,
  type GetSectionOutput,
  type ListFilingsOutput,
  type ListItemsOutput,
  type ResolveCompanyOutput,
  type SearchFilingOutput,
} from './schemas.js';
import type { FilingRef, ParagraphChange, Section } from './types.js';

/**
 * edgar-diff-mcp — a read-only MCP server over SEC EDGAR.
 *
 * Design rules (see docs/DESIGN.md):
 *  1. Read-only by construction. No tool has a side effect outside the cache.
 *  2. Verbatim or nothing. We return filing text, never a paraphrase.
 *  3. Every paragraph carries a citation (CIK, accession, item, paragraph index, URL).
 *  4. No data = no answer. A missing Item returns `not_found` with what *is* available.
 *  5. Honest degradation. Parser doubts are surfaced as `warnings`, never hidden.
 */

const INSTRUCTIONS = `edgar-diff-mcp is read-only and returns SEC filing text verbatim.
Quote only what a tool returns and keep its citation (accession, item, paragraph, url) next to the quote.
If a tool returns status "not_found", say so and use availableItems — do not infer the missing section.
Large Items are truncated honestly. Retry with higher maxParagraphs/maxChanges and maxChars (up to 400000) to retrieve a larger page.
Typical flow: resolve_company → list_filings (form "10-K") → diff_all_items → diff_sections(item "1A") or get_section.`;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;

const json = <T extends Record<string, unknown>>(value: T) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value) }],
  structuredContent: value,
});
const fail = (e: unknown) => ({ isError: true, content: [{ type: 'text' as const, text: e instanceof Error ? e.message : String(e) }] });

const CikSchema = z.string().regex(/^\d{1,10}$/, 'CIK must be 1–10 digits').describe('Central Index Key');
const AccessionSchema = z
  .string()
  .regex(/^\d{10}-\d{2}-\d{6}$/, 'Accession must look like 0000320193-24-000123')
  .describe('EDGAR accession number, dashed form');
const ItemSchema = z.string().min(1).describe('Item reference: "1A", "7", "Item 1A", or "II.1A" for a 10-Q Part II item');

/** One citation shape for every tool. */
const withCitation = (ref: FilingRef, section: Section, paragraph: number, text: string) => ({ citation: cite(ref, section, paragraph), text });

/** Attach full citations to diff entries so they are self-describing when copied out of context. */
function citeChange(
  c: ParagraphChange,
  base: FilingRef,
  target: FilingRef,
  item: string,
  title: string,
  includeWordDiff: boolean,
): Extract<DiffSectionsResult, { status: 'ok' }>['changes'][number] {
  const citedBase = c.base ? { ...c.base, citation: citeItem(base, item, title, c.base.paragraph) } : undefined;
  const citedTarget = c.target ? { ...c.target, citation: citeItem(target, item, title, c.target.paragraph) } : undefined;
  switch (c.type) {
    case 'added':
      if (!citedTarget) throw new Error('Internal: added change is missing its target paragraph.');
      return { type: 'added', target: citedTarget };
    case 'removed':
      if (!citedBase) throw new Error('Internal: removed change is missing its base paragraph.');
      return { type: 'removed', base: citedBase };
    case 'changed':
      if (!citedBase || !citedTarget || c.similarity === undefined || !c.wordDiff) {
        throw new Error('Internal: changed paragraph is missing diff details.');
      }
      return {
        type: 'changed',
        base: citedBase,
        target: citedTarget,
        similarity: c.similarity,
        ...(includeWordDiff ? { wordDiff: c.wordDiff } : {}),
      };
    case 'unchanged':
      if (!citedBase || !citedTarget) throw new Error('Internal: unchanged paragraph is missing one side.');
      return { type: 'unchanged', base: citedBase, target: citedTarget };
  }
}

function truncateList<T>(entries: T[], maxEntries: number, maxEntriesName: string, maxChars: number): { entries: T[]; truncated: boolean; truncatedReason?: string } {
  const kept = entries.slice(0, maxEntries);
  const reasons: string[] = [];
  if (kept.length < entries.length) reasons.push(`${maxEntriesName}=${maxEntries}`);
  let charTruncated = false;
  while (JSON.stringify(kept).length > maxChars && kept.length > 0) {
    kept.pop();
    charTruncated = true;
  }
  if (charTruncated) reasons.push(`maxChars=${maxChars}`);
  return {
    entries: kept,
    truncated: reasons.length > 0,
    ...(reasons.length > 0 ? { truncatedReason: `Trailing entries were omitted to satisfy ${reasons.join(' and ')}.` } : {}),
  };
}

const MaxCharsSchema = z.number().int().min(2).max(400_000).optional().describe('Maximum characters in the serialized paragraph/change/match list (default 60000). Truncation is reported.');

export function buildServer(client: EdgarClient, service: FilingService): McpServer {
  const server = new McpServer({ name: 'edgar-diff-mcp', version: '0.1.0' }, { instructions: INSTRUCTIONS });

  server.registerTool(
    'resolve_company',
    {
      title: 'Resolve company',
      description: 'Look up a company by ticker (exact) or name (substring) and return CIK candidates. Returns an empty results array when nothing matches.',
      inputSchema: { query: z.string().min(1).describe('Ticker such as "AAPL", a company name fragment, or a numeric CIK') },
      outputSchema: ResolveCompanyOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        const output: ResolveCompanyOutput = { results: await client.resolveCompany(query) };
        return json(output);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'list_filings',
    {
      title: 'List filings',
      description: 'List recent filings for a CIK, optionally filtered by form ("10-K", "10-Q"). Each entry includes the accession number needed by other tools.',
      inputSchema: {
        cik: CikSchema,
        form: z.string().optional().describe('Exact form type, e.g. "10-K"'),
        limit: z.number().int().min(1).max(100).optional().describe('Max results, default 20'),
      },
      outputSchema: ListFilingsOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, form, limit }) => {
      try {
        const opts: { form?: string; limit?: number } = { limit: limit ?? 20 };
        if (form) opts.form = form;
        const output: ListFilingsOutput = { results: await client.listFilings(cik, opts) };
        return json(output);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'list_items',
    {
      title: 'List items in a filing',
      description: 'Parse a filing and list the Items that were found (e.g. 1A Risk Factors, 7 MD&A) with sizes and any parser warnings. Call this before get_section when unsure what exists.',
      inputSchema: { cik: CikSchema, accession: AccessionSchema },
      outputSchema: ListItemsOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, accession }) => {
      try {
        const ref = await service.resolveFiling(cik, accession);
        const output: ListItemsOutput = { filing: ref, ...(await service.listItems(ref)) };
        return json(output);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'get_section',
    {
      title: 'Get section (verbatim)',
      description:
        'Return the verbatim paragraphs of one Item from a filing, each with a citation. If the Item cannot be located the result is status "not_found" together with the Items that are available — never a guess. Short placeholder bodies ("None.") are returned with a warning. Large results are truncated according to maxParagraphs and maxChars.',
      inputSchema: {
        cik: CikSchema,
        accession: AccessionSchema,
        item: ItemSchema,
        maxParagraphs: z.number().int().min(1).max(2000).optional().describe('Truncate output after N paragraphs (default 400). Truncation is reported.'),
        maxChars: MaxCharsSchema,
      },
      outputSchema: GetSectionOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, accession, item, maxParagraphs, maxChars }) => {
      try {
        const ref = await service.resolveFiling(cik, accession);
        const r = await service.getSection(ref, item);
        if (r.status !== 'ok') return json(r satisfies GetSectionOutput);
        const cap = maxParagraphs ?? 400;
        const limited = truncateList(
          r.section.paragraphs.map((p) => withCitation(ref, r.section, p.index, p.text)),
          cap,
          'maxParagraphs',
          maxChars ?? 60_000,
        );
        return json({
          status: 'ok',
          filing: ref,
          item: r.section.item,
          title: r.section.title,
          totalParagraphs: r.section.paragraphs.length,
          truncated: limited.truncated,
          ...(limited.truncatedReason ? { truncatedReason: limited.truncatedReason } : {}),
          warnings: r.section.warnings,
          paragraphs: limited.entries,
        } satisfies GetSectionOutput);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'diff_all_items',
    {
      title: 'Diff all Items across two filings',
      description:
        'Compare all Items shared by a base filing and a target filing. Returns per-Item change statistics only, sorted with the most changed first, plus Items found on only one side. Call diff_sections for the actual verbatim, cited paragraphs.',
      inputSchema: {
        cik: CikSchema,
        baseAccession: AccessionSchema.describe('Accession number of the older filing to use as the comparison base'),
        targetAccession: AccessionSchema.describe('Accession number of the newer filing to compare against the base'),
      },
      outputSchema: DiffAllItemsOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, baseAccession, targetAccession }) => {
      try {
        const base = await service.resolveFiling(cik, baseAccession);
        const target = await service.resolveFiling(cik, targetAccession);
        const output: DiffAllItemsOutput = await service.diffAll(base, target);
        return json(output);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'diff_sections',
    {
      title: 'Diff one Item across two filings',
      description:
        'Compare the same Item (e.g. "1A" Risk Factors) between a base filing and a target filing. Returns added, removed and changed paragraphs — verbatim, each with a citation on its side — plus summary stats. Word-level edit scripts are omitted by default; set includeWordDiff to true to include them. Unchanged paragraphs are omitted unless includeUnchanged is true. Large results are truncated according to maxChanges and maxChars.',
      inputSchema: {
        cik: CikSchema,
        baseAccession: AccessionSchema.describe('Older filing'),
        targetAccession: AccessionSchema.describe('Newer filing'),
        item: ItemSchema,
        includeUnchanged: z.boolean().optional(),
        includeWordDiff: z.boolean().optional().describe('Include word-level edit scripts for changed paragraphs (default false).'),
        maxChanges: z.number().int().min(1).max(1000).optional().describe('Truncate change list after N entries (default 200). Truncation is reported.'),
        maxChars: MaxCharsSchema,
      },
      outputSchema: DiffSectionsOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, baseAccession, targetAccession, item, includeUnchanged, includeWordDiff, maxChanges, maxChars }) => {
      try {
        const base = await service.resolveFiling(cik, baseAccession);
        const target = await service.resolveFiling(cik, targetAccession);
        const d = await service.diff(base, target, item, includeUnchanged ?? false);
        if (d.status !== 'ok') return json(d satisfies DiffSectionsOutput);
        const cap = maxChanges ?? 200;
        const limited = truncateList(
          d.changes.map((c) => citeChange(c, base, target, d.item, d.title, includeWordDiff ?? false)),
          cap,
          'maxChanges',
          maxChars ?? 60_000,
        );
        return json({
          ...d,
          truncated: limited.truncated,
          ...(limited.truncatedReason ? { truncatedReason: limited.truncatedReason } : {}),
          changes: limited.entries,
        } satisfies DiffSectionsOutput);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'search_filing',
    {
      title: 'Search a filing (verbatim matches)',
      description: `Regex search across a filing (or one Item). Returns the full verbatim paragraph for each match with a citation. Case-insensitive; pattern ≤ ${MAX_PATTERN_CHARS} chars. Unknown item → status "not_found". Large results are truncated according to maxChars.`,
      inputSchema: {
        cik: CikSchema,
        accession: AccessionSchema,
        pattern: z.string().min(1).max(MAX_PATTERN_CHARS).describe('JavaScript regular expression, e.g. "tariff|export control"'),
        item: ItemSchema.optional(),
        limit: z.number().int().min(1).max(200).optional(),
        maxChars: MaxCharsSchema,
      },
      outputSchema: SearchFilingOutputSchema,
      annotations: READ_ONLY,
    },
    async ({ cik, accession, pattern, item, limit, maxChars }) => {
      try {
        const ref = await service.resolveFiling(cik, accession);
        const result = await service.search(ref, pattern, item, limit ?? 20);
        if (result.status !== 'ok') return json(result satisfies SearchFilingOutput);
        const limited = truncateList(result.matches, result.matches.length, 'limit', maxChars ?? 60_000);
        const output: SearchFilingOutput = {
          ...result,
          matches: limited.entries,
          truncated: limited.truncated,
          ...(limited.truncatedReason ? { truncatedReason: limited.truncatedReason } : {}),
        };
        return json(output);
      } catch (e) {
        return fail(e);
      }
    },
  );

  return server;
}
