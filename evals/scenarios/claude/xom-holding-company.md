# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T21:38:12Z
- Wall-clock seconds: 46
- Exit code: 0

## Prompt

Diff Exxon's risk factors between its last two 10-Ks.

## Answer

## Exxon Mobil Corporation — Risk Factors (Item 1A), last two 10-Ks

Compared: FY2024 10-K (accession 0000034088-25-000010, filed 2025-02-19) → FY2025 10-K (accession 0000034088-26-000045, filed 2026-02-18), CIK 0000034088.

**Stats from the tool:** 47 base paragraphs vs. 51 target paragraphs; 32 changed, 6 "added," 2 "removed," 13 unchanged (similarity 0.798).

**Important caveat on the "added"/"removed" counts:** All 6 paragraphs the tool flagged as "added" are the identical placeholder string `"Financial Table of Contents"` — a parser artifact from page-break/navigation markup in the newer filing's HTML, not new risk-factor prose. I'm flagging this rather than reporting it as new content, per the read-only/no-guessed-sections rule. Similarly, the 2 "removed" paragraphs (base paragraph 29 and paragraph 37) are sentence fragments that were simply merged back into the surrounding paragraph in the new filing (confirmed by comparing to the corresponding "changed" entries) — not genuinely deleted risk content.

**Bottom line: no risk-factor topic was newly added or fully dropped.** All 32 "changed" items are revisions/expansions of existing risk categories. The most substantive wording changes:

- **Commodity/supply risk** — new language on "previously inaccessible" oil/gas sources, new sanctions/shipping-route language:
  > "There also may be new or emerging factors that could increase global oil, gas, and petrochemical supply levels in the short or long term, such as government policies and actions intended to boost or expand development of domestic or foreign oil and gas reserves or accelerate the pace of production reaching markets, including access to previously unavailable, sanctioned, or protected oil and gas resources or the availability or opening of new shipping routes."
  — citation: accession 0000034088-26-000045, item 1A, paragraph 6, https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm

- **AI / data centers** now explicitly cited as a demand driver:
  > "...government actions to increase strategic reserves to enhance energy security; increased demand for artificial intelligence (AI), including the construction and expansion of AI data centers..."
  — citation: accession 0000034088-26-000045, item 1A, paragraph 4, same url

- **Legal/regulatory risk broadened** to cover "concerted efforts to increase our legal exposure by groups opposed to the products we provide" and "extraterritorial laws and regulations":
  > "...we remain exposed to changes in law or interpretation or enforcement of settled law, including changes that result from concerted efforts to increase our legal exposure by groups opposed to the products we provide or international treaties and accords or changes by local jurisdictions encroaching on national regulatory frameworks or global issues or changes resulting from imposition of extraterritorial laws and regulations..."
  — citation: accession 0000034088-26-000045, item 1A, paragraph 13, same url

- **Security concerns** now explicitly names "military conflict":
  > "Successful operation of particular facilities or projects may be disrupted by civil unrest, military conflict, acts of sabotage, piracy, terrorism, cybersecurity attacks..."
  — citation: accession 0000034088-26-000045, item 1A, paragraph 27, same url

- **Net-zero/energy-transition language softened**, dropping "leading role" commitment language for "seeks opportunities to play a leading role," and adding:
  > "Without supportive policies and the innovations they drive, net zero will remain out of reach – for society and for ExxonMobil. Society's progress continues to lag in these areas."
  — citation: accession 0000034088-26-000045, item 1A, paragraph 30, same url

All comparison paragraphs above are quoted verbatim from `diff_sections` output; base-side citations are available on request for any specific paragraph pair. If you want the full 32-paragraph changed list or the MD&A/other Items diffed too, let me know.

