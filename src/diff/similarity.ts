/** Normalise formatting variants while retaining punctuation that can change financial meaning. */
export function normalise(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .toLowerCase()
    .replace(/\s+/gu, ' ')
    .trim();
}

/** Strip punctuation aggressively only when scoring candidate paragraph pairs. */
function pairingNormalise(text: string): string {
  return normalise(text).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function bigrams(text: string): Map<string, number> {
  const words = pairingNormalise(text).split(' ').filter(Boolean);
  const m = new Map<string, number>();
  if (words.length === 1 && words[0]) m.set(words[0], 1);
  for (let i = 0; i < words.length - 1; i++) {
    const k = `${words[i]} ${words[i + 1]}`;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** Sorensen-Dice similarity over word bigrams. Cheap, order-aware, good enough to pair edited paragraphs. */
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
