import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { htmlToLines, splitItems, MIN_BODY_CHARS } from '../src/edgar/sections.js';
import { titleFor } from '../src/edgar/items.js';

const fx = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const lines = htmlToLines(fx('acme-10k-2024.htm'));
const { sections, warnings } = splitItems(lines, '10-K');

describe('table-of-contents defences', () => {
  it('does not let the last TOC entry swallow the forward-looking-statements preamble', () => {
    // If the TOC cluster were not removed, "Item 7." from the TOC would own the preamble
    // (which is > MIN_BODY_CHARS) and could beat or pollute the real Item 7.
    const mdna = sections.get('7')!;
    expect(mdna.paragraphs[0]!.text).toMatch(/^Total revenue for fiscal 2024/);
    expect(mdna.paragraphs.some((p) => /forward-looking statements/i.test(p.text))).toBe(false);
    expect(warnings).toEqual([]);
  });

  it('treats "Item 7 of this report discusses…" as body text, not a heading', () => {
    const business = sections.get('1')!;
    expect(business.paragraphs.some((p) => p.text.startsWith('Item 7 of this report'))).toBe(true);
    expect(sections.get('7')!.warnings.some((w) => /appeared/.test(w))).toBe(false);
  });

  it('returns a genuinely short Item ("None.") with a warning instead of refusing it as a TOC stub', () => {
    const s = sections.get('1B')!;
    expect(s).toBeDefined();
    expect(s.paragraphs.map((p) => p.text)).toEqual(['None.']);
    expect(s.charCount).toBeLessThan(MIN_BODY_CHARS);
    expect(s.warnings.join(' ')).toMatch(/placeholder/);
  });

  it('keeps table cells separated so "verbatim" stays true for tables', () => {
    const mdna = sections.get('7')!;
    const row = mdna.paragraphs.find((p) => /^Hardware/.test(p.text))!;
    expect(row.text).toBe('Hardware $243.5 million 12%');
  });

  it('drops zero-width characters that break heading regexes in real EDGAR HTML', () => {
    const l = htmlToLines('<div>Item&#8203;&#160;1A.&#8203; Risk Factors</div><div>' + 'x'.repeat(500) + '</div>');
    expect(l[0]).toBe('Item 1A. Risk Factors');
  });

  it('handles a 10-Q whose TOC precedes the body with Part tracking intact', () => {
    const body = (s: string) => Array(8).fill(s);
    const tenQ = [
      'TABLE OF CONTENTS',
      'PART I FINANCIAL INFORMATION',
      'Item 1. Financial Statements 3',
      'Item 2. Management\'s Discussion 12',
      'PART II OTHER INFORMATION',
      'Item 1A. Risk Factors 20',
      'Item 6. Exhibits 25',
      'PART I. FINANCIAL INFORMATION',
      'Item 1. Financial Statements',
      ...body('Condensed consolidated balance sheet line with enough characters to count as body.'),
      'Item 2. Management\'s Discussion and Analysis',
      ...body('See Part II, Item 1A of this report for risks. Discussion paragraph with enough length here.'),
      'PART II. OTHER INFORMATION',
      'Item 1A. Risk Factors',
      ...body('A risk paragraph long enough that the section is clearly not a table-of-contents entry.'),
      'Item 6. Exhibits',
      'Exhibit 31.1 Certification.',
    ];
    const r = splitItems(tenQ, '10-Q');
    expect([...r.sections.keys()]).toEqual(['I.1', 'I.2', 'II.1A', 'II.6']);
    // The cross-reference "See Part II, Item 1A…" inside I.2 must not flip the Part.
    expect(r.sections.get('I.2')!.paragraphs).toHaveLength(8);
    expect(r.sections.get('II.6')!.warnings.join(' ')).toMatch(/placeholder/);
  });

  it('silently discards TOC-sized rivals when spaced rows escape clustering', () => {
    const spaced = splitItems(htmlToLines(fx('spaced-toc-10k.htm')), '10-K');
    expect([...spaced.sections.keys()]).toEqual(['1', '1A', '7']);
    expect(spaced.warnings).toEqual([]);
    for (const section of spaced.sections.values()) {
      expect(section.charCount).toBeGreaterThanOrEqual(MIN_BODY_CHARS);
      expect(section.warnings).toEqual([]);
    }
  });

  it('does not count a substantive TOC tail as a duplicate-heading rival', () => {
    const result = splitItems(htmlToLines(fx('toc-tail-duplicate-10k.htm')), '10-K');
    const summary = result.sections.get('16');

    expect([...result.sections.keys()]).toEqual(['16']);
    expect(summary?.paragraphs[0]?.text).toMatch(/^Acme elects to provide/);
    expect(summary?.warnings).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});

describe('combined Part and Item headings', () => {
  it('parses an Item heading that shares one line with its Part heading', () => {
    const result = splitItems(htmlToLines(fx('part-item-same-line-10q.htm')), '10-Q');
    const risk = result.sections.get('II.1A');

    expect([...result.sections.keys()]).toEqual(['I.1', 'II.1A']);
    expect(risk?.title).toBe('Risk Factors');
    expect(risk?.paragraphs[0]?.text).toMatch(/^Acme faces hypothetical supply constraints/);
    expect(result.warnings).toEqual([]);
  });

  it('parses a same-line Part and Item heading without intervening punctuation', () => {
    const result = splitItems(htmlToLines(fx('part-item-no-punctuation-10q.htm')), '10-Q');
    const statements = result.sections.get('I.1');

    expect([...result.sections.keys()]).toEqual(['I.1']);
    expect(statements?.title).toBe('Financial Statements');
    expect(statements?.paragraphs[0]?.text).toMatch(/^Acme's condensed balance sheets/);
    expect(result.warnings).toEqual([]);
  });
});

describe('fused headings', () => {
  const fused = splitItems(htmlToLines(fx('fused-headings-10k.htm')), '10-K').sections;

  it('splits canonical Item titles from a first paragraph in the same block', () => {
    expect([...fused.keys()]).toEqual(['1', '1A', '7']);
    expect(fused.get('1')!.paragraphs[0]!.text).toMatch(/^Acme designs industrial robots/);
    expect(fused.get('1A')!.paragraphs[0]!.text).toMatch(/^Investing in Acme involves substantial risks/);
    expect(fused.get('1A')!.warnings.join(' ')).toContain('heading and first paragraph were in one block; split at Risk Factors');
  });

  it('uses a nearby sentence boundary only when it clearly precedes body text', () => {
    const mdna = fused.get('7')!;
    expect(mdna.paragraphs[0]!.text).toMatch(/^Revenue increased as customers/);
    expect(mdna.warnings.join(' ')).toContain('heading and first paragraph were in one block; split at Results of Operations.');
  });

  it('keeps rejecting an overlong Item-like sentence when no split is safe', () => {
    expect(fused.has('2')).toBe(false);
    expect(fused.get('7')!.paragraphs.at(-1)!.text).toMatch(/^Item 2\. of this report/);
  });
});

describe('short fused headings', () => {
  const shortFused = splitItems(htmlToLines(fx('short-fused-headings-10k.htm')), '10-K').sections;

  it('splits a sentence-like remainder after a canonical title regardless of line length', () => {
    const risk = shortFused.get('1A')!;
    expect(risk.paragraphs[0]?.text).toBe('We face supply disruptions.');
    expect(risk.warnings).toContain('heading and first paragraph were in one block; split at Risk Factors');
  });

  it('keeps a short canonical-title continuation as part of the heading', () => {
    const comments = shortFused.get('1B')!;
    expect(comments.paragraphs.map((paragraph) => paragraph.text)).toEqual(['None.']);
    expect(comments.warnings.some((warning) => /heading and first paragraph/.test(warning))).toBe(false);
  });
});

describe('combined headings', () => {
  const combined = splitItems(htmlToLines(fx('combined-headings-10k.htm')), '10-K').sections;

  it('registers list headings under every named Item with identical bodies', () => {
    expect([...combined.keys()]).toEqual([
      '1', '1A', '2', '3', '4', '5', '6', '7', '7A', '8', '9', '10', '11', '12', '13', '14', '15',
    ]);
    expect(combined.get('5')!.paragraphs).toEqual(combined.get('6')!.paragraphs);
    expect(combined.get('5')!.title).toBe("Market for Registrant's Common Equity");
    expect(combined.get('6')!.title).toBe('[Reserved]');
    expect(combined.get('6')!.warnings).toContain(
      'Combined heading "Items 5 and 6": this body covers Items 5, 6',
    );
  });

  it('uses each Item canonical title when the combined title is empty', () => {
    const ten = combined.get('10')!;
    expect(ten.title).toBe('Directors, Executive Officers and Corporate Governance');
    for (const key of ['11', '12', '13', '14']) {
      expect(combined.get(key)!.paragraphs).toEqual(ten.paragraphs);
    }
    expect(combined.get('11')!.title).toBe('Executive Compensation');
    expect(combined.get('12')!.title).toBe('Security Ownership');
    expect(combined.get('13')!.title).toBe('Certain Relationships and Related Transactions');
    expect(combined.get('14')!.title).toBe('Principal Accountant Fees and Services');
    expect(ten.warnings).toContain(
      'Combined heading "Items 10, 11, 12, 13 and 14": this body covers Items 10, 11, 12, 13, 14',
    );
  });

  it('expands through and hyphen ranges, including lettered list Items', () => {
    expect(combined.get('1')!.paragraphs).toEqual(combined.get('1A')!.paragraphs);
    expect(combined.get('3')!.paragraphs).toEqual(combined.get('4')!.paragraphs);
    expect(combined.get('8')!.paragraphs).toEqual(combined.get('9')!.paragraphs);
  });

  it('does not parse an incorporation sentence as a combined heading', () => {
    expect(combined.get('5')!.paragraphs.some((p) => p.text.startsWith('Items 10 through 14 are incorporated'))).toBe(true);
    expect(combined.get('10')!.paragraphs[0]!.text).toMatch(/^The disclosures required by these Items/);
  });
});

describe('running Item headers', () => {
  const running = splitItems(htmlToLines(fx('running-item-headers-10k.htm')), '10-K').sections;

  it('does not split a titled section at repeated bare page headers', () => {
    const risk = running.get('1A')!;
    expect(risk.paragraphs).toHaveLength(7);
    expect(risk.paragraphs[0]!.text).toMatch(/^Our operations and financial results/);
    expect(risk.paragraphs.at(-1)!.text).toMatch(/^Acme depends on retaining qualified employees/);
    expect(risk.paragraphs.some((p) => /^Item 1A$/i.test(p.text))).toBe(false);
    expect(risk.paragraphs.some((p) => /Fiscal 2024 Form 10-K/.test(p.text))).toBe(false);
    expect(risk.warnings.some((w) => /appeared/.test(w))).toBe(false);
  });

  it('keeps consecutive short sections whose long titles are exact known Item titles', () => {
    expect([...running.keys()]).toEqual(['1', '1A', '1B', '5', '12', '13', '14']);
    for (const key of ['5', '12', '13', '14']) {
      expect(running.get(key)!.charCount).toBeLessThan(MIN_BODY_CHARS);
      expect(running.get(key)!.paragraphs).toHaveLength(1);
    }
    expect(running.has('2')).toBe(false);
    expect(running.has('3')).toBe(false);
  });

  it('merges identical titled running headers separated by substantive body text', () => {
    const result = splitItems(htmlToLines(fx('titled-running-item-headers-10q.htm')), '10-Q');
    const mdna = result.sections.get('I.2');

    expect(mdna?.paragraphs).toHaveLength(12);
    expect(mdna?.paragraphs[0]?.text).toMatch(/^On the first synthetic page/);
    expect(mdna?.paragraphs.at(-1)?.text).toMatch(/^A last substantive paragraph/);
    expect(mdna?.paragraphs.some((p) => /^Item 2\./.test(p.text))).toBe(false);
    expect(mdna?.warnings).toEqual(['3 repeated running headers merged']);
  });

  it('does not merge recurring headings across a different title for the same key', () => {
    const controls = splitItems(htmlToLines(fx('titled-running-item-headers-10q.htm')), '10-Q').sections.get('I.4');

    expect(controls?.paragraphs).toHaveLength(1);
    expect(controls?.warnings.some((warning) => /repeated running headers merged/.test(warning))).toBe(false);
  });
});

describe('repeated page furniture', () => {
  const furnitureLines = htmlToLines(fx('repeated-page-footer-10k.htm'));
  const furniture = splitItems(furnitureLines, '10-K').sections.get('1A')!;

  it('drops repeated Form 10-K footers but preserves ordinary numeric table rows', () => {
    expect(furnitureLines.some((line) => /Apple Inc\. \| 2024 Form 10-K/.test(line))).toBe(false);
    expect(furniture.paragraphs.some((p) => /Apple Inc\. \| 2024 Form 10-K/.test(p.text))).toBe(false);
    expect(furniture.paragraphs.map((p) => p.text)).toContain('Total 1,234');
  });
});

describe('consecutive placeholder Items', () => {
  const placeholders = splitItems(htmlToLines(fx('placeholder-cluster-10q.htm')), '10-Q').sections;

  it('returns each real placeholder instead of classifying the run as a TOC', () => {
    expect([...placeholders.keys()]).toEqual(['I.1', 'II.2', 'II.3', 'II.4', 'II.6']);
    expect(placeholders.get('II.2')!.paragraphs.map((p) => p.text)).toEqual(['None.']);
    expect(placeholders.get('II.3')!.paragraphs.map((p) => p.text)).toEqual(['None.']);
    expect(placeholders.get('II.4')!.paragraphs.map((p) => p.text)).toEqual(['Not applicable.']);
  });
});

describe('consecutive short real Items', () => {
  const shortSections = splitItems(htmlToLines(fx('short-real-sections-10k.htm')), '10-K').sections;

  it('does not classify a run of short sentence bodies as a table of contents', () => {
    expect([...shortSections.keys()]).toEqual(['1B', '2', '3']);
    expect(shortSections.get('1B')?.paragraphs.map((paragraph) => paragraph.text)).toEqual(['There were no staff comments.']);
    expect(shortSections.get('2')?.paragraphs.map((paragraph) => paragraph.text)).toEqual(['We lease our sole office.']);
    expect(shortSections.get('3')?.paragraphs.map((paragraph) => paragraph.text)).toEqual(['There are no material proceedings.']);
  });
});

describe('titleFor', () => {
  it('only applies canonical titles to forms it knows', () => {
    expect(titleFor('10-K', '3', 'whatever')).toBe('Legal Proceedings');
    expect(titleFor('10-Q', 'II.1A', '')).toBe('Risk Factors');
    expect(titleFor('20-F', '3', 'Key Information.')).toBe('Key Information');
    expect(titleFor('8-K', '2', '')).toBe('Untitled');
  });
});
