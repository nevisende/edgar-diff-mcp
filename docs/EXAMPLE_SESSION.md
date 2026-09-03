# Example session

A real, unedited run of Claude Code against this server (model: Claude Sonnet, 2026-09-02). The point is not the model; it is that every quoted sentence below can be checked against the filing by following its citation. This run predates the weighted `similarity` definition, so the similarity numbers it reports differ from what the current code returns (Item 1A is now 0.762); the quoted text and citations are unaffected.

## Prompt

> Using only the edgar-diff tools: resolve AAPL, list its two most recent 10-K filings, run diff_all_items between them to see which Items changed most, then diff Item 1A (Risk Factors) between them. Report: (1) the three Items with the lowest similarity, (2) the three most material ADDED risk-factor paragraphs quoted verbatim, each followed by its citation (accession, item, paragraph index, url). Quote only text returned by the tools. If a tool returns not_found, say so.

## Tool calls

| # | Tool | Input |
|---|---|---|
| 1 | `resolve_company` | `{"query": "AAPL"}` |
| 2 | `list_filings` | `{"cik": "0000320193", "form": "10-K", "limit": 3}` |
| 3 | `diff_all_items` | `{"cik": "0000320193", "baseAccession": "0000320193-24-000123", "targetAccession": "0000320193-25-000079"}` |
| 4 | `diff_sections` | `{"cik": "0000320193", "baseAccession": "0000320193-24-000123", "targetAccession": "0000320193-25-000079", "item": "1A"}` |

Wall clock 60 s, 13 turns, API cost $0.23. The `diff_sections` result for Item 1A contains 78 changes (9 added, 18 removed, 51 changed) with word-level edits, so Claude Code spilled it to a file and filtered it locally with `jq` before answering; those local steps are omitted here.

## Answer (verbatim)

## AAPL 10-K Diff (FY2024 &rarr; FY2025)

**Filings compared:**
- Base: 0000320193-24-000123 (filed 2024-11-01, FY2024)
- Target: 0000320193-25-000079 (filed 2025-10-31, FY2025)

### 1) Three Items with the lowest similarity

Six items tied at similarity **0.0** (all single-paragraph items where the whole paragraph was marked "changed"): Item 2 (Properties), Item 10 (Directors, Executive Officers and Corporate Governance), Item 11 (Executive Compensation), Item 12 (Security Ownership), Item 13 (Certain Relationships and Related Transactions), Item 14 (Principal Accountant Fees and Services). Per the tool's own warnings, Items 10&ndash;14 are boilerplate ("The information required by this Item will be included in th[e Proxy Statement]...") &mdash; not substantively new content, just proxy-incorporation-by-reference language that shifted year to year.

Excluding those boilerplate ties, the three lowest-similarity items with substantial content are:
1. **Item 9B &mdash; Other Information**: similarity 0.333 (2 added, 2 removed, 1 unchanged, of 3 paragraphs)
2. **Item 7 &mdash; Management's Discussion and Analysis**: similarity 0.341 (29 added, 25 removed, 60 changed, 46 unchanged, of 131&rarr;135 paragraphs)
3. **Item 8 &mdash; Financial Statements and Supplementary Data**: similarity 0.358 (169 added, 169 removed, 251 changed, 234 unchanged, of 654&rarr;654 paragraphs)

**Item 1A (Risk Factors)** similarity: **0.4** (9 added, 18 removed, 51 changed, 46 unchanged, of 115&rarr;106 paragraphs).

### 2) Three most material ADDED risk-factor paragraphs (Item 1A)

**AI/technology regulatory risk:**
> "Risks and costs related to new and changing laws, regulations, executive orders, directives, and enforcement priorities increase as the Company's products and services are introduced into specialized applications, including health and financial services, or as the Company expands the use of technologies, such as machine learning and artificial intelligence features, and must navigate new legal, regulatory and ethical considerations relating to such technologies."
&mdash; Accession 0000320193-25-000079, Item 1A, paragraph 73, https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm

**Online safety / minor-protection regulation:**
> "The Company is also subject to new and changing laws and regulations regarding online safety, including enhanced protections for minors and mandatory age verification requirements. These laws and regulations can increase regulatory risks by requiring complex compliance measures and significant modifications to the Company's products, services and operations, and may lead to operational disruptions, heightened privacy and data security risks, increased costs and potential liability and fines, all of which can have a material adverse impact on the Company's business, financial condition, results of operations and stock price."
&mdash; Accession 0000320193-25-000079, Item 1A, paragraph 87, https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm

**Custom-component / single-source supply risk:**
> "Additionally, the Company's new products often utilize custom components available from only one source. When a component or product uses new technologies, initial capacity constraints may exist until the suppliers' yields have matured or their manufacturing capacities have increased. The Company may not be able to extend or renew agreements for the supply of components on similar terms, or at all, and may not be successful in obtaining sufficient quantities from its suppliers in a timely manner, or in identifying and obtaining sufficient quantities from an alternative source. In addition, component suppliers may fail, be subject to consolidation within a particular industry, or decide to concentrate on the production of common components instead of components customized to meet the Company's requirements, further limiting the Company's ability to obtain sufficient quantities of components on commercially reasonable terms, or at all. Therefore, the Company remains subject to significant risks of supply shortages and price increases that can materially adversely affect its business, results of operations, financial condition and stock price."
&mdash; Accession 0000320193-25-000079, Item 1A, paragraph 30, https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm

(6 other added paragraphs exist &mdash; an intro/framing paragraph, an IP-enforcement sentence, a competition sentence, a reseller-financing sentence, an ESG/stakeholder-expectations paragraph, and a net-sales/margin-volatility sentence &mdash; all with the same citation pattern, differing only in paragraph index: 0, 18, 21, 50, 76, 89.)

## What to notice

- Every quote carries accession, Item, paragraph index and URL, because the tool attached them; the model did not have to remember to.
- The model flagged that Items 10-14 read as similarity 0.0 only because each is a single boilerplate paragraph whose year changed. That observation led to the weighted `similarity` definition described in `docs/DESIGN.md`.
- No sentence in the answer was generated from memory of Apple; the prompt forbade it and the server gave it nothing else to work with.
