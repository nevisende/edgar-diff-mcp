import { describe, expect, it } from 'vitest';
import { diffSections, onlyChanges } from '../src/diff/sections.js';
import type { FilingRef, Section } from '../src/types.js';

const ref = (n: number): FilingRef => ({ cik: '1', accession: `0000000001-2${n}-000001`, form: '10-K', filingDate: `202${n}-01-01`, url: `u${n}` });
const sec = (...texts: string[]): Section => ({ item: '1A', title: 'Risk Factors', paragraphs: texts.map((text, index) => ({ index, text })), charCount: 0, warnings: [] });

describe('greedy pairing inside one removed/added run', () => {
  it('pairs a 2×2 run by best similarity, not by position', () => {
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

  it('treats punctuation-only edits as unchanged (documented normalisation)', () => {
    const d = diffSections(sec('We may fail, to protect IP.'), sec('We may fail to protect IP'), ref(4), ref(5));
    expect(d.stats.similarity).toBe(1);
  });
});
