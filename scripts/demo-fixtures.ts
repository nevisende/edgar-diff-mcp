/** Offline demo: diff the bundled synthetic 10-Ks. No network, no env needed. */
import { readFileSync } from 'node:fs';
import { htmlToLines, splitItems } from '../src/edgar/sections.js';
import { diffSections, onlyChanges } from '../src/diff/sections.js';
import { printDiff } from '../src/format.js';
import type { FilingRef } from '../src/types.js';

const fx = (n: string) => readFileSync(new URL(`../tests/fixtures/${n}`, import.meta.url), 'utf8');
const ref = (y: number): FilingRef => ({ cik: '0000000001', accession: `0000000001-${String(y).slice(2)}-000001`, form: '10-K', filingDate: `${y + 1}-02-15`, url: `tests/fixtures/acme-10k-${y}.htm` });
const item = process.argv[2] ?? '1A';
const a = splitItems(htmlToLines(fx('acme-10k-2024.htm')), '10-K').sections.get(item);
const b = splitItems(htmlToLines(fx('acme-10k-2025.htm')), '10-K').sections.get(item);
if (!a || !b) throw new Error(`Item ${item} not in fixtures`);
printDiff(onlyChanges(diffSections(a, b, ref(2024), ref(2025))));
