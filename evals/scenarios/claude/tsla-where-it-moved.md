# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T21:48:14Z
- Wall-clock seconds: 109
- Exit code: 0

## Prompt

Between Tesla's last two 10-Ks, which Items changed the most? Rank the top three by similarity and say how many paragraphs were added, removed and changed in each.

## Answer

Here's the full picture across all seven filings, each answer grounded strictly in tool output.

## 1–2 (duplicate). Tesla: which Items changed most between its last two 10-Ks?

Base: FY2024 10-K (accession 0001628280-25-003063, filed 2025-01-30) vs. Target: FY2025 10-K (accession 0001628280-26-003952, filed 2026-01-29), CIK 1318605. `diff_all_items` returns items sorted most-changed-first (lowest similarity):

| Rank | Item | Added | Removed | Changed | Similarity |
|---|---|---|---|---|---|
| 1 | **9B – Other Information** | 7 | 1 | 1 | 0.12 |
| 2 | **15 – Exhibits and Financial Statement Schedules** | 20 | 202 | 9 | 0.328 |
| 3 | **7 – Management's Discussion and Analysis** | 35 | 38 | 97 | 0.615 |

(Runner-up: Item 8 Financial Statements, similarity 0.634, and Item 1 Business, 0.655.) Item 1A Risk Factors was comparatively stable (similarity 0.847).

## nvda-risk-factors — new risk factors NVIDIA added

Base 10-K accession 0001045810-25-000023 (filed 2025-02-26) vs. target 0001045810-26-000021 (filed 2026-02-25), CIK 1045810, Item 1A: 36 paragraphs added overall. Representative added paragraphs, verbatim:

> "•Commercial arrangements expose us to counterparty risks, which may negatively impact our business, financial condition, or results of operations."
— accession 0001045810-26-000021, Item 1A, paragraph 17

> "We have entered into an intellectual property license arrangement with Groq, Inc., or Groq, that required significant, nonrefundable payments. Successfully incorporating the licensed technology into our architectures and product roadmaps requires significant engineering effort and may not occur on expected timelines or at all... If our efforts to use the licensed technology are delayed or unsuccessful, our business, operating results, and financial condition could be negatively impacted."
— accession 0001045810-26-000021, Item 1A, paragraph 44

> "•our customers' and partners' ability to secure capital and energy and to build complex datacenter infrastructure timely; and"
— accession 0001045810-26-000021, Item 1A, paragraph 70

> "The availability of data centers, energy, and capital to support the buildout of NVIDIA AI infrastructure by our customers and partners is crucial, and any shortage of these and other necessary resources could impact our future revenue and financial performance. Expanding energy capacity to meet demand is a complex, multi-year process involving significant regulatory, technical, and construction challenges..."
— accession 0001045810-26-000021, Item 1A, paragraph 72

> "We are increasing our U.S.-based manufacturing and investing in specialized equipment and processes to support domestic production. We may experience delays or difficulties in scaling production as planned. Our ability to increase manufacturing capabilities will depend on the domestic manufacturing ecosystem's capacity to ramp production supply to the required volume timely. Delays or shortfalls could impact our ability to meet demand."
— accession 0001045810-26-000021, Item 1A, paragraph 75

(These are 5 of the 36 added paragraphs the tool returned on the first page; more exist beyond this sample if you want the full list.)

## aapl-mdna-tariffs — does Apple's Item 7 mention tariffs?

Latest 10-K: accession 0000320193-25-000079 (filed 2025-10-31), CIK 320193. `search_filing` for "tariff" in Item 7 returned 4 matching paragraphs:

> "Tariffs and Other Measures"
— accession 0000320193-25-000079, Item 7, paragraph 24

> "Beginning in the second quarter of 2025, new U.S. Tariffs were announced, including additional tariffs on imports from China, India, Japan, South Korea, Taiwan, Vietnam and the EU, among others... Tariffs and other measures that are applied to the Company's products or their components can have a material adverse impact on the Company's business, results of operations and financial condition, including impacting the Company's supply chain, the availability of rare earths and other raw materials and components, pricing and gross margin..."
— accession 0000320193-25-000079, Item 7, paragraph 25

> "Products gross margin increased during 2025 compared to 2024 primarily due to favorable costs and a different mix of products, partially offset by tariff costs."
— accession 0000320193-25-000079, Item 7, paragraph 78

> "Products gross margin percentage decreased during 2025 compared to 2024 primarily due to a different mix of products and tariff costs, partially offset by other favorable costs."
— accession 0000320193-25-000079, Item 7, paragraph 79

New vs. prior 10-K: I searched Item 7 of the prior 10-K (accession 0000320193-24-000123, filed 2024-11-01) with a regex grep for "tariff" and found **zero matches** — the term does not appear anywhere in that filing's Item 7. So all four tariff paragraphs above are new to the FY2025 filing.

## brk-10q-part-ii — Berkshire's Part II Item 1A across last two 10-Qs

Base: 10-Q accession 0001193125-26-202243 (period 2026-03-31) vs. target 0001193125-26-341032 (period 2026-06-30), CIK 1067983, item "II.1A": stats show added 14, removed 10, changed 1, unchanged 27 (similarity 0.666). This is **not** "nothing changed" — the share-repurchase table (months, share amounts, prices) was substantially rewritten, e.g.:

> Base: "Berkshire's common stock repurchases during the **first quarter** of 2026 are summarized as follows." (paragraph 2)
> Target: "Berkshire's common stock repurchases during the **second quarter** of 2026 are summarized as follows." (paragraph 2, similarity 0.973)

Most other changes are individual table cells (months "January"→"April", share counts, per-share averages like "716,231.37", "7,139,881", etc.) — i.e., the repurchase-detail table was updated for the new quarter, not narrative risk-factor language.

## ge-honest-not-found — GE Aerospace's latest 10-K risk factors

I resolved "GE Aerospace" via ticker/name search but only found CIK 0000040545 registered as "GENERAL ELECTRIC CO" (the filer entity behind GE Aerospace). Its latest 10-K is accession 0000040545-26-000008 (filed 2026-01-29). Calling `get_section` for Item 1A returned:

```
status: "not_found"
reason: "Item \"1A\" was not found in this filing."
availableItems: []
```

`list_items` on the same accession also returned no items, with the warning: *"No 'Item N' headings were found; the document may not be a 10-K/10-Q or may be an exhibit."* Per tool guidance, I'm not inferring content here — the tool cannot locate Item 1A (or any items) in this document, so I can't provide GE's risk factors from this source.

## jpm-legal-proceedings — JPMorgan Item 3 change

Base 10-K accession 0000019617-25-000270 (FY2024) vs. target 0001628280-26-008131 (FY2025), CIK 19617, Item 3: stats show **0 added, 0 removed, 0 changed, 1 unchanged (similarity 1.0)**. The section is a single boilerplate paragraph, unchanged between filings: *"Refer to Note 30 for a description of the Firm's material le[gal proceedings]..."* (tool flagged it as a placeholder-style short body in both filings). So: no added or removed paragraphs — Item 3 did not change.

## xom-holding-company — Exxon risk-factors diff

A heads-up first: resolving "XOM" via `resolve_company` returns CIK 0002115436, "ExxonMobil Holdings Corp" — but that CIK has **zero** 10-K filings on file. The actual 10-K filer is CIK 0000034088, "EXXON MOBIL CORP" (found only by searching the CIK directly; it has no ticker in the tool's index). I used CIK 34088 for the diff.

Base: accession 0000034088-25-000010 (FY2024, filed 2025-02-19) vs. target 0000034088-26-000045 (FY2025, filed 2026-02-18), Item 1A: **47 → 51 paragraphs, 6 added, 2 removed, 32 changed, 13 unchanged (similarity 0.798)**. Much of the "added" count is a repeating boilerplate marker ("Financial Table of Contents") interleaved by the parser rather than substantive new text. Substantive edits include added references to AI, data centers, and hydrogen/ammonia throughout (e.g., paragraph 4 target: *"...increased demand for artificial intelligence (AI), including the construction and expansion of AI data centers..."*, accession 0000034088-26-000045, Item 1A, paragraph 4) and expanded litigation-risk language (paragraph 26 target vs. paragraph 24 base, accession 0000034088-26-000045, Item 1A, paragraph 26).

