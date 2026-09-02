# edgar-diff-mcp

**A read-only [MCP](https://modelcontextprotocol.io) server that lets a coding agent diff SEC filings section-by-section — and answers only with verbatim, cited text.**

Ask Claude *"what changed in Apple's risk factors between the last two 10-Ks?"* and get back the exact paragraphs that were added, removed or edited, each one tagged with the accession number, Item, paragraph index and source URL. No summary, no paraphrase, no guess.

Output of `npm run demo` (the bundled synthetic fixtures — see `tests/fixtures/README.md`):

```
10-K 2025-02-15 → 10-K 2026-02-15
Item 1A — Risk Factors
paragraphs 7 → 7 · +1 -1 ~1 · similarity 0.714

- [base ¶3] The COVID-19 pandemic and related public health measures have in the past disrupted …

~ [base ¶4 → target ¶3] similarity 0.786
  … capacity from two→three cloud providers, and increases in the price of that capacity, or constraints on its availability, could materially increase …

+ [target ¶4] Changes in trade policy, including the tariffs announced on imported robotic components …
```

## Why this exists

Reading what *changed* between two annual reports is one of the highest-signal, lowest-glamour jobs in fundamental research. It is also exactly the kind of task people now hand to an LLM — and exactly where an LLM is most dangerous, because a fluent summary of a diff is indistinguishable from a fluent hallucination of one.

This server takes a position on that:

1. **Read-only by construction.** Every tool is annotated `readOnlyHint: true` and there is no code path that writes anywhere except an opt-in local cache.
2. **Verbatim or nothing.** Tools return filing text as filed. The model can reason on top; the server never does the reasoning for it.
3. **Every paragraph is cited.** CIK, accession, Item, paragraph index, URL. A reader can open the filing and check.
4. **No data = no answer.** If an Item can't be located, you get `status: "not_found"` *and the list of Items that were found*. `search_filing` on an unknown Item is `not_found` too, never an empty list. You never get a best guess dressed up as a result.
5. **Honest degradation.** Anything the parser is unsure about is returned in `warnings[]` — a genuinely short Item ("None.") comes back *with* a warning rather than being silently dropped; truncated output says `truncated: true`.

These are the same rules a careful research desk applies to a junior analyst. They happen to be the rules that make LLM output trustworthy too.

## Tools

| Tool | What it does |
|---|---|
| `resolve_company` | Ticker (exact) or name (substring) → CIK candidates. `[]` if nothing matches. |
| `list_filings` | Recent filings for a CIK, filterable by form (`10-K`, `10-Q`). |
| `list_items` | Items found *with confidence* in a filing, with sizes. Call this when unsure what exists. |
| `get_section` | Verbatim paragraphs of one Item, each with a citation. `not_found` + `availableItems` otherwise. |
| `diff_sections` | Same Item across two filings → `added` / `removed` / `changed` paragraphs, each side cited, word-level edits for `changed`, stats. |
| `search_filing` | Regex over a filing (or one Item) → matching paragraphs, verbatim, cited. |

All six carry MCP annotations `readOnlyHint: true, destructiveHint: false, idempotentHint: true`, and every paragraph on every tool uses the same citation shape:

```json
{ "cik": "0000320193", "accession": "0000320193-24-000123", "form": "10-K", "filingDate": "2024-11-01",
  "item": "1A", "itemTitle": "Risk Factors", "paragraph": 17, "url": "https://www.sec.gov/Archives/edgar/data/320193/…" }
```

The server also sends MCP `instructions` telling the client to quote only tool output and to keep citations next to quotes.

## Install

```bash
git clone https://github.com/nevisende/edgar-diff-mcp
cd edgar-diff-mcp
npm install
npm run check      # typecheck (src + tests) and the whole test suite, offline
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
npm run cli -- search  320193 0000320193-24-000123 "tariff|export control" --item 1A
```

`npm run smoke:live -- MSFT 7` diffs a real Item 7 (MD&A) from EDGAR and exits non-zero on any `not_found` — a parser gap is a bug, not a soft failure.

## How the parser decides what is an "Item"

Every 10-K lists all of its Items twice: once in the table of contents and once as real headings. A regex cannot tell them apart. This parser flattens the HTML to lines, finds every short `Item N` heading, and then removes **clusters** of headings that sit within a couple of lines of each other — that is what a table of contents looks like once flattened, whatever markup produced it. Rows with a trailing page reference or a tiny body are dropped; if one Item still has several occurrences, the longest body wins. Sentences that merely *mention* an Item ("Item 7 of this report discusses…") are rejected as headings. 10-Q Items are prefixed with their Part (`II.1A`), because Part I and Part II reuse the same numbers.

See [`docs/DESIGN.md`](docs/DESIGN.md) for the full reasoning — including the residual case this heuristic can still get wrong, and how it fails when it does.

## Layout

```
src/
  edgar/client.ts     polite EDGAR client: mandatory UA, ≤10 req/s, optional cache
  edgar/sections.ts   HTML → lines → Items (the TOC problem lives here)
  diff/sections.ts    paragraph LCS + greedy pairing + word-level edits
  diff/similarity.ts  Dice coefficient over word bigrams
  service.ts          orchestration; the only place that assembles answers
  server.ts           MCP tools (buildServer) — thin, validated, read-only
  main.ts             stdio entry point
  cli.ts / format.ts  human interface over the same service
tests/
  fixtures/           synthetic 10-Ks with a known, documented diff and the parser traps built in
  *.test.ts           parser + edge cases, diff + pairing, service (fake EDGAR), MCP end-to-end (in-memory transport)
```

## Non-goals (for now)

- No LLM calls inside the server. The point is to give the model clean, cited inputs.
- No XBRL / financial-statement parsing. Items only.
- No ML-based section matching. Heading regex + TOC-cluster removal + longest-body, and an honest `not_found` when that isn't enough.

## Author

Furkan Denizhan — [github.com/nevisende](https://github.com/nevisende) · [linkedin.com/in/furkan-denizhan](https://linkedin.com/in/furkan-denizhan)

Built in a day with Claude Code, following the same discipline I use for the MCP servers I run in production: read-only by architecture, refuse rather than guess, and let the tests say what the code does.

MIT.
