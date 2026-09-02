import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { htmlToLines, resolveItemKey, splitItems } from '../src/edgar/sections.js';

const fx = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

describe('htmlToLines', () => {
  it('keeps block structure, drops scripts/styles, normalises nbsp', () => {
    const lines = htmlToLines(fx('acme-10k-2024.htm'));
    expect(lines.some((l) => l.includes('window.x'))).toBe(false);
    expect(lines.some((l) => l.includes('color:red'))).toBe(false);
    expect(lines).toContain('Item 1A. Risk Factors');
    expect(lines.every((l) => !l.includes(' '))).toBe(true);
  });
});

describe('splitItems', () => {
  const lines = htmlToLines(fx('acme-10k-2024.htm'));
  const { sections, warnings } = splitItems(lines, '10-K');

  it('finds the real sections and ignores the table of contents', () => {
    expect([...sections.keys()].sort()).toEqual(['1', '1A', '1B', '1C', '7']);
    expect(warnings).toEqual([]);
  });

  it('picks the body occurrence, not the TOC stub', () => {
    const risk = sections.get('1A')!;
    expect(risk.title).toBe('Risk Factors');
    expect(risk.charCount).toBeGreaterThan(400);
    expect(risk.paragraphs[0]!.text).toMatch(/^Investing in our common stock/);
  });

  it('strips page numbers from bodies', () => {
    for (const s of sections.values()) {
      expect(s.paragraphs.some((p) => /^\d{1,3}$/.test(p.text))).toBe(false);
    }
  });

  it('returns nothing when every heading sits in a table-of-contents cluster', () => {
    const tocOnly = ['Item 1. Business', 'Item 1A. Risk Factors', 'Item 7. MD&A'];
    const r = splitItems(tocOnly, '10-K');
    expect(r.sections.size).toBe(0);
    expect(r.warnings.join(' ')).toMatch(/table-of-contents cluster/);
  });

  it('prefixes 10-Q items with their Part', () => {
    const lines10q = [
      'PART I',
      'Item 1. Financial Statements',
      ...Array(10).fill('Balance sheet line with enough characters to count as a body paragraph.'),
      'Item 2. MD&A',
      ...Array(10).fill('Discussion paragraph with enough characters to count as a body paragraph, again.'),
      'PART II',
      'Item 1A. Risk Factors',
      ...Array(10).fill('A risk paragraph long enough that the section is not mistaken for a TOC entry.'),
    ];
    const r = splitItems(lines10q, '10-Q');
    expect([...r.sections.keys()]).toEqual(['I.1', 'I.2', 'II.1A']);
    expect(r.sections.get('II.1A')!.title).toBe('Risk Factors');
  });
});

describe('resolveItemKey', () => {
  it('accepts loose forms', () => {
    expect(resolveItemKey('item 1a', ['1', '1A'])).toEqual({ key: '1A' });
    expect(resolveItemKey(' 7 ', ['7', '7A'])).toEqual({ key: '7' });
  });
  it('resolves 10-Q suffixes when unambiguous and errors when not', () => {
    expect(resolveItemKey('1A', ['I.1', 'II.1A'])).toEqual({ key: 'II.1A' });
    const r = resolveItemKey('1', ['I.1', 'II.1']);
    expect('error' in r && r.error).toMatch(/ambiguous/);
  });
  it('errors on unknown items', () => {
    const r = resolveItemKey('9B', ['1', '1A']);
    expect('error' in r && r.error).toMatch(/not found/);
  });
});
