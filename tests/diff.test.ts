import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { htmlToLines, splitItems } from '../src/edgar/sections.js';
import { diffSections, onlyChanges } from '../src/diff/sections.js';
import { dice } from '../src/diff/similarity.js';
import type { FilingRef } from '../src/types.js';

const fx = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const ref = (year: number): FilingRef => ({
  cik: '0000000001',
  accession: `0000000001-${String(year).slice(2)}-000001`,
  form: '10-K',
  filingDate: `${year + 1}-02-15`,
  url: `https://example.test/acme-10k-${year}.htm`,
});

const parse = (year: number) => splitItems(htmlToLines(fx(`acme-10k-${year}.htm`)), '10-K').sections;

describe('dice similarity', () => {
  it('is 1 for identical, 0 for disjoint, in between for edits', () => {
    expect(dice('the quick brown fox', 'the quick brown fox')).toBe(1);
    expect(dice('alpha beta gamma', 'delta epsilon zeta')).toBe(0);
    const s = dice('we purchase capacity from two cloud providers', 'we purchase capacity from three cloud providers');
    expect(s).toBeGreaterThan(0.5);
    expect(s).toBeLessThan(1);
  });
});

describe('diffSections on Risk Factors', () => {
  const d = diffSections(parse(2024).get('1A')!, parse(2025).get('1A')!, ref(2024), ref(2025));

  it('reports exactly one removed, one added, one changed paragraph', () => {
    expect(d.stats.removed).toBe(1);
    expect(d.stats.added).toBe(1);
    expect(d.stats.changed).toBe(1);
    expect(d.stats.unchanged).toBe(d.stats.baseParagraphs - 2);
  });

  it('returns verbatim text with paragraph indices on both sides', () => {
    const removed = d.changes.find((c) => c.type === 'removed')!;
    expect(removed.base!.text).toMatch(/COVID-19 pandemic/);
    expect(removed.target).toBeUndefined();

    const added = d.changes.find((c) => c.type === 'added')!;
    expect(added.target!.text).toMatch(/tariffs announced/);

    const changed = d.changes.find((c) => c.type === 'changed')!;
    expect(changed.base!.text).toMatch(/two cloud providers/);
    expect(changed.target!.text).toMatch(/three cloud providers/);
    expect(changed.similarity).toBeGreaterThan(0.5);
    expect(typeof changed.base!.paragraph).toBe('number');
    expect(typeof changed.target!.paragraph).toBe('number');
  });

  it('gives a word-level edit script for changed paragraphs', () => {
    const changed = d.changes.find((c) => c.type === 'changed')!;
    const removedWords = changed.wordDiff!.filter((w) => w.removed).map((w) => w.value.trim());
    const addedWords = changed.wordDiff!.filter((w) => w.added).map((w) => w.value.trim());
    expect(removedWords).toContain('two');
    expect(addedWords).toContain('three');
  });

  it('keeps document order and preserves unchanged paragraphs when asked', () => {
    const idx = d.changes.filter((c) => c.base).map((c) => c.base!.paragraph);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(onlyChanges(d).changes.every((c) => c.type !== 'unchanged')).toBe(true);
  });
});

describe('diffSections on identical sections', () => {
  it('reports similarity 1 and no changes', () => {
    const d = diffSections(parse(2024).get('1C')!, parse(2025).get('1C')!, ref(2024), ref(2025));
    expect(d.stats.similarity).toBe(1);
    expect(onlyChanges(d).changes).toEqual([]);
  });
});
