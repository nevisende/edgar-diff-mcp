# Fixtures

`acme-10k-2024.htm` and `acme-10k-2025.htm` are **synthetic** 10-K documents for a fictional
company ("Acme Robotics, Inc."). They imitate the structure real EDGAR HTML has — a table of
contents that repeats every Item heading, `&#160;` entities inside headings, page-number lines,
nested `div`/`span` markup, an inline `<script>` — without carrying any real issuer's text.
They also contain the traps the parser is built for: a "Forward-Looking Statements" preamble
between the table of contents and `PART I` (so the last TOC entry is followed by real text),
a sentence that starts with "Item 7 of this report…" inside Item 1's body, a real
`<table>` inside MD&A, and a genuinely short Item 1B ("None.").

Between the two years, Item 1A (Risk Factors) has exactly:

- one paragraph **removed** (the COVID-19 risk),
- one paragraph **changed** (cloud compute cost: "two" → "three" providers, plus new wording),
- one paragraph **added** (tariffs on robotic components),

and Item 7 (MD&A) has one changed paragraph (revenue numbers) and one changed table row.
Everything else is identical. Tests assert exactly these facts.

For a diff over *real* filings, run `npm run smoke:live` (needs network + `EDGAR_USER_AGENT`).

`fused-headings-10k.htm` is a synthetic filing whose Item headings and first body paragraphs
share long block elements. It includes a separate table of contents and exercises both a
canonical Item-title split and the conservative sentence-boundary fallback.

`combined-headings-10k.htm` is a synthetic filing with combined Item lists and ranges in both
its table of contents and body. It also contains an Item-like incorporation sentence that must
remain body text rather than becoming a heading.

`running-item-headers-10k.htm` is a synthetic filing that repeats a bare `Item 1A` at page
boundaries inside a real titled Risk Factors section. The repeated running headers are page
furniture and must neither split the section nor appear in its returned paragraphs. It also
has consecutive short real sections with long canonical headings, which must not form a TOC.

`titled-running-item-headers-10q.htm` is a synthetic quarterly filing that repeats one identical
full Item 2 heading across four substantive page fragments. Those fragments must merge, while
recurring Item 4 headings separated by a different title must remain separate candidates.

`placeholder-cluster-10q.htm` is a synthetic quarterly filing with three consecutive real
Items whose complete bodies are `None.` or `Not applicable.`. They must remain available even
though their short lengths and proximity resemble a table-of-contents cluster.

`spaced-toc-10k.htm` is a synthetic annual filing whose table-of-contents rows are separated
by enough lines to escape cluster detection. Its short duplicate candidates must not create
doubt warnings when the parser selects the substantive Item bodies.

`repeated-page-footer-10k.htm` repeats a short annual-report footer across three synthetic
pages. The footer must be removed while an ordinary numeric table row remains verbatim.

`part-item-same-line-10q.htm` is a synthetic quarterly filing whose Part II marker and Item 1A
heading share one line. The parser must update the Part and still recognize the Item heading.

`toc-tail-duplicate-10k.htm` is a synthetic annual filing whose last table-of-contents row
absorbs a long preamble. That `tocTail` candidate must not cause a duplicate-heading warning
when a real body heading exists later in the filing.
