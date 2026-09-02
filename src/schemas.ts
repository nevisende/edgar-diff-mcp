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

export const GetSectionResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    filing: FilingRefSchema,
    item: z.string(),
    title: z.string(),
    totalParagraphs: z.number().int().nonnegative(),
    truncated: z.boolean(),
    warnings: z.array(z.string()),
    paragraphs: z.array(CitedParagraphSchema),
  }),
  SectionNotFoundSchema,
]);
export type GetSectionResult = z.infer<typeof GetSectionResultSchema>;
export const GetSectionOutputSchema = z.object({ result: GetSectionResultSchema });
export type GetSectionOutput = z.infer<typeof GetSectionOutputSchema>;

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

const DiffSectionsNotFoundSchema = z.object({
  status: z.literal('not_found'),
  side: z.enum(['base', 'target']),
  detail: SectionNotFoundSchema,
});

export const DiffSectionsResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    item: z.string(),
    title: z.string(),
    base: FilingRefSchema,
    target: FilingRefSchema,
    stats: DiffStatsSchema,
    changes: z.array(CitedParagraphChangeSchema),
    warnings: z.array(z.string()),
    truncated: z.boolean(),
  }),
  DiffSectionsNotFoundSchema,
]);
export type DiffSectionsResult = z.infer<typeof DiffSectionsResultSchema>;
export const DiffSectionsOutputSchema = z.object({ result: DiffSectionsResultSchema });
export type DiffSectionsOutput = z.infer<typeof DiffSectionsOutputSchema>;

const ItemDiffOverviewSchema = z.object({ item: z.string(), title: z.string(), stats: DiffStatsSchema });
const FilingItemOverviewSchema = z.object({ item: z.string(), title: z.string() });

export const DiffAllResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    base: FilingRefSchema,
    target: FilingRefSchema,
    items: z.array(ItemDiffOverviewSchema),
    onlyInBase: z.array(FilingItemOverviewSchema),
    onlyInTarget: z.array(FilingItemOverviewSchema),
    warnings: z.array(z.string()),
  }),
  z.object({
    status: z.literal('not_found'),
    side: z.enum(['base', 'target']),
    reason: z.string(),
    filing: FilingRefSchema,
  }),
]);
export const DiffAllItemsOutputSchema = z.object({ result: DiffAllResultSchema });
export type DiffAllItemsOutput = z.infer<typeof DiffAllItemsOutputSchema>;

export const SearchResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ok'),
    filing: FilingRefSchema,
    matches: z.array(CitedParagraphSchema),
    warnings: z.array(z.string()),
  }),
  SectionNotFoundSchema,
]);
export const SearchFilingOutputSchema = z.object({ result: SearchResultSchema });
export type SearchFilingOutput = z.infer<typeof SearchFilingOutputSchema>;

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
type _DiffAllSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof DiffAllResultSchema>>, DiffAllResult>>;
type _DiffAllTypeToSchema = Assert<Assignable<DiffAllResult, z.infer<typeof DiffAllResultSchema>>>;
type _SearchSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof SearchResultSchema>>, SearchResult>>;
type _SearchTypeToSchema = Assert<Assignable<SearchResult, z.infer<typeof SearchResultSchema>>>;
type _DiffNotFoundSchemaToType = Assert<Assignable<WithoutExplicitUndefined<z.infer<typeof DiffSectionsNotFoundSchema>>, DiffResult>>;
