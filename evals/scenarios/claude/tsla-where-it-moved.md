# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T21:53:06Z
- Wall-clock seconds: 19
- Exit code: 0

## Prompt

Between Tesla's last two 10-Ks, which Items changed the most? Rank the top three by similarity and say how many paragraphs were added, removed and changed in each.

## Answer

Comparing Tesla's last two 10-Ks:
- Base (FY2024, filed 2025-01-30): accession **0001628280-25-003063**, https://www.sec.gov/Archives/edgar/data/1318605/000162828025003063/tsla-20241231.htm
- Target (FY2025, filed 2026-01-29): accession **0001628280-26-003952**, https://www.sec.gov/Archives/edgar/data/1318605/000162828026003952/tsla-20251231.htm

Per `diff_all_items` (cik 0001318605), ranked by lowest similarity (= most changed):

**1. Item 9B — Other Information** (similarity 0.12)
Added: 7, Removed: 1, Changed: 1 (base had 2 paragraphs, target 8 — this is a very small item, so the ratio is dramatic but the absolute paragraph count is low)

**2. Item 15 — Exhibits and Financial Statement Schedules** (similarity 0.328)
Added: 20, Removed: 202, Changed: 9 (base 303 paragraphs → target 121; 92 unchanged)

**3. Item 7 — Management's Discussion and Analysis** (similarity 0.615)
Added: 35, Removed: 38, Changed: 97 (base 180 paragraphs → target 177; 45 unchanged)

Close behind (not in top three but worth noting): Item 8 — Financial Statements and Supplementary Data (similarity 0.634; added 276, removed 203, changed 429) and Item 1 — Business (similarity 0.655; added 21, removed 47, changed 40).

Note: these are paragraph-level change statistics returned directly by the `diff_all_items` tool, not verbatim filing text — no quotable paragraph content was requested or returned. Item 9B's ranking is skewed by its very small size (only 2 base / 8 target paragraphs), so Item 15 or Item 7 may be more meaningful as "most changed" depending on whether you weight by absolute volume of change.

