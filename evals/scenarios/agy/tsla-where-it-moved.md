# Scenario answer

- Harness: agy
- Model: gemini-3.8-flash-high
- Date: 2026-09-02T21:50:20Z
- Wall-clock seconds: 31
- Exit code: 0

## Prompt

Between Tesla's last two 10-Ks, which Items changed the most? Rank the top three by similarity and say how many paragraphs were added, removed and changed in each.

## Answer

Based on the comparison between Tesla’s last two Form 10-K filings using the `edgar-diff` tools:

### Filings Compared
* **Base Filing (Older):**
  * **Accession:** `0001628280-25-003063`
  * **Filing Date:** 2025-01-30 (Period of Report: 2024-12-31)
  * **URL:** [tsla-20241231.htm](https://www.sec.gov/Archives/edgar/data/1318605/000162828025003063/tsla-20241231.htm)
* **Target Filing (Newer):**
  * **Accession:** `0001628280-26-003952`
  * **Filing Date:** 2026-01-29 (Period of Report: 2025-12-31)
  * **URL:** [tsla-20251231.htm](https://www.sec.gov/Archives/edgar/data/1318605/000162828026003952/tsla-20251231.htm)

---

### Top Three Most Changed Items (Ranked by Similarity)

#### 1. Item 9B: Other Information
* **Similarity Score:** `0.12` (lowest similarity / changed the most)
* **Paragraphs Added:** `7`
* **Paragraphs Removed:** `1`
* **Paragraphs Changed:** `1`
*(Base total: 2 paragraphs, Target total: 8 paragraphs, Unchanged: 0)*

#### 2. Item 15: Exhibits and Financial Statement Schedules
* **Similarity Score:** `0.328`
* **Paragraphs Added:** `20`
* **Paragraphs Removed:** `202`
* **Paragraphs Changed:** `9`
*(Base total: 303 paragraphs, Target total: 121 paragraphs, Unchanged: 92)*

#### 3. Item 7: Management's Discussion and Analysis of Financial Condition and Results of Operations
* **Similarity Score:** `0.615`
* **Paragraphs Added:** `35`
* **Paragraphs Removed:** `38`
* **Paragraphs Changed:** `97`
*(Base total: 180 paragraphs, Target total: 177 paragraphs, Unchanged: 45)*

