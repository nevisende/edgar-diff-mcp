# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T21:36:26Z
- Wall-clock seconds: 27
- Exit code: 0

## Prompt

In Apple's most recent 10-K, does the MD&A (Item 7) mention tariffs? Quote every matching paragraph with citations, then tell me whether those paragraphs are new compared with the previous 10-K.

## Answer

I read the full diff results for Item 7 filtered to tariff-related paragraphs (all 4 "added" entries — I confirmed there were exactly 4 matches, matching the search_filing results, so nothing was missed). Here's the answer.

## Apple's most recent 10-K (FY2025, filed 2025-10-31, accession 0000320193-25-000079) — Item 7 MD&A tariff mentions

**1.** *(paragraph 24, heading)*
> "Tariffs and Other Measures"

**2.** *(paragraph 25)*
> "Beginning in the second quarter of 2025, new U.S. Tariffs were announced, including additional tariffs on imports from China, India, Japan, South Korea, Taiwan, Vietnam and the EU, among others. In response, several countries have imposed, or threatened to impose, reciprocal tariffs on imports from the U.S. and other retaliatory measures. Various modifications to the U.S. Tariffs have been announced and further changes could be made in the future, which may include additional sector-based tariffs or other measures. For example, the U.S. Department of Commerce has initiated an investigation under Section 232 of the Trade Expansion Act of 1962, as amended, into, among other things, imports of semiconductors, semiconductor manufacturing equipment, and their derivative products, including downstream products that contain semiconductors. Tariffs and other measures that are applied to the Company's products or their components can have a material adverse impact on the Company's business, results of operations and financial condition, including impacting the Company's supply chain, the availability of rare earths and other raw materials and components, pricing and gross margin. The ultimate impact remains uncertain and will depend on several factors, including whether additional or incremental U.S. Tariffs or other measures are announced or imposed, to what extent other countries implement tariffs or other retaliatory measures in response, and the overall magnitude and duration of these measures. Trade and other international disputes can have an adverse impact on the overall macroeconomic environment and result in shifts and reductions in consumer spending and negative consumer sentiment for the Company's products and services, all of which can further adversely affect the Company's business and results of operations."

**3.** *(paragraph 78)*
> "Products gross margin increased during 2025 compared to 2024 primarily due to favorable costs and a different mix of products, partially offset by tariff costs."

**4.** *(paragraph 79)*
> "Products gross margin percentage decreased during 2025 compared to 2024 primarily due to a different mix of products and tariff costs, partially offset by other favorable costs."

**Citation for all four:** accession 0000320193-25-000079, Item 7 (Management's Discussion and Analysis), 10-K filed 2025-10-31, reportDate 2025-09-27, https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm

## Are these new compared with the prior 10-K?

Yes — I diffed Item 7 between the FY2024 10-K (base, accession 0000320193-24-000123) and the FY2025 10-K (target, accession 0000320193-25-000079). All four tariff-mentioning paragraphs above are flagged **`added`** in the diff, with no corresponding paragraph on the base (FY2024) side. None of them appear in the prior 10-K's MD&A at all — the entire "Tariffs and Other Measures" subsection is new to the FY2025 filing.

