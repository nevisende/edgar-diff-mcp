# Deterministic MCP-client scenarios

Generated 2026-09-02T21:25:34.518Z. Model-free run through a real MCP client using stdio against `node dist/main.js` and real SEC EDGAR data.

**Result: 7/7 passed.**

| Scenario | Steps | Result | Notes |
|---|---|---:|---|
| nvda-risk-factors | resolve_company (1 result) → list_filings (2 results) → diff_all_items (ok) → diff_sections (ok) | PASS | All structural assertions passed. |
| aapl-mdna-tariffs | resolve_company (1 result) → list_filings (2 results) → search_filing (ok) → diff_sections (ok) | PASS | All structural assertions passed. |
| tsla-where-it-moved | resolve_company (1 result) → list_filings (2 results) → diff_all_items (ok) | PASS | All structural assertions passed. |
| brk-10q-part-ii | resolve_company (1 result) → list_filings (2 results) → diff_sections (ok) | PASS | All structural assertions passed. |
| ge-honest-not-found | resolve_company (1 result) → list_filings (1 result) → list_items (0 items) → get_section (not_found) | PASS | All structural assertions passed. |
| jpm-legal-proceedings | resolve_company (1 result) → list_filings (2 results) → diff_sections (ok) | PASS | All structural assertions passed. |
| xom-holding-company | resolve_company (1 result) → list_filings (0 results) → resolve_company (0 results) → resolve_company (1 result) → list_filings (2 results) → diff_sections (ok) | PASS | All structural assertions passed. |

## Key output excerpts

### nvda-risk-factors

```text
We have entered into an intellectual property license arrangement with Groq, Inc., or Groq, that required significant, nonrefundable payments. Successfully incorporating the licensed technology into our architectures and product roadmaps requires significant engineering effort and may not occur on expected timelines or at all. The licensed technology may not achieve the desired results as designed or achieve customer or ecosystem adoption. The economic outcomes of this arrangement depend on our ability to translate the licensed technology into commercially viable products and services over time, and we may be unable to recover the associated costs or realize an adequate return on this spend. If our efforts to use the licensed technology are delayed or unsuccessful, our business, operating results, and financial condition could be negatively impacted.
Citation: {"cik":"0001045810","accession":"0001045810-26-000021","form":"10-K","filingDate":"2026-02-25","url":"https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm","reportDate":"2026-01-25","item":"1A","itemTitle":"Risk Factors","paragraph":44}
```

### aapl-mdna-tariffs

```text
Beginning in the second quarter of 2025, new U.S. Tariffs were announced, including additional tariffs on imports from China, India, Japan, South Korea, Taiwan, Vietnam and the EU, among others. In response, several countries have imposed, or threatened to impose, reciprocal tariffs on imports from the U.S. and other retaliatory measures. Various modifications to the U.S. Tariffs have been announced and further changes could be made in the future, which may include additional sector-based tariffs or other measures. For example, the U.S. Department of Commerce has initiated an investigation under Section 232 of the Trade Expansion Act of 1962, as amended, into, among other things, imports of semiconductors, semiconductor manufacturing equipment, and their derivative products, including downstream products that contain semiconductors. Tariffs and other measures that are applied to the Company’s products or their components can have a material adverse impact on the Company’s business, results of operations and financial condition, including impacting the Company’s supply chain, the availability of rare earths and other raw materials and components, pricing and gross margin. The ultima…
Citation: {"cik":"0000320193","accession":"0000320193-25-000079","form":"10-K","filingDate":"2025-10-31","url":"https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm","reportDate":"2025-09-27","item":"7","itemTitle":"Management's Discussion and Analysis","paragraph":25}
```

### tsla-where-it-moved

```text
[
  {
    "item": "9B",
    "title": "Other Information",
    "stats": {
      "baseParagraphs": 2,
      "targetParagraphs": 8,
      "added": 7,
      "removed": 1,
      "changed": 1,
      "unchanged": 0,
      "similarity": 0.12
    }
  },
  {
    "item": "15",
    "title": "Exhibits and Financial Statement Schedules",
    "stats": {
      "baseParagraphs": 303,
      "targetParagraphs": 121,
      "added": 20,
      "removed": 202,
      "changed": 9,
      "unchanged": 92,
      "similarity": 0.328
    }
  },
  {
    "item": "7",
    "title": "Management's Discussion and Analysis",
    "stats": {
      "baseParagraphs": 180,
      "targetParagraphs": 177,
      "added": 35,
      "removed": 38,
      "changed": 97,
      "unchanged": 45,
      "similarity": 0.615
    }
  }
]
```

### brk-10q-part-ii

```text
April
Citation: {"cik":"0001067983","accession":"0001193125-26-341032","form":"10-Q","filingDate":"2026-08-10","url":"https://www.sec.gov/Archives/edgar/data/1067983/000119312526341032/brka-20260630.htm","reportDate":"2026-06-30","item":"II.1A","itemTitle":"Risk Factors","paragraph":16}
```

### ge-honest-not-found

```text
{
  "status": "not_found",
  "filing": {
    "cik": "0000040545",
    "accession": "0000040545-26-000008",
    "form": "10-K",
    "filingDate": "2026-01-29",
    "url": "https://www.sec.gov/Archives/edgar/data/40545/000004054526000008/ge-20251231.htm",
    "reportDate": "2025-12-31"
  },
  "item": "1A",
  "reason": "Item \"1A\" was not found in this filing.",
  "availableItems": []
}
```

### jpm-legal-proceedings

```text
Accessions: 0000019617-25-000270 → 0001628280-26-008131
Base URL: https://www.sec.gov/Archives/edgar/data/19617/000001961725000270/jpm-20241231.htm
Target URL: https://www.sec.gov/Archives/edgar/data/19617/000162828026008131/jpm-20251231.htm
{
  "baseParagraphs": 1,
  "targetParagraphs": 1,
  "added": 0,
  "removed": 0,
  "changed": 0,
  "unchanged": 1,
  "similarity": 1
}
```

### xom-holding-company

```text
XOM resolution: {"cik":"0002115436","ticker":"XOM","name":"ExxonMobil Holdings Corp"}
XOM 10-K count: 0
Operating company: {"cik":"0000034088","ticker":"","name":"EXXON MOBIL CORP"}
The oil, gas, and petrochemical businesses are fundamentally commodity businesses. This means ExxonMobil’s operations and earnings may be significantly affected by changes in oil, gas, and petrochemical prices and by changes in margins on refined products. Oil, gas, petrochemical, and product prices and margins in turn depend on local, regional, and global events or conditions that affect supply and demand for the relevant commodity or product. Any material decline in oil or natural gas prices could have a material adverse effect on the Company’s operations, results, financial condition, and proved reserves, especially in the Upstream segment. On the other hand, a material increase in oil or natural gas prices could have a material adverse effect on the Company’s operations and results, especially in the Energy Products, Chemical Products, and Specialty Products segments. Our pursuit of lower-emission and other new business opportunities, including carbon capture and storage, hydrogen …
Citation: {"cik":"0000034088","accession":"0000034088-26-000045","form":"10-K","filingDate":"2026-02-18","url":"https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm","reportDate":"2025-12-31","item":"1A","itemTitle":"Risk Factors","paragraph":2}
```
