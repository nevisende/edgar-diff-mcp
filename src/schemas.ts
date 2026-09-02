import { z } from 'zod';
import type { CompanyMatch } from './edgar/client.js';
import type { DiffResult, SearchResult } from './service.js';
import type {
  Citation,
  DiffAllResult,
  DiffStats,
  FilingItemOverview,
  FilingRef,
  ItemDiffOverview,
  Paragraph,
  Section,
  SectionResult,
  WordEdit,
} from './types.js';

export const FilingRefSchema = z.object({
  cik: z.string(),
  accession: z.string(),
  form: z.string(),
  filingDate: z.string(),
  reportDate: z.string().optional(),
  url: z.string(),
});

export const CitationSchema = FilingRefSchema.extend({
  item: z.string(),
  itemTitle: z.string(),
  paragraph: z.number().int().nonnegative(),
});

const ParagraphSchema = z.object({
  index: z.number().int().nonnegative(),
  text: z.string(),
});

const SectionSchema = z.object({
  item: z.string(),
  title: z.string(),
  paragraphs: z.array(ParagraphSchema),
  charCount: z.number().int().nonnegative(),
  warnings: z.array(z.string()),
});

const SectionNotFoundSchema = z.object({
  status: z.literal('not_found'),
  filing: FilingRefSchema,
  item: z.string(),
  reason: z.string(),
  availableItems: z.array(z.string()),
});

export const SectionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), filing: FilingRefSchema, section: SectionSchema }),
  SectionNotFoundSchema,
]);

const CompanyMatchSchema = z.object({
  cik: z.string(),
  ticker: z.string(),
  name: z.string(),
});

export const ResolveCompanyOutputSchema = z.object({ results: z.array(CompanyMatchSchema) });
export type ResolveCompanyOutput = z.infer<typeof ResolveCompanyOutputSchema>;

export const ListFilingsOutputSchema = z.object({ results: z.array(FilingRefSchema) });
export type ListFilingsOutput = z.infer<typeof ListFilingsOutputSchema>;

export const ListItemsOutputSchema = z.object({
  filing: FilingRefSchema,
  items: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      paragraphs: z.number().int().nonnegative(),
      chars: z.number().int().nonnegative(),
    }),
  ),
  warnings: z.array(z.string()),
});
export type ListItemsOutput = z.infer<typeof ListItemsOutputSchema>;

const CitedParagraphSchema = z.object({
  citation: CitationSchema,
  text: z.string(),
});

export type GetSectionOutput =
  | {
      status: 'ok';
      filing: FilingRef;
      item: string;
      title: string;
      totalParagraphs: number;
      truncated: boolean;
      warnings: string[];
      paragraphs: z.infer<typeof CitedParagraphSchema>[];
    }
  | Extract<SectionResult, { status: 'not_found' }>;

export const GetSectionOutputSchema = z.object({
  status: z.enum(['ok', 'not_found']),
  filing: FilingRefSchema,
  item: z.string(),
  title: z.string().optional(),
  totalParagraphs: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional(),
  warnings: z.array(z.string()).optional(),
  paragraphs: z.array(CitedParagraphSchema).optional(),
  reason: z.string().optional(),
  availableItems: z.array(z.string()).optional(),
});

const WordEditSchema = z.object({
  value: z.string(),
  added: z.boolean().optional(),
  removed: z.boolean().optional(),
});

const DiffStatsSchema = z.object({
  baseParagraphs: z.number().int().nonnegative(),
  targetParagraphs: z.number().int().nonnegative(),
  added: z.number().int().nonnegative(),
  removed: z.number().int().nonnegative(),
  changed: z.number().int().nonnegative(),
  unchanged: z.number().int().nonnegative(),
  similarity: z.number().min(0).max(1),
});

const CitedChangeSideSchema = z.object({
  paragraph: z.number().int().nonnegative(),
  text: z.string(),
  citation: CitationSchema,
});

const CitedParagraphChangeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('added'), target: CitedChangeSideSchema }),
  z.object({ type: z.literal('removed'), base: CitedChangeSideSchema }),
  z.object({
    type: z.literal('changed'),
    base: CitedChangeSideSchema,
    target: CitedChangeSideSchema,
    similarity: z.number().min(0).max(1),
    wordDiff: z.array(WordEditSchema),
  }),
  z.object({ type: z.literal('unchanged'), base: CitedChangeSideSchema, target: CitedChangeSideSchema }),
]);

export type DiffSectionsResult =
  | {
      status: 'ok';
      item: string;
      title: string;
      base: FilingRef;
      target: FilingRef;
      stats: DiffStats;
      changes: z.infer<typeof CitedParagraphChangeSchema>[];
      warnings: string[];
      truncated: boolean;
    }
  | Extract<DiffResult, { status: 'not_found' }>;
export type DiffSectionsOutput = DiffSectionsResult;

export const DiffSectionsOutputSchema = z.object({
  status: z.enum(['ok', 'not_found']),
  item: z.string().optional(),
  title: z.string().optional(),
  base: FilingRefSchema.optional(),
  target: FilingRefSchema.optional(),
  stats: DiffStatsSchema.optional(),
  changes: z.array(CitedParagraphChangeSchema).optional(),
  warnings: z.array(z.string()).optional(),
  truncated: z.boolean().optional(),
  side: z.enum(['base', 'target']).optional(),
  detail: SectionNotFoundSchema.optional(),
});

const ItemDiffOverviewSchema = z.object({ item: z.string(), title: z.string(), stats: DiffStatsSchema });
const FilingItemOverviewSchema = z.object({ item: z.string(), title: z.string() });

export type DiffAllItemsOutput = DiffAllResult;
export const DiffAllItemsOutputSchema = z.object({
  status: z.enum(['ok', 'not_found']),
  base: FilingRefSchema.optional(),
  target: FilingRefSchema.optional(),
  items: z.array(ItemDiffOverviewSchema).optional(),
  onlyInBase: z.array(FilingItemOverviewSchema).optional(),
  onlyInTarget: z.array(FilingItemOverviewSchema).optional(),
  warnings: z.array(z.string()).optional(),
  side: z.enum(['base', 'target']).optional(),
  reason: z.string().optional(),
  filing: FilingRefSchema.optional(),
});

export type SearchFilingOutput = SearchResult;
export const SearchFilingOutputSchema = z.object({
  status: z.enum(['ok', 'not_found']),
  filing: FilingRefSchema,
  matches: z.array(CitedParagraphSchema).optional(),
  warnings: z.array(z.string()).optional(),
  item: z.string().optional(),
  reason: z.string().optional(),
  availableItems: z.array(z.string()).optional(),
});

type Assert<T extends true> = T;
type Assignable<From, To> = [From] extends [To] ? true : false;
type WithoutExplicitUndefined<T> = T extends readonly (infer Item)[]
  ? WithoutExplicitUndefined<Item>[]
  : T extends object
    ? { [Key in keyof T]: WithoutExplicitUndefined<Exclude<T[Key], undefined>> }
    : T;

// Zod includes `undefined` in optional property values; normalise that one representational
// difference before checking both directions under exactOptionalPropertyTypes.
type _FilingRefSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof FilingRefSchema>>, FilingRef>>;
type _FilingRefTypeToSchema = Assert<Assignable<FilingRef, z.infer<typeof FilingRefSchema>>>;
type _CitationSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof CitationSchema>>, Citation>>;
type _CitationTypeToSchema = Assert<Assignable<Citation, z.infer<typeof CitationSchema>>>;
type _ParagraphSchemaToType = Assert<Assignable<z.infer<typeof ParagraphSchema>, Paragraph>>;
type _ParagraphTypeToSchema = Assert<Assignable<Paragraph, z.infer<typeof ParagraphSchema>>>;
type _SectionSchemaToType = Assert<Assignable<z.infer<typeof SectionSchema>, Section>>;
type _SectionTypeToSchema = Assert<Assignable<Section, z.infer<typeof SectionSchema>>>;
type _SectionResultSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof SectionResultSchema>>, SectionResult>>;
type _SectionResultTypeToSchema = Assert<Assignable<SectionResult, z.infer<typeof SectionResultSchema>>>;
type _CompanySchemaToType = Assert<Assignable<z.infer<typeof CompanyMatchSchema>, CompanyMatch>>;
type _CompanyTypeToSchema = Assert<Assignable<CompanyMatch, z.infer<typeof CompanyMatchSchema>>>;
type _WordEditSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof WordEditSchema>>, WordEdit>>;
type _WordEditTypeToSchema = Assert<Assignable<WordEdit, z.infer<typeof WordEditSchema>>>;
type _DiffStatsSchemaToType = Assert<Assignable<z.infer<typeof DiffStatsSchema>, DiffStats>>;
type _DiffStatsTypeToSchema = Assert<Assignable<DiffStats, z.infer<typeof DiffStatsSchema>>>;
type _ItemDiffSchemaToType = Assert<Assignable<z.infer<typeof ItemDiffOverviewSchema>, ItemDiffOverview>>;
type _ItemDiffTypeToSchema = Assert<Assignable<ItemDiffOverview, z.infer<typeof ItemDiffOverviewSchema>>>;
type _FilingItemSchemaToType = Assert<Assignable<z.infer<typeof FilingItemOverviewSchema>, FilingItemOverview>>;
type _FilingItemTypeToSchema = Assert<Assignable<FilingItemOverview, z.infer<typeof FilingItemOverviewSchema>>>;
// Flat output schemas deliberately make variant-specific fields optional. These checks ensure
// every stricter runtime result remains accepted by its advertised MCP output schema.
type _GetSectionOutputTypeToSchema = Assert<Assignable<GetSectionOutput, z.infer<typeof GetSectionOutputSchema>>>;
type _DiffSectionsOutputTypeToSchema = Assert<Assignable<DiffSectionsOutput, z.infer<typeof DiffSectionsOutputSchema>>>;
type _DiffAllOutputTypeToSchema = Assert<Assignable<DiffAllItemsOutput, z.infer<typeof DiffAllItemsOutputSchema>>>;
type _SearchOutputTypeToSchema = Assert<Assignable<SearchFilingOutput, z.infer<typeof SearchFilingOutputSchema>>>;
