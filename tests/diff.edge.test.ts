import { describe, expect, it } from 'vitest';
import { diffSections, onlyChanges } from '../src/diff/sections.js';
import type { FilingRef, Section } from '../src/types.js';

const ref = (n: number): FilingRef => ({ cik: '1', accession: `0000000001-2${n}-000001`, form: '10-K', filingDate: `202${n}-01-01`, url: `u${n}` });
const sec = (...texts: string[]): Section => ({ item: '1A', title: 'Risk Factors', paragraphs: texts.map((text, index) => ({ index, text })), charCount: 0, warnings: [] });

describe('greedy pairing inside one removed/added run', () => {
  it('weights a single changed paragraph by Dice while keeping identical at 1 and disjoint at 0', () => {
    const base = 'During fiscal year 2024 we continued to invest in our products services employees operations supply chain and long term strategic growth initiatives.';
    const target = 'During fiscal year 2025 we continued to invest in our products services employees operations supply chain and long term strategic growth initiatives.';

    expect(diffSections(sec(base), sec(target), ref(4), ref(5)).stats.similarity).toBeCloseTo(0.905, 3);
    expect(diffSections(sec(base), sec(base), ref(4), ref(5)).stats.similarity).toBe(1);
    expect(diffSections(sec('alpha beta gamma'), sec('delta epsilon zeta'), ref(4), ref(5)).stats.similarity).toBe(0);
  });

  it('pairs a 2x2 run by best similarity, not by position', () => {
    const base = sec('same', 'Our supply chain depends on two contract manufacturers in Asia.', 'We face intense competition from established automation vendors.', 'same2');
    const target = sec('same', 'We face intense competition from established automation vendors and start-ups.', 'Our supply chain depends on three contract manufacturers in Asia and Mexico.', 'same2');
    const d = onlyChanges(diffSections(base, target, ref(4), ref(5)));
    expect(d.stats).toMatchObject({ changed: 2, added: 0, removed: 0 });
    const supply = d.changes.find((c) => /supply chain/.test(c.base?.text ?? ''))!;
    expect(supply.target!.text).toMatch(/three contract manufacturers/);
    expect(supply.base!.paragraph).toBe(1);
    expect(supply.target!.paragraph).toBe(2);
  });

  it('reports a heavy rewrite as remove+add, never as an invented edit', () => {
    const base = sec('same', 'Interest rates may rise and increase our borrowing costs.');
    const target = sec('same', 'Our robots operate alongside people and an accident could cause litigation.');
    const d = onlyChanges(diffSections(base, target, ref(4), ref(5)));
    expect(d.stats).toMatchObject({ changed: 0, added: 1, removed: 1 });
  });

  it('reports a punctuation-only edit as changed while section similarity stays 1', () => {
    const d = diffSections(sec('We may fail, to protect IP.'), sec('We may fail to protect IP'), ref(4), ref(5));
    expect(d.stats.changed).toBe(1);
    expect(d.stats.unchanged).toBe(0);
    expect(d.stats.similarity).toBe(1);
  });
});
