/**
 * Core types. Every value that leaves this server carries enough provenance
 * for a reader to open the original filing and find the exact paragraph.
 */

/** Identity of a single EDGAR filing. */
export interface FilingRef {
  /** Central Index Key, zero-padded to 10 digits. */
  cik: string;
  /** Accession number in dashed form, e.g. "0000320193-24-000123". */
  accession: string;
  /** Form type, e.g. "10-K", "10-Q". */
  form: string;
  /** ISO date the filing was accepted by the SEC. */
  filingDate: string;
  /** ISO period-of-report date, when EDGAR provides one. */
  reportDate?: string;
  /** Absolute URL of the primary document. */
  url: string;
}

/** Where a piece of text came from. Attached to every paragraph we return. */
export interface Citation extends FilingRef {
  /** Item key, e.g. "1A" (10-K) or "II.1A" (10-Q Part II). */
  item: string;
  /** Human title of the item, e.g. "Risk Factors". */
  itemTitle: string;
  /** Zero-based paragraph index inside the item. */
  paragraph: number;
}

export interface Paragraph {
  index: number;
  text: string;
}

export interface Section {
  /** Item key as it appears in `availableItems`. */
  item: string;
  title: string;
  paragraphs: Paragraph[];
  charCount: number;
  /** Anything the parser is unsure about. Empty means a clean parse. */
  warnings: string[];
}

/**
 * A section lookup either succeeds with verbatim text or fails loudly.
 * There is deliberately no third state: we never return a "best guess".
 */
export type SectionResult =
  | { status: 'ok'; filing: FilingRef; section: Section }
  | { status: 'not_found'; filing: FilingRef; item: string; reason: string; availableItems: string[] };

export type ChangeType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface WordEdit {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface ParagraphChange {
  type: ChangeType;
  base?: { paragraph: number; text: string };
  target?: { paragraph: number; text: string };
  /** 0..1 Dice similarity between base and target text, for `changed` only. */
  similarity?: number;
  /** Word-level edit script, for `changed` only. */
  wordDiff?: WordEdit[];
}

export interface DiffStats {
  baseParagraphs: number;
  targetParagraphs: number;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  /** Weighted paragraph similarity: unchanged count 1, changed count their Dice score, added/removed count 0. */
  similarity: number;
}

export interface SectionDiff {
  item: string;
  title: string;
  base: FilingRef;
  target: FilingRef;
  stats: DiffStats;
  changes: ParagraphChange[];
  warnings: string[];
}

export interface ItemDiffOverview {
  item: string;
  title: string;
  stats: DiffStats;
}

export interface FilingItemOverview {
  item: string;
  title: string;
}

/** Filing-wide change statistics, with no paragraph text. */
export type DiffAllResult =
  | {
      status: 'ok';
      base: FilingRef;
      target: FilingRef;
      items: ItemDiffOverview[];
      onlyInBase: FilingItemOverview[];
      onlyInTarget: FilingItemOverview[];
      warnings: string[];
    }
  | { status: 'not_found'; side: 'base' | 'target'; reason: string; filing: FilingRef };
