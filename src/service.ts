import type { EdgarClient } from './edgar/client.js';
import { htmlToLines, resolveItemKey, splitItems } from './edgar/sections.js';
import { diffSections, onlyChanges } from './diff/sections.js';
import type { Citation, DiffAllResult, FilingRef, Section, SectionDiff, SectionResult } from './types.js';

export const MAX_PATTERN_CHARS = 200;

export type DiffResult =
  | ({ status: 'ok' } & SectionDiff)
  | { status: 'not_found'; side: 'base' | 'target'; detail: Extract<SectionResult, { status: 'not_found' }> };
export type SearchResult =
  | { status: 'ok'; filing: FilingRef; matches: { citation: Citation; text: string }[]; warnings: string[] }
  | { status: 'not_found'; filing: FilingRef; item: string; reason: string; availableItems: string[] };

/**
 * The one place that turns raw filings into answers.
 * Pure orchestration: no HTTP details, no MCP details.
 */
export class FilingService {
  private readonly parsed = new Map<string, { sections: Map<string, Section>; warnings: string[] }>();

  constructor(private readonly client: EdgarClient) {}

  async resolveFiling(cik: string, accession: string): Promise<FilingRef> {
    const ref = await this.client.findFiling(cik, accession);
    if (!ref) throw new Error(`Accession ${accession} not found among recent filings for CIK ${cik}.`);
    return ref;
  }

  private async parse(ref: FilingRef): Promise<{ sections: Map<string, Section>; warnings: string[] }> {
    const hit = this.parsed.get(ref.url);
    if (hit) {
      this.parsed.delete(ref.url);
      this.parsed.set(ref.url, hit);
      return hit;
    }
    const html = await this.client.fetchDocument(ref);
    const result = splitItems(htmlToLines(html), ref.form);
    this.parsed.set(ref.url, result);
    if (this.parsed.size > 16) {
      const oldest = this.parsed.keys().next().value;
      if (oldest !== undefined) this.parsed.delete(oldest);
    }
    return result;
  }

  async listItems(ref: FilingRef): Promise<{ items: { key: string; title: string; paragraphs: number; chars: number; warnings: string[] }[]; warnings: string[] }> {
    const { sections, warnings } = await this.parse(ref);
    return {
      items: [...sections.values()].map((s) => ({
        key: s.item,
        title: s.title,
        paragraphs: s.paragraphs.length,
        chars: s.charCount,
        warnings: [...new Set(s.warnings)],
      })),
      warnings: [...new Set(warnings)],
    };
  }

  async getSection(ref: FilingRef, item: string): Promise<SectionResult> {
    const { sections, warnings } = await this.parse(ref);
    const keys = [...sections.keys()];
    const r = resolveItemKey(item, keys);
    if ('error' in r) {
      return { status: 'not_found', filing: ref, item, reason: r.error, availableItems: keys };
    }
    const section = sections.get(r.key);
    if (!section) return { status: 'not_found', filing: ref, item, reason: 'Internal: key resolved but missing.', availableItems: keys };
    // Document-level parser doubts travel with the section so the caller sees them.
    return { status: 'ok', filing: ref, section: { ...section, warnings: [...section.warnings, ...warnings] } };
  }

  async diff(base: FilingRef, target: FilingRef, item: string, includeUnchanged = false): Promise<DiffResult> {
    const b = await this.getSection(base, item);
    if (b.status !== 'ok') return { status: 'not_found', side: 'base', detail: b };
    const t = await this.getSection(target, item);
    if (t.status !== 'ok') return { status: 'not_found', side: 'target', detail: t };
    if (b.section.item !== t.section.item) {
      const targetKeys = [...(await this.parse(target)).sections.keys()];
      return {
        status: 'not_found',
        side: 'target',
        detail: {
          status: 'not_found',
          filing: target,
          item,
          reason: `Item "${item}" resolved to ${b.section.item} in the base filing and ${t.section.item} in the target filing; qualify the item as ${b.section.item} or ${t.section.item}.`,
          availableItems: targetKeys,
        },
      };
    }
    const d = diffSections(b.section, t.section, base, target);
    return { status: 'ok', ...(includeUnchanged ? d : onlyChanges(d)) };
  }

  /** Per-Item statistics across two filings, sorted by weighted similarity. Paragraph text stays in diff(). */
  async diffAll(base: FilingRef, target: FilingRef): Promise<DiffAllResult> {
    const baseParsed = await this.parse(base);
    if (baseParsed.sections.size === 0) {
      return { status: 'not_found', side: 'base', reason: noItemsReason(baseParsed.warnings), filing: base };
    }
    const targetParsed = await this.parse(target);
    if (targetParsed.sections.size === 0) {
      return { status: 'not_found', side: 'target', reason: noItemsReason(targetParsed.warnings), filing: target };
    }

    const items: Extract<DiffAllResult, { status: 'ok' }>['items'] = [];
    const onlyInBase: Extract<DiffAllResult, { status: 'ok' }>['onlyInBase'] = [];
    const onlyInTarget: Extract<DiffAllResult, { status: 'ok' }>['onlyInTarget'] = [];
    const warnings = [
      ...baseParsed.warnings,
      ...[...baseParsed.sections.values()].flatMap((section) => section.warnings),
      ...targetParsed.warnings,
      ...[...targetParsed.sections.values()].flatMap((section) => section.warnings),
    ];

    for (const [item, baseSection] of baseParsed.sections) {
      const targetSection = targetParsed.sections.get(item);
      if (!targetSection) {
        onlyInBase.push({ item, title: baseSection.title });
        continue;
      }
      const diff = diffSections(baseSection, targetSection, base, target);
      items.push({ item: diff.item, title: diff.title, stats: diff.stats });
    }
    for (const [item, targetSection] of targetParsed.sections) {
      if (!baseParsed.sections.has(item)) onlyInTarget.push({ item, title: targetSection.title });
    }

    items.sort((a, b) => a.stats.similarity - b.stats.similarity);
    return { status: 'ok', base, target, items, onlyInBase, onlyInTarget, warnings: [...new Set(warnings)] };
  }

  /** Verbatim paragraphs matching a regex, with citations. Unknown item → not_found, never an empty list. */
  async search(ref: FilingRef, pattern: string, item?: string, limit?: number): Promise<SearchResult> {
    if (pattern.length > MAX_PATTERN_CHARS) throw new Error(`Pattern longer than ${MAX_PATTERN_CHARS} chars; simplify it.`);
    if (hasNestedQuantifier(pattern)) throw new Error('Unsafe pattern: nested quantifiers such as "(a+)+" are not allowed.');
    let re: RegExp;
    try {
      re = new RegExp(pattern, 'i');
    } catch (e) {
      throw new Error(`Invalid pattern: ${e instanceof Error ? e.message : String(e)}`);
    }
    const { sections, warnings } = await this.parse(ref);
    let pool = [...sections.values()];
    if (item) {
      const keys = [...sections.keys()];
      const r = resolveItemKey(item, keys);
      if ('error' in r) return { status: 'not_found', filing: ref, item, reason: r.error, availableItems: keys };
      pool = pool.filter((s) => s.item === r.key);
    }
    const searchWarnings = [...new Set([...warnings, ...pool.flatMap((section) => section.warnings)])];
    const matches: { citation: Citation; text: string }[] = [];
    for (const s of pool) {
      for (const p of s.paragraphs) {
        if (re.test(p.text)) {
          matches.push({ citation: cite(ref, s, p.index), text: p.text });
          if (limit !== undefined && matches.length >= limit) {
            return { status: 'ok', filing: ref, matches, warnings: searchWarnings };
          }
        }
      }
    }
    return { status: 'ok', filing: ref, matches, warnings: searchWarnings };
  }
}

function hasNestedQuantifier(pattern: string): boolean {
  const groups: { containsQuantifier: boolean }[] = [];
  let closedGroupContainsQuantifier = false;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '\\') {
      i++;
      closedGroupContainsQuantifier = false;
      continue;
    }
    if (ch === '[') {
      for (i++; i < pattern.length; i++) {
        if (pattern[i] === '\\') i++;
        else if (pattern[i] === ']') break;
      }
      closedGroupContainsQuantifier = false;
      continue;
    }
    if (ch === '(') {
      groups.push({ containsQuantifier: false });
      if (pattern[i + 1] === '?') i++;
      closedGroupContainsQuantifier = false;
      continue;
    }
    if (ch === ')') {
      const closed = groups.pop();
      closedGroupContainsQuantifier = closed?.containsQuantifier ?? false;
      if (closedGroupContainsQuantifier) {
        const parent = groups.at(-1);
        if (parent) parent.containsQuantifier = true;
      }
      continue;
    }

    let isQuantifier = ch === '*' || ch === '+' || ch === '?';
    if (ch === '{') {
      const quantifier = /^\{\d+(?:,\d*)?\}/.exec(pattern.slice(i));
      if (quantifier) {
        isQuantifier = true;
        i += quantifier[0].length - 1;
      }
    }
    if (isQuantifier) {
      if (closedGroupContainsQuantifier) return true;
      const current = groups.at(-1);
      if (current) current.containsQuantifier = true;
    }
    closedGroupContainsQuantifier = false;
  }
  return false;
}

export function cite(ref: FilingRef, section: Section, paragraph: number): Citation {
  return citeItem(ref, section.item, section.title, paragraph);
}

export function citeItem(ref: FilingRef, item: string, itemTitle: string, paragraph: number): Citation {
  return { ...ref, item, itemTitle, paragraph };
}

function noItemsReason(warnings: string[]): string {
  return warnings.join(' ') || 'No Items were found in the filing.';
}
