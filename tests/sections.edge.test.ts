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

describe('combined headings', () => {
  const combined = splitItems(htmlToLines(fx('combined-headings-10k.htm')), '10-K').sections;

  it('registers list headings under every named Item with identical bodies', () => {
    expect([...combined.keys()]).toEqual([
      '1', '1A', '2', '3', '4', '5', '6', '7', '7A', '8', '9', '10', '11', '12', '13', '14', '15',
    ]);
    expect(combined.get('5')!.paragraphs).toEqual(combined.get('6')!.paragraphs);
    expect(combined.get('5')!.title).toBe('Market Information');
    expect(combined.get('6')!.warnings).toContain(
      'Combined heading "Items 5 and 6": this body covers Items 5, 6',
    );
  });

  it('accepts an empty combined title and shares it across all five Items', () => {
    const ten = combined.get('10')!;
    expect(ten.title).toBe('');
    for (const key of ['11', '12', '13', '14']) {
      expect(combined.get(key)!.paragraphs).toEqual(ten.paragraphs);
      expect(combined.get(key)!.title).toBe('');
    }
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

describe('titleFor', () => {
  it('only applies canonical titles to forms it knows', () => {
    expect(titleFor('10-K', '3', 'whatever')).toBe('Legal Proceedings');
    expect(titleFor('10-Q', 'II.1A', '')).toBe('Risk Factors');
    expect(titleFor('20-F', '3', 'Key Information.')).toBe('Key Information');
    expect(titleFor('8-K', '2', '')).toBe('Untitled');
  });
});
