# edgar-diff-mcp

[![CI](https://github.com/nevisende/edgar-diff-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/nevisende/edgar-diff-mcp/actions/workflows/ci.yml)

**A read-only [MCP](https://modelcontextprotocol.io) server that lets a coding agent diff SEC filings section-by-section and answers only with verbatim, cited text.**

Ask Claude *"what changed in Apple's risk factors between the last two 10-Ks?"* and get back the exact paragraphs that were added, removed or edited, each one tagged with the accession number, Item, paragraph index and source URL. No summary, no paraphrase, no guess.

Output of `npm run demo` (the bundled synthetic fixtures; see `tests/fixtures/README.md`):

```
10-K 2025-02-15 -> 10-K 2026-02-15
Item 1A - Risk Factors
paragraphs 7 -> 7 | +1 -1 ~1 | similarity 0.827

- [base paragraph 3] The COVID-19 pandemic and related public health measures have in the past disrupted ...

~ [base paragraph 4 -> target paragraph 3] similarity 0.786
  ... capacity from two->three cloud providers, and increases in the price of that capacity, or constraints on its availability, could materially increase ...

+ [target paragraph 4] Changes in trade policy, including the tariffs announced on imported robotic components ...
```

## Measured on real filings

`npm run eval:live` measures the parser against 30 issuers, requesting the two most recent 10-Ks for each issuer and one 10-Q for eight of them. Each 10-K has 18 base expected Items, plus Item 1C for filings dated on or after 2023-12-15.

| Parser | Expected Items located | Expected Items plausible |
|---|---:|---:|
| Before parser fixes | 892/1090 (81.8% recall) | Not measured |
| Now | 1048/1166 (89.9% recall) | 1028/1166 (88.2%) |

The denominators differ because the expected-Item list was completed after the first run (10-K Item 9 and 10-Q Items 3-5 were missing from it); the first row is kept as it was reported at the time.

The plausible rate is lower because location checks only that the expected key exists, while plausibility also rejects undersized core sections and oversized Item 15 results. The latest run reports one evaluation issue: the ticker XOM now resolves to "ExxonMobil Holdings Corp" (CIK 0002115436, a 2026 holding company), which has filed no 10-K yet; the operating company's filings live under CIK 0000034088. The harness reports this as an issue rather than silently substituting.

GE, Intel and McDonald's stay `not_found` on purpose: their 10-Ks use company-specific section headings in the body and put the formal Item names in a cross-reference index. See [`evals/latest.md`](evals/latest.md) for the full committed result.

For end-to-end analyst scenarios across three agent harnesses see docs/SCENARIOS.md.

The same engine on Apple's real Item 1A:

```
10-K 2024-11-01 -> 10-K 2025-10-31
Item 1A - Risk Factors
paragraphs 115 -> 106 | +9 -18 ~51 | similarity 0.762
```

## Examples

`npm run examples` regenerates [`examples/`](examples/) from real filings by constructing the server with `buildServer()` and calling every tool through an MCP SDK client over an in-memory transport. The generated JSON is therefore the `structuredContent` a real MCP client receives; supported CLI equivalents are captured alongside it with ANSI styling removed.

- [Apple Item 1A diff with cited, word-level changes](examples/mcp/05-diff-sections-aapl-risk-factors.json)
- [GE Item 1A honest `not_found` result](examples/mcp/08-get-section-ge-not-found.json)
- [Berkshire Part II Item 1A unchanged without Item 2 table leakage](examples/mcp/09-diff-sections-brk-risk-factors.json)
- [Exxon's holding-company ticker resolution path](examples/mcp/10-xom-holding-company.json)

## Why this exists

Reading what *changed* between two annual reports is one of the highest-signal, lowest-glamour jobs in fundamental research. It is also exactly the kind of task people now hand to an LLM. That is exactly where an LLM is most dangerous, because a fluent summary of a diff is indistinguishable from a fluent hallucination of one.

This server takes a position on that:

1. **Read-only by construction.** Every tool is annotated `readOnlyHint: true` and there is no code path that writes anywhere except an opt-in local cache.
2. **Verbatim or nothing.** Tools return filing text as filed. The model can reason on top; the server never does the reasoning for it.
3. **Every paragraph is cited.** CIK, accession, Item, paragraph index, URL. A reader can open the filing and check.
4. **No data = no answer.** If an Item can't be located, you get `status: "not_found"` *and the list of Items that were found*. `search_filing` on an unknown Item is `not_found` too, never an empty list. You never get a best guess dressed up as a result.
5. **Honest degradation.** Anything the parser is unsure about is returned in `warnings[]`. A genuinely short Item ("None.") comes back *with* a warning rather than being silently dropped; truncated output says `truncated: true`.

These are the same rules a careful research desk applies to a junior analyst. They happen to be the rules that make LLM output trustworthy too.

## Tools

| Tool | What it does |
|---|---|
| `resolve_company` | Ticker (exact) or name (substring) -> CIK candidates. `[]` if nothing matches. |
| `list_filings` | Recent filings for a CIK, filterable by form (`10-K`, `10-Q`). |
| `list_items` | Items found *with confidence* in a filing, with sizes. Call this when unsure what exists. |
| `get_section` | Verbatim, cited paragraphs for one Item. `maxParagraphs` and `maxChars` bound each page; continue with `offset`; `not_found` + `availableItems` otherwise. |
| `diff_sections` | Same Item across two filings -> cited changes and stats. Word-level edits are opt-in with `includeWordDiff`; `maxChanges` and `maxChars` bound each page; continue with `offset`. |
| `diff_all_items` | Per-Item change statistics across two filings, most-changed first, plus Items found on only one side. No paragraphs. |
| `search_filing` | Regex over a filing (or one Item) -> matching paragraphs, verbatim, cited. `limit` and `maxChars` bound each page; continue with `offset`. |

All seven carry four MCP annotations: `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, and `openWorldHint: true`. Every tool declares an MCP `outputSchema` and returns `structuredContent` identical to its text JSON. Every paragraph on every tool uses the same citation shape:

```json
{ "cik": "0000320193", "accession": "0000320193-24-000123", "form": "10-K", "filingDate": "2024-11-01",
  "item": "1A", "itemTitle": "Risk Factors", "paragraph": 17, "url": "https://www.sec.gov/Archives/edgar/data/320193/..." }
```

The server also sends MCP `instructions` telling the client to quote only tool output and to keep citations next to quotes.

## Install

```bash
git clone https://github.com/nevisende/edgar-diff-mcp
cd edgar-diff-mcp
npm install
npm run check      # typecheck (src + tests) and all 102 tests, offline
npm run demo       # diff the bundled synthetic 10-Ks, offline
```

The SEC's [fair-access policy](https://www.sec.gov/os/accessing-edgar-data) requires a `User-Agent` with a contact address. The server refuses to start without one:

```bash
export EDGAR_USER_AGENT="edgar-diff-mcp/0.1 you@example.com"
export EDGAR_CACHE_DIR=".edgar-cache"    # optional; caches *filings* only (immutable), never the indexes
```

### Claude Code

```bash
claude mcp add edgar-diff -e EDGAR_USER_AGENT="edgar-diff-mcp/0.1 you@example.com" -- npx tsx /path/to/edgar-diff-mcp/src/main.ts
```

or, after `npm run build`, point any MCP client at `node dist/main.js` over stdio:

```json
{
  "mcpServers": {
    "edgar-diff": {
      "command": "node",
      "args": ["/path/to/edgar-diff-mcp/dist/main.js"],
      "env": { "EDGAR_USER_AGENT": "edgar-diff-mcp/0.1 you@example.com" }
    }
  }
}
```

Then, in a session:

> Resolve AAPL, list its last two 10-Ks, and diff Item 1A between them. Quote only what the tool returns.

### CLI (same engine, for humans)

```bash
npm run cli -- resolve AAPL
npm run cli -- filings 320193 --form 10-K --limit 2
npm run cli -- items   320193 0000320193-24-000123
npm run cli -- diff    320193 <olderAccession> <newerAccession> 1A
npm run cli -- diff-all 320193 <olderAccession> <newerAccession>
npm run cli -- search  320193 0000320193-24-000123 "tariff|export control" --item 1A
npm run eval:live
```

`npm run smoke:live -- MSFT 7` diffs a real Item 7 (MD&A) from EDGAR and exits non-zero on any `not_found`. A parser gap is a bug, not a soft failure.

## How the parser decides what is an "Item"

Every 10-K lists all of its Items twice: once in the table of contents and once as real headings. A regex cannot tell them apart. This parser flattens the HTML to lines, finds every short `Item N` heading, and treats a nearby run as a table of contents only when at least half of its members have a page reference or an empty body. Rows with a trailing page reference or a tiny body are dropped; if one Item still has several occurrences, the longest body wins. Sentences that merely *mention* an Item ("Item 7 of this report discusses...") are rejected as headings. A fused heading and first paragraph are split at a canonical Item title regardless of total line length, or at a clear sentence boundary on a long line. Combined headings such as "Items 10, 11, 12, 13 and 14" register the same body under every named Item with canonical titles and a warning. Repeated page furniture is removed conservatively: labelled footers such as "Apple Inc. | 2024 Form 10-K | 5" and bare Item headers are dropped when they repeat, while repeated titled Item headers are merged. 10-Q Items are prefixed with their Part (`II.1A`), because Part I and Part II reuse the same numbers.

See [`docs/DESIGN.md`](docs/DESIGN.md) for the full reasoning, including the residual case this heuristic can still get wrong and how it fails when it does.

## Layout

```
src/
  edgar/cache.ts      optional on-disk cache for immutable filing documents
  edgar/client.ts     polite EDGAR client: mandatory UA, <=10 req/s, optional cache
  edgar/items.ts      canonical Item titles and accepted title variants
  edgar/sections.ts   HTML -> lines -> Items (the TOC problem lives here)
  diff/sections.ts    paragraph LCS + greedy pairing + word-level edits
  diff/similarity.ts  Dice coefficient over word bigrams
  service.ts          orchestration; the only place that assembles answers
  schemas.ts          Zod output schemas, type-checked against src/types.ts
  types.ts            shared filing, section and diff types
  server.ts           MCP tools (buildServer): thin, validated, read-only
  main.ts             stdio entry point
  cli.ts / format.ts  human interface over the same service
  index.ts            public library exports
scripts/
  examples.ts         regenerate bounded real-output examples through MCP and CLI
  eval-live.ts        live filing corpus evaluation
  scenarios-mcp.ts    deterministic model-free scenario runner
  scenarios-harness.sh / scenarios-grade.ts
                      agent harness runner and answer grader
scenarios/             shared scenario plans, prompts and harness configuration
examples/
  README.md            generated index and notes for every example case
  mcp/ / cli/          bounded real MCP JSON and matching CLI text
evals/
  latest.md / results.json
                       committed live-corpus evaluation results
  scenarios/           captured answers and reports from all three harnesses
tests/
  client.test.ts      EDGAR index pagination, validation, retry and timeout coverage
  diff.test.ts / diff.edge.test.ts
                      paragraph diff, pairing and conservative normalisation
  sections.test.ts / sections.edge.test.ts
                      parser behaviour and fixture-backed edge cases
  service.test.ts     orchestration against a fake EDGAR client
  mcp.e2e.test.ts     MCP end-to-end over an in-memory transport
  fixtures/
    acme-10k-2024.htm / acme-10k-2025.htm
    acme-20f-2024.htm / acme-20f-2025.htm
    combined-headings-10k.htm
    fused-headings-10k.htm / short-fused-headings-10k.htm
    part-item-same-line-10q.htm / placeholder-cluster-10q.htm
    repeated-page-footer-10k.htm / running-item-headers-10k.htm
    short-real-sections-10k.htm / spaced-toc-10k.htm
    titled-running-item-headers-10q.htm / toc-tail-duplicate-10k.htm
.github/workflows/
  ci.yml               check, demo and build on Node 20 and 22
```

## Documents and data

- [`docs/DESIGN.md`](docs/DESIGN.md): the five correctness rules, parser and diff design, evaluation method, and deliberately exposed failure modes.
- [`docs/HOW_IT_WAS_BUILT.md`](docs/HOW_IT_WAS_BUILT.md): the agent-assisted build loop, division of labour, cold-review findings, and budget.
- [`docs/EXAMPLE_SESSION.md`](docs/EXAMPLE_SESSION.md): a worked MCP session showing tool calls, verbatim output, citations, and honest failure handling.
- [`docs/SCENARIOS.md`](docs/SCENARIOS.md): the two-layer, seven-scenario evaluation across the deterministic client and three agent harnesses.
- [`evals/latest.md`](evals/latest.md) and [`evals/results.json`](evals/results.json): the readable and machine-readable results from the 30-issuer live corpus.
- [`evals/scenarios/`](evals/scenarios/): captured answers from Claude, Codex, and Gemini plus deterministic and graded reports.
- [`examples/`](examples/): reproducible, bounded real output for every MCP tool and the CLI equivalents it can express.

## Related work

[`InPractise/diffing-tool`](https://github.com/InPractise/diffing-tool) (TypeScript, 2024) matches sections between filings by title and content in three similarity passes using Levenshtein distance. This project instead locates Items by heading structure, refuses when unsure, and diffs at paragraph level with citations: a narrower problem solved conservatively.

## Non-goals (for now)

- No LLM calls inside the server. The point is to give the model clean, cited inputs.
- No XBRL / financial-statement parsing. Items only.
- No ML-based section matching. Heading regex + TOC-cluster removal + longest-body, and an honest `not_found` when that isn't enough.

## Author

Furkan Denizhan | [github.com/nevisende](https://github.com/nevisende) | [linkedin.com/in/furkan-denizhan](https://linkedin.com/in/furkan-denizhan)

Built in about a day and a half with Claude Code, following the same discipline I use for the MCP servers I run in production: read-only by architecture, refuse rather than guess, and let the tests say what the code does.

See docs/HOW_IT_WAS_BUILT.md for the agent workflow behind this repository.

MIT.
