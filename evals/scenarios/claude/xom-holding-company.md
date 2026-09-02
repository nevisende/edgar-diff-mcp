# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T22:04:21Z
- Wall-clock seconds: 44
- Exit code: 0

## Prompt

Diff Exxon's risk factors between its last two 10-Ks.

## Answer

## ExxonMobil 10-K Risk Factors (Item 1A): FY2024 10-K → FY2025 10-K

**Filings compared:**
- Base: 10-K filed 2025-02-19, report period 2024-12-31, accession `0000034088-25-000010`
- Target: 10-K filed 2026-02-18, report period 2025-12-31, accession `0000034088-26-000045`

**Diff stats (tool-reported):** 47 base paragraphs vs. 45 target paragraphs; 0 added, 2 removed, 32 changed, 13 unchanged; overall similarity 0.866.

No new risk-factor topics were added and none were fully removed (`added: 0`); the two "removed" paragraphs are minor structural artifacts — one is a trailing fragment ("may also increase our compliance costs...") absorbed into the prior paragraph in the new filing, and one ("Operational efficiency. An important component...") whose text was merged into the next paragraph. The bulk of the change is wording refinement across nearly every existing risk (32 of 47 paragraphs changed), rather than new categories of risk.

### Notable substantive shifts (quoted verbatim, target = FY2025 10-K unless noted)

**AI as an explicit factor (new emphasis):**
> "increased demand for artificial intelligence (AI), including the construction and expansion of AI data centers" — added to the "Other demand-related factors" paragraph.
(0000034088-26-000045, Item 1A, paragraph 4)

> "we must also continuously adapt and capture the benefits of new and emerging technologies, such as AI, including successfully applying advances in the ability to process and integrate large amounts of data to our businesses and decision-making processes."
(0000034088-26-000045, Item 1A, paragraph 37) — base version had no AI mention here.

> "Technology and expertise provided by industry service companies or AI may also enhance the competitiveness of firms..."
(0000034088-26-000045, Item 1A, paragraph 42)

**Expanded low-carbon/new-business product list:** base listed "carbon capture and storage, hydrogen, lower-emission fuels, ProxximaTM systems, carbon materials, and lithium"; target expands to:
> "carbon capture and storage, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, carbon materials, low-carbon data centers, and lithium"
(0000034088-26-000045, Item 1A, paragraph 2; same expansion repeated in paragraphs 15 and 29)

**"Climate Change and the Energy Transition" section retitled and softened:** heading changed from
> "Climate Change and the Energy Transition" (0000034088-25-000010, paragraph 26)
to
> "Climate Change and Energy Transition" (0000034088-26-000045, paragraph 26)

and the net-zero discussion shifted from an ambition framed around Company operatorship to a more conditional framing:
> "The Company seeks opportunities to play a leading role in the energy transition, including the Company's announced ambition ultimately to achieve net zero with respect to Scope 1 and 2 emissions from our operated assets... Without supportive policies and the innovations they drive, net zero will remain out of reach – for society and for ExxonMobil. Society's progress continues to lag in these areas."
(0000034088-26-000045, Item 1A, paragraph 27)
— replacing the prior year's language that "The Company's objective to play a leading role in the energy transition... where ExxonMobil is the operator" (0000034088-25-000010, paragraph 27).

**Geopolitical/security language broadened:** "civil unrest, acts of sabotage, piracy, or terrorism" became
> "civil unrest, military conflict, acts of sabotage, piracy, terrorism, cybersecurity attacks... in a particular jurisdiction or region... and other local, national, regional, or global security concerns."
(0000034088-26-000045, Item 1A, paragraph 25)

**Litigation risk language broadened** from U.S.-focused punitive-damage risk to a more global framing:
> "especially in countries such as the United States that permit large and unpredictable punitive and non-economic damage awards. Other jurisdictions adopting similar models to impose liability schemes on our products or operations may present similar risks."
(0000034088-26-000045, Item 1A, paragraph 24)

**Access/legal-certainty risks sharpened** to call out opposition groups explicitly:
> "restricting leasing, licensing, or permitting activities directly or indirectly through the influence on these processes by well-funded local or international groups opposing the development of these resources"
(0000034088-26-000045, Item 1A, paragraph 9)

**Regulatory bullet list additions**, e.g.:
> "government actions to cancel contracts, redenominate the official currency, renounce or default on obligations, impose unwarranted penalties, renegotiate terms unilaterally, expropriate assets, or compel a change in production plans."
(0000034088-26-000045, Item 1A, paragraph 22) — vs. base's shorter version without "impose unwarranted penalties" or "compel a change in production plans" (0000034088-25-000010, paragraph 22).

**Pioneer acquisition reference removed**: base's operational-efficiency paragraph referenced "successfully integrate and achieve the anticipated synergies of acquisitions, including the acquisition of Pioneer" (0000034088-25-000010, paragraph 38); target drops the Pioneer reference entirely, reading just "successfully integrate and achieve the anticipated synergies of acquisitions." (0000034088-26-000045, paragraph 36)

### Bottom line
This is an incremental refresh, not a restructuring: same risk categories, same order, mostly wording tightening — with the clearest thematic additions being (1) AI/data-center demand and competitive dynamics, (2) an expanded low-carbon business/product list (ammonia, low-carbon data centers), and (3) a softer, more conditional tone on net-zero ambitions paired with new "society is lagging" language. All quotes above are verbatim from the `diff_sections` tool output for Item 1A between these two accessions.

