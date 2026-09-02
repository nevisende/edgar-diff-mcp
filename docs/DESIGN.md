# Design notes

## The problem this tool is actually for

An investor reading a 10-K does not want a summary of the risk factors. They want to know
which sentence the general counsel added this year, and which one quietly disappeared.
That is a diff problem, not a summarisation problem — and it only has value if every line of
the output can be traced back to the filing.

## Five rules, and why each one is a *rule* and not a setting

**1. Read-only by construction.**
There is no `write_*` tool and no code path that mutates anything outside the opt-in cache.
Read-only is an architectural stance: a tool that *could* write but is configured not to is a
tool you have to audit every time the config changes. I apply the same rule to the MCP servers
I run over production BI systems.

**2. Verbatim or nothing.**
The server returns text as filed. It never summarises, never rewrites, never "cleans up"
wording. If the model wants to summarise, it can — on top of cited inputs, where the summary
can be checked. Putting the LLM *inside* the tool would make its output unverifiable.

**3. Every paragraph is cited.**
`{ cik, accession, form, filingDate, item, itemTitle, paragraph, url }` on every paragraph of
every tool — `get_section`, `search_filing`, and both sides of every `diff_sections` change.
Paragraph index rather than character offsets, because paragraph boundaries survive
re-rendering and offsets do not.

**4. No data = no answer.**
The most dangerous failure for a retrieval tool is the confident empty result. `get_section`
on a missing Item returns `status: "not_found"` *and* `availableItems`, so the agent learns what
it *can* ask for. `diff_sections` reports which side was missing. `search_filing` on an unknown
Item is `not_found`, not `matches: []`. Table-of-contents rows are never returned as sections.

**5. Honest degradation.**
`warnings[]` on every parse, and document-level warnings travel with each section. If a
heading appears three times we say so. If an Item's whole body is "None." we return it and say
it looks like a placeholder. If a document has no Items at all we say that too, rather than
returning an empty map that looks like "no changes". EDGAR responses are validated with Zod, so
an upstream schema change is a readable error, not a `TypeError` three calls later.

## The table-of-contents problem

Every 10-K contains each Item heading at least twice: in the TOC and in the body. Vendors
render the TOC as a table, as a list, as bare paragraphs, or as links — there is no reliable
markup signal. What *is* reliable, once the HTML is flattened to one line per block:

- TOC rows sit next to each other (a gap of one or two lines, allowing for `PART I` rows);
- TOC rows usually end in a page reference ("Item 1A. Risk Factors 9");
- TOC rows are followed by almost no text — except the **last** one, which is followed by the
  cover-page tail, the forward-looking-statements boilerplate and `PART I`.

So the parser:

1. flattens HTML to lines, one per block element (`p`, `div`, `tr`, `li`, headings), with a
   space between table cells and zero-width characters stripped;
2. drops short page labels such as running headers and footers only when the same normalised
   label repeats at least three times, so an ordinary numbered table row remains verbatim;
3. finds every short line matching `Item <N[A-C]>` whose title is not a sentence (does not start
   lower-case, ≤ 12 words) — this rejects "Item 7 of this report discusses…";
4. splits a heading fused with its first paragraph only after a canonical Item title or a clear
   sentence boundary near the start; an uncertain split is rejected rather than guessed;
5. expands a combined heading such as "Items 10, 11, 12, 13 and 14" under every named Item and
   adds a warning, so the shared body is explicit rather than assigned to one guessed Item;
6. drops repeated bare `Item N` running headers only when there are at least three and the same
   Item also has a titled heading, so isolated real headings remain candidates;
7. groups headings into runs where consecutive headings are ≤ 2 lines apart *and the earlier
   one is a stub* (tiny body or page reference). A run of ≥ 3 is a table of contents;
8. drops every stub in the run. A run member with a real body and no page reference — the
   last TOC row swallowing the preamble, or the first real heading — is kept but flagged
   `tocTail`, and a flagged candidate is used only when no unflagged one exists for that Item;
9. among remaining candidates per Item, keeps the longest body;
10. returns short real bodies ("None.", "Not applicable.") *with a warning*, rather than
   refusing them, because they are real sections.

10-Q filings reuse Item numbers across Part I and Part II, so `PART I`/`PART II` lines are
tracked and keys become `I.2`, `II.1A`; `PART` lines themselves are excluded from bodies.
Callers may still pass `1A`; it resolves when unambiguous and errors when not. Cross-references
such as "See Part II, Item 1A" do not flip the Part because they are sentence-shaped.

### Duplicate headings

The duplicate-heading warning fires only when a losing candidate has a real body: at least
400 characters and no trailing page reference. A losing TOC stub or heading-only label does
not create doubt about the selected section.

### Known failure modes (deliberately not hidden)

- **A TOC with no page references whose last row is followed by a long preamble, in a filing
  where the real heading for that Item is missing or malformed.** The `tocTail` candidate is
  then the only one and is returned. Mitigation: `list_items` shows the paragraph count; a
  "Form 10-K Summary" with 400 words of forward-looking boilerplate is visibly wrong.
- **Headings inside tables of exhibits** ("Item 15" listing exhibit numbers) can produce a long
  "body" of exhibit rows. Mitigation: none yet; it shows up as an oversized Item 15.
- **Cross-reference-index filings (GE, Intel, McDonald's).** The body uses the company's own
  headings and a Form 10-K cross-reference index at the end; no formal `Item N` heading exists
  in the body, so every Item is `not_found`. Mapping the index to headings is possible future
  work.
- **An unrecognisable fused title** still fails honestly as `not_found`; the parser will not
  guess where its heading ends and its first paragraph begins.
- **Non-10-K/10-Q forms** (20-F, 40-F, 8-K) keep their own heading text as the title; Item
  numbering is whatever the document uses. Diffing still works; labelling is weaker.
- **Restated paragraphs that move between Items** are reported as removed in one Item and
  never seen in the other, because diffs are per Item.
- **Table rows whose numbers all change** share no word bigrams and are reported as
  remove+add rather than `changed`. This is the conservative direction; see "The diff".

## Measuring instead of guessing

`scripts/eval-live.ts` runs the parser over 30 issuers, using the two most recent 10-Ks for
each and one 10-Q for eight issuers. It expects 18 Items in each recent 10-K and eight Items
in each 10-Q. An Item counts as found only when its expected key appears in `list_items`; the
harness does not award partial credit for nearby text.

Parser fixes moved the result from 892/1090 (81.8%) to 980/1090 (89.9%). AMZN, GOOGL, CVX,
PFE, DIS, NFLX, COST, UNH, HD, PLD and CRM gained expected Items. MSFT exposed a different
error: repeated running headers produced four-paragraph fake candidates and Item 1A similarity
of 0.000. Removing that page furniture raised the measured similarity to 0.727.

## The diff

Paragraph-level LCS (`diff.diffArrays` over normalised text) gives unchanged / removed / added
runs. Inside each adjacent removed+added run, paragraphs are paired greedily by Sørensen–Dice
similarity over word bigrams (threshold 0.5) and reported as `changed` with a word-level edit
script. Anything unpaired stays `removed` or `added`.
Section similarity gives unchanged paragraphs a weight of 1, changed pairs their Dice
similarity, and added or removed paragraphs a weight of 0.

Why Dice over bigrams and not embeddings: it is deterministic, dependency-free, fast enough to
run over an MD&A in milliseconds, and its failure mode (two heavily rewritten paragraphs
reported as remove+add instead of change) is *conservative* — it under-claims edits, never
invents them.

## What I would do with another week

- Section-aware chunking that keeps sub-headings ("*Risks Related to Our Industry*") as
  citation context.
- Cross-reference-index mapping from formal Items to company-specific body headings, with
  explicit confidence checks.
- Cross-Item move detection.
- Streaming for very large Items (Item 8 financial statements routinely exceed a client's
  response budget; today we truncate and say so).
