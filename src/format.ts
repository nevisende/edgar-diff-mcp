import type { DiffAllResult, SectionDiff } from './types.js';

export const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', RESET = '\x1b[0m';

export function printDiff(d: SectionDiff): void {
  const s = d.stats;
  console.log(`${DIM}${d.base.form} ${d.base.filingDate} → ${d.target.form} ${d.target.filingDate}${RESET}`);
  console.log(`Item ${d.item} — ${d.title}`);
  console.log(`paragraphs ${s.baseParagraphs} → ${s.targetParagraphs} · ${GREEN}+${s.added}${RESET} ${RED}-${s.removed}${RESET} ${YELLOW}~${s.changed}${RESET} · similarity ${s.similarity}`);
  for (const w of d.warnings) console.log(`${YELLOW}warning:${RESET} ${w}`);
  console.log('');
  for (const c of d.changes) {
    if (c.type === 'added') console.log(`${GREEN}+ [target ¶${c.target?.paragraph}] ${c.target?.text}${RESET}\n`);
    else if (c.type === 'removed') console.log(`${RED}- [base ¶${c.base?.paragraph}] ${c.base?.text}${RESET}\n`);
    else if (c.type === 'changed') {
      console.log(`${YELLOW}~ [base ¶${c.base?.paragraph} → target ¶${c.target?.paragraph}] similarity ${c.similarity}${RESET}`);
      const line = (c.wordDiff ?? [])
        .map((w) => (w.added ? `${GREEN}${w.value}${RESET}` : w.removed ? `${RED}${w.value}${RESET}` : w.value))
        .join('');
      console.log(`  ${line}\n`);
    }
  }
  console.log(`${DIM}base:   ${d.base.url}\ntarget: ${d.target.url}${RESET}`);
}

export function printDiffAll(d: Extract<DiffAllResult, { status: 'ok' }>): void {
  console.log(`${DIM}${d.base.form} ${d.base.filingDate} → ${d.target.form} ${d.target.filingDate}${RESET}`);
  const headers = ['item', 'title', '¶ base→target', '+/-/~', 'similarity'];
  const rows = d.items.map(({ item, title, stats }) => [
    item,
    title,
    `${stats.baseParagraphs}→${stats.targetParagraphs}`,
    `+${stats.added}/-${stats.removed}/~${stats.changed}`,
    stats.similarity.toFixed(3),
  ]);
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0)));
  const line = (cells: string[]): string => cells.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join(' | ');
  console.log(line(headers));
  console.log(widths.map((width) => '-'.repeat(width)).join('-|-'));
  for (const row of rows) console.log(line(row));
  if (d.onlyInBase.length) console.log(`only in base: ${d.onlyInBase.map((entry) => `Item ${entry.item} — ${entry.title}`).join(', ')}`);
  if (d.onlyInTarget.length) console.log(`only in target: ${d.onlyInTarget.map((entry) => `Item ${entry.item} — ${entry.title}`).join(', ')}`);
  for (const warning of d.warnings) console.log(`${YELLOW}warning:${RESET} ${warning}`);
  console.log(`${DIM}base:   ${d.base.url}\ntarget: ${d.target.url}${RESET}`);
}
