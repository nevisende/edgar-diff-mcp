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
