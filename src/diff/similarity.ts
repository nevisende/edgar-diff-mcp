/** Lower-case, strip punctuation, collapse whitespace. Punctuation-only edits therefore compare as equal. */
export function normalise(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function bigrams(text: string): Map<string, number> {
  const words = normalise(text).split(' ').filter(Boolean);
  const m = new Map<string, number>();
  if (words.length === 1 && words[0]) m.set(words[0], 1);
  for (let i = 0; i < words.length - 1; i++) {
    const k = `${words[i]} ${words[i + 1]}`;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** Sørensen–Dice similarity over word bigrams. Cheap, order-aware, good enough to pair edited paragraphs. */
export function dice(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  let sizeA = 0;
  let sizeB = 0;
  let inter = 0;
  for (const v of A.values()) sizeA += v;
  for (const v of B.values()) sizeB += v;
  if (sizeA === 0 && sizeB === 0) return 1;
  if (sizeA === 0 || sizeB === 0) return 0;
  for (const [k, v] of A) {
    const w = B.get(k);
    if (w) inter += Math.min(v, w);
  }
  return (2 * inter) / (sizeA + sizeB);
}
