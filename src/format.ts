import type { SectionDiff } from './types.js';

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

