import { diffArrays, diffWords } from 'diff';
import type { FilingRef, ParagraphChange, Section, SectionDiff, WordEdit } from '../types.js';
import { dice, normalise } from './similarity.js';

/** Paragraph pairs below this similarity are reported as remove+add, not as an edit. */
export const CHANGED_THRESHOLD = 0.5;

/**
 * Paragraph-level diff of two sections.
 *
 * 1. LCS over normalised paragraphs → unchanged / removed / added runs.
 * 2. Inside each adjacent removed/added run, greedily pair the most similar
 *    paragraphs and report them as `changed` with a word-level edit script.
 *
 * Everything returned is verbatim text plus paragraph indices, so a reader can
 * open the filing and verify each change.
 */
export function diffSections(base: Section, target: Section, baseRef: FilingRef, targetRef: FilingRef): SectionDiff {
  const baseNorm = base.paragraphs.map((p) => normalise(p.text));
  const targetNorm = target.paragraphs.map((p) => normalise(p.text));
  const parts = diffArrays(baseNorm, targetNorm);

  const changes: ParagraphChange[] = [];
  let bi = 0;
  let ti = 0;
  let pendingRemoved: number[] = [];
  let pendingAdded: number[] = [];

  const flush = (): void => {
    if (pendingRemoved.length === 0 && pendingAdded.length === 0) return;
    const removed = [...pendingRemoved];
    const added = [...pendingAdded];
    // Greedy best-pair matching on similarity.
    const pairs: { r: number; a: number; s: number }[] = [];
    for (const r of removed) {
      for (const a of added) {
        const s = dice(base.paragraphs[r]?.text ?? '', target.paragraphs[a]?.text ?? '');
        if (s >= CHANGED_THRESHOLD) pairs.push({ r, a, s });
      }
    }
    pairs.sort((x, y) => y.s - x.s);
    const usedR = new Set<number>();
    const usedA = new Set<number>();
    const matched: { r: number; a: number; s: number }[] = [];
    for (const p of pairs) {
      if (usedR.has(p.r) || usedA.has(p.a)) continue;
      usedR.add(p.r);
      usedA.add(p.a);
      matched.push(p);
    }
    // Emit in document order of the base side, then leftovers.
    const emitted: ParagraphChange[] = [];
    for (const r of removed) {
      const m = matched.find((x) => x.r === r);
      const bText = base.paragraphs[r]?.text ?? '';
      if (m) {
        const tText = target.paragraphs[m.a]?.text ?? '';
        emitted.push({
          type: 'changed',
          base: { paragraph: r, text: bText },
          target: { paragraph: m.a, text: tText },
          similarity: Number(m.s.toFixed(3)),
          wordDiff: wordEdits(bText, tText),
        });
      } else {
        emitted.push({ type: 'removed', base: { paragraph: r, text: bText } });
      }
    }
    for (const a of added) {
      if (usedA.has(a)) continue;
      emitted.push({ type: 'added', target: { paragraph: a, text: target.paragraphs[a]?.text ?? '' } });
    }
    changes.push(...emitted);
    pendingRemoved = [];
    pendingAdded = [];
  };

  for (const part of parts) {
    const n = part.value.length;
    if (part.removed) {
      for (let k = 0; k < n; k++) pendingRemoved.push(bi + k);
      bi += n;
    } else if (part.added) {
      for (let k = 0; k < n; k++) pendingAdded.push(ti + k);
      ti += n;
    } else {
      flush();
      for (let k = 0; k < n; k++) {
        changes.push({
          type: 'unchanged',
          base: { paragraph: bi + k, text: base.paragraphs[bi + k]?.text ?? '' },
          target: { paragraph: ti + k, text: target.paragraphs[ti + k]?.text ?? '' },
        });
      }
      bi += n;
      ti += n;
    }
  }
  flush();

  const count = (t: ParagraphChange['type']): number => changes.filter((c) => c.type === t).length;
  const unchanged = count('unchanged');
  const denom = Math.max(base.paragraphs.length, target.paragraphs.length, 1);
  return {
    item: base.item,
    title: base.title,
    base: baseRef,
    target: targetRef,
    stats: {
      baseParagraphs: base.paragraphs.length,
      targetParagraphs: target.paragraphs.length,
      added: count('added'),
      removed: count('removed'),
      changed: count('changed'),
      unchanged,
      similarity: Number((unchanged / denom).toFixed(3)),
    },
    changes,
    warnings: [...base.warnings, ...target.warnings],
  };
}

function wordEdits(a: string, b: string): WordEdit[] {
  return diffWords(a, b).map((p) => {
    const e: WordEdit = { value: p.value };
    if (p.added) e.added = true;
    if (p.removed) e.removed = true;
    return e;
  });
}

/** Drop `unchanged` entries — what an agent usually wants to read. */
export function onlyChanges(d: SectionDiff): SectionDiff {
  return { ...d, changes: d.changes.filter((c) => c.type !== 'unchanged') };
}
