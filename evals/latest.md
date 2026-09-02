
> edgar-diff-mcp@0.1.0 eval:live
> tsx scripts/eval-live.ts

# EDGAR Parser Evaluation Report

**Run date:** 2026-09-02T20:21:13.502Z
**Corpus:** 30 tickers

## Headline

| Metric | Value |
|--------|-------|
| Filings evaluated | 66 |
| Expected Item slots | 1166 |
| **Recall (expected Items located)** | **1048/1166 (89.9%)** |
| **Plausible expected Items** | **1028/1166 (88.2%)** |
| False positives | 2 |
| Issues | 1 |

## Evaluation Issues

| Status | Ticker | Issue |
|--------|--------|-------|
| [ERROR] | XOM | Expected 2 recent 10-K filings; located 0. |

## Per-Filing Results

| Ticker | Form | Filing Date | Accession | Missing Items | False Positives | Flags |
|--------|------|-------------|-----------|---------------|-----------------|-------|
| AAPL | 10-K | 2025-10-31 | 0000320193-25-000079 | — | — | dup-heading×1 |
| AAPL | 10-K | 2024-11-01 | 0000320193-24-000123 | — | — | dup-heading×1 |
| AAPL | 10-Q | 2026-07-31 | 0000320193-26-000020 | — | — | — |
| MSFT | 10-K | 2026-07-29 | 0001193125-26-323660 | — | — | dup-heading×3 |
| MSFT | 10-K | 2025-07-30 | 0000950170-25-100235 | — | — | dup-heading×3 |
| MSFT | 10-Q | 2026-04-29 | 0001193125-26-191507 | — | — | — |
| NVDA | 10-K | 2026-02-25 | 0001045810-26-000021 | — | — | long-item-15; dup-heading×1 |
| NVDA | 10-K | 2025-02-26 | 0001045810-25-000023 | — | — | long-item-15; dup-heading×1 |
| NVDA | 10-Q | 2026-08-26 | 0001045810-26-000075 | — | — | dup-heading×2 |
| AMZN | 10-K | 2026-02-06 | 0001018724-26-000004 | — | — | doc-warning×1 |
| AMZN | 10-K | 2025-02-07 | 0001018724-25-000004 | — | — | doc-warning×1 |
| AMZN | 10-Q | 2026-07-31 | 0001018724-26-000026 | — | — | dup-heading×1 |
| GOOGL | 10-K | 2026-02-05 | 0001652044-26-000018 | — | — | dup-heading×1 |
| GOOGL | 10-K | 2025-02-05 | 0001652044-25-000014 | — | — | dup-heading×1 |
| GOOGL | 10-Q | 2026-07-23 | 0001652044-26-000071 | — | — | dup-heading×1 |
| META | 10-K | 2026-01-29 | 0001628280-26-003942 | — | — | dup-heading×1 |
| META | 10-K | 2025-01-30 | 0001326801-25-000017 | — | — | dup-heading×1 |
| META | 10-Q | 2026-07-30 | 0001628280-26-050705 | — | — | dup-heading×2 |
| TSLA | 10-K | 2026-01-29 | 0001628280-26-003952 | — | — | dup-heading×1 |
| TSLA | 10-K | 2025-01-30 | 0001628280-25-003063 | — | — | dup-heading×1 |
| TSLA | 10-Q | 2026-07-23 | 0001628280-26-049270 | — | — | short-item-1a; dup-heading×1 |
| BRK-B | 10-K | 2026-03-02 | 0001193125-26-083899 | — | — | dup-heading×1 |
| BRK-B | 10-K | 2025-02-24 | 0000950170-25-025210 | — | — | dup-heading×1 |
| BRK-B | 10-Q | 2026-08-10 | 0001193125-26-341032 | — | — | short-item-1a; dup-heading×1 |
| JPM | 10-K | 2026-02-13 | 0001628280-26-008131 | — | — | short-item-7; long-item-15 |
| JPM | 10-K | 2025-02-14 | 0000019617-25-000270 | — | — | short-item-7; long-item-15 |
| CVX | 10-K | 2026-02-24 | 0000093410-26-000078 | — | — | short-item-7; doc-warning×1 |
| CVX | 10-K | 2025-02-21 | 0000093410-25-000009 | — | — | short-item-7; doc-warning×1 |
| WMT | 10-K | 2026-03-13 | 0000104169-26-000055 | — | — | dup-heading×1 |
| WMT | 10-K | 2025-03-14 | 0000104169-25-000021 | — | — | dup-heading×1 |
| KO | 10-K | 2026-02-20 | 0001628280-26-010047 | — | — | dup-heading×1 |
| KO | 10-K | 2025-02-20 | 0000021344-25-000011 | — | — | dup-heading×1 |
| PFE | 10-K | 2026-02-26 | 0000078003-26-000026 | 1B | — | dup-heading×2; doc-warning×1 |
| PFE | 10-K | 2025-02-27 | 0000078003-25-000054 | 1B | — | dup-heading×2; doc-warning×1 |
| BA | 10-K | 2026-01-30 | 0001628280-26-004357 | — | — | — |
| BA | 10-K | 2025-02-03 | 0000012927-25-000015 | — | — | — |
| DIS | 10-K | 2025-11-13 | 0001744489-25-000155 | — | — | dup-heading×1; doc-warning×1 |
| DIS | 10-K | 2024-11-14 | 0001744489-24-000276 | — | — | dup-heading×1; doc-warning×1 |
| NFLX | 10-K | 2026-01-23 | 0001065280-26-000034 | — | — | dup-heading×1; doc-warning×1 |
| NFLX | 10-K | 2025-01-27 | 0001065280-25-000044 | — | — | dup-heading×1; doc-warning×1 |
| COST | 10-K | 2025-10-08 | 0000909832-25-000101 | 7 | — | dup-heading×1 |
| COST | 10-K | 2024-10-09 | 0000909832-24-000049 | 7 | — | dup-heading×1 |
| UNH | 10-K | 2026-03-02 | 0000731766-26-000062 | — | — | doc-warning×1 |
| UNH | 10-K | 2025-02-27 | 0000731766-25-000063 | — | — | doc-warning×1 |
| CAT | 10-K | 2026-02-13 | 0000018230-26-000008 | — | — | dup-heading×1 |
| CAT | 10-K | 2025-02-14 | 0000018230-25-000008 | — | — | dup-heading×1 |
| GE | 10-K | 2026-01-29 | 0000040545-26-000008 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |
| GE | 10-K | 2025-02-03 | 0000040545-25-000015 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |
| HD | 10-K | 2026-03-18 | 0001628280-26-019436 | — | — | dup-heading×1; doc-warning×1 |
| HD | 10-K | 2025-03-21 | 0000354950-25-000085 | — | — | dup-heading×1; doc-warning×1 |
| INTC | 10-K | 2026-01-23 | 0000050863-26-000011 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |
| INTC | 10-K | 2025-01-31 | 0000050863-25-000009 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |
| PLD | 10-K | 2026-02-13 | 0001193125-26-051453 | — | — | doc-warning×1 |
| PLD | 10-K | 2025-02-14 | 0000950170-25-021272 | — | — | doc-warning×1 |
| O | 10-K | 2026-02-25 | 0000726728-26-000011 | — | — | dup-heading×1 |
| O | 10-K | 2025-02-25 | 0000726728-25-000055 | — | — | dup-heading×1 |
| AMD | 10-K | 2026-02-04 | 0000002488-26-000018 | — | — | — |
| AMD | 10-K | 2025-02-05 | 0000002488-25-000012 | — | — | — |
| ORCL | 10-K | 2026-06-22 | 0001193125-26-277521 | — | — | long-item-15; dup-heading×1 |
| ORCL | 10-K | 2025-06-18 | 0000950170-25-087926 | — | — | long-item-15; dup-heading×1 |
| CRM | 10-K | 2026-03-02 | 0001108524-26-000060 | — | 4A | dup-heading×1; doc-warning×1 |
| CRM | 10-K | 2025-03-05 | 0001108524-25-000006 | — | 4A | dup-heading×1; doc-warning×1 |
| ABBV | 10-K | 2026-02-20 | 0001551152-26-000008 | — | — | — |
| ABBV | 10-K | 2025-02-14 | 0001551152-25-000020 | — | — | — |
| MCD | 10-K | 2026-02-24 | 0000063908-26-000035 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |
| MCD | 10-K | 2025-02-25 | 0000063908-25-000012 | 1, 1A, 1B, 2, 3, 5, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15, 1C | — | doc-warning×1 |

## Located but Implausible Items

| Ticker | Form | Filing Date | Item | Chars | Reason |
|--------|------|-------------|------|------:|--------|
| NVDA | 10-K | 2026-02-25 | 8 | 154 | expected at least 4,000 chars |
| NVDA | 10-K | 2025-02-26 | 8 | 154 | expected at least 4,000 chars |
| JPM | 10-K | 2026-02-13 | 7 | 300 | expected at least 4,000 chars |
| JPM | 10-K | 2026-02-13 | 8 | 314 | expected at least 4,000 chars |
| JPM | 10-K | 2026-02-13 | 15 | 974088 | expected at most 300,000 chars |
| JPM | 10-K | 2025-02-14 | 7 | 300 | expected at least 4,000 chars |
| JPM | 10-K | 2025-02-14 | 8 | 314 | expected at least 4,000 chars |
| JPM | 10-K | 2025-02-14 | 15 | 983205 | expected at most 300,000 chars |
| CVX | 10-K | 2026-02-24 | 7 | 147 | expected at least 4,000 chars |
| CVX | 10-K | 2026-02-24 | 8 | 105 | expected at least 4,000 chars |
| CVX | 10-K | 2025-02-21 | 7 | 147 | expected at least 4,000 chars |
| CVX | 10-K | 2025-02-21 | 8 | 105 | expected at least 4,000 chars |
| DIS | 10-K | 2025-11-13 | 8 | 67 | expected at least 4,000 chars |
| DIS | 10-K | 2024-11-14 | 8 | 67 | expected at least 4,000 chars |
| NFLX | 10-K | 2026-01-23 | 8 | 216 | expected at least 4,000 chars |
| NFLX | 10-K | 2025-01-27 | 8 | 216 | expected at least 4,000 chars |
| PLD | 10-K | 2026-02-13 | 8 | 931 | expected at least 4,000 chars |
| PLD | 10-K | 2025-02-14 | 8 | 931 | expected at least 4,000 chars |
| ORCL | 10-K | 2026-06-22 | 8 | 105 | expected at least 4,000 chars |
| ORCL | 10-K | 2025-06-18 | 8 | 105 | expected at least 4,000 chars |

## Item 1A Diff Results

| Ticker | Base → Target | +/−/~ | Similarity | Flags |
|--------|---------------|-------|------------|-------|
| AAPL | 2024-11-01 → 2025-10-31 | +9 −18 ~51 | 0.762 | — |
| MSFT | 2025-07-30 → 2026-07-29 | +25 −8 ~47 | 0.727 | — |
| NVDA | 2025-02-26 → 2026-02-25 | +36 −23 ~52 | 0.810 | — |
| AMZN | 2025-02-07 → 2026-02-06 | +4 −5 ~26 | 0.939 | — |
| GOOGL | 2025-02-05 → 2026-02-05 | +69 −68 ~54 | 0.585 | — |
| META | 2025-01-30 → 2026-01-29 | +13 −13 ~84 | 0.932 | — |
| TSLA | 2025-01-30 → 2026-01-29 | +14 −12 ~48 | 0.847 | — |
| BRK-B | 2025-02-24 → 2026-03-02 | +6 −4 ~15 | 0.834 | — |
| JPM | 2025-02-14 → 2026-02-13 | +259 −296 ~214 | 0.473 | — |
| CVX | 2025-02-21 → 2026-02-24 | +5 −8 ~16 | 0.730 | — |
| WMT | 2025-03-14 → 2026-03-13 | +12 −18 ~50 | 0.769 | — |
| KO | 2025-02-20 → 2026-02-20 | +7 −9 ~39 | 0.884 | — |
| PFE | 2025-02-27 → 2026-02-26 | +11 −5 ~45 | 0.839 | — |
| BA | 2025-02-03 → 2026-01-30 | +12 −15 ~41 | 0.779 | — |
| DIS | 2024-11-14 → 2025-11-13 | +13 −11 ~50 | 0.746 | — |
| NFLX | 2025-01-27 → 2026-01-23 | +11 −8 ~33 | 0.898 | — |
| COST | 2024-10-09 → 2025-10-08 | +7 −5 ~19 | 0.890 | — |
| UNH | 2025-02-27 → 2026-03-02 | +13 −6 ~48 | 0.820 | — |
| CAT | 2025-02-14 → 2026-02-13 | +0 −3 ~4 | 0.966 | — |
| GE | 2025-02-03 → 2026-01-29 | ERROR | — | Diff not_found on base: {"reason":"Item \"1A\" was not found in this filing.","available":[]} |
| HD | 2025-03-21 → 2026-03-18 | +14 −16 ~48 | 0.722 | — |
| INTC | 2025-01-31 → 2026-01-23 | ERROR | — | Diff not_found on base: {"reason":"Item \"1A\" was not found in this filing.","available":[]} |
| PLD | 2025-02-14 → 2026-02-13 | +8 −4 ~19 | 0.920 | — |
| O | 2025-02-25 → 2026-02-25 | +66 −73 ~62 | 0.544 | — |
| AMD | 2025-02-05 → 2026-02-04 | +18 −18 ~87 | 0.862 | — |
| ORCL | 2025-06-18 → 2026-06-22 | +75 −17 ~54 | 0.582 | — |
| CRM | 2025-03-05 → 2026-03-02 | +39 −88 ~90 | 0.629 | — |
| ABBV | 2025-02-14 → 2026-02-20 | +13 −3 ~19 | 0.878 | — |
| MCD | 2025-02-25 → 2026-02-24 | ERROR | — | Diff not_found on base: {"reason":"Item \"1A\" was not found in this filing.","available":[]} |

## Distinct Warnings

| Warning | Count |
|---------|-------|
| Item 16 heading appeared 2 times outside the table of contents; kept the longest body. | 28 |
| Item 4: body is only 23 chars ("Mine Safety Disclosures"); likely a placeholder such as "None." or "Not applicable." | 22 |
| Item 9: body is only 84 chars ("Changes in and Disagreements with Accountants on Accounting "); likely a placeholder such as "None." or "Not applicable." | 22 |
| Item 1B: body is only 25 chars ("Unresolved Staff Comments"); likely a placeholder such as "None." or "Not applicable." | 20 |
| heading and first paragraph were in one block; split at SECURITY OWNERSHIP | 20 |
| heading and first paragraph were in one block; split at MANAGEMENT’S DISCUSSION AND ANALYSIS | 19 |
| Item 6: heading found but no body text followed it; not returned. | 18 |
| Item 6: body is only 10 chars ("[Reserved]"); likely a placeholder such as "None." or "Not applicable." | 17 |
| Item 9C: body is only 67 chars ("Disclosure Regarding Foreign Jurisdictions that Prevent Insp"); likely a placeholder such as "None." or "Not applicable." | 17 |
| Item 1B: body is only 5 chars ("None."); likely a placeholder such as "None." or "Not applicable." | 14 |
| Item 9C: body is only 15 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 14 |
| Item 4: body is only 15 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 12 |
| Item 9: body is only 5 chars ("None."); likely a placeholder such as "None." or "Not applicable." | 10 |
| heading and first paragraph were in one block; split at CHANGES IN AND DISAGREEMENTS WITH ACCOUNTANTS | 8 |
| Item 9: body is only 43 chars ("ON ACCOUNTING AND FINANCIAL DISCLOSURE"); likely a placeholder such as "None." or "Not applicable." | 8 |
| Item 6: body is only 8 chars ("Reserved"); likely a placeholder such as "None." or "Not applicable." | 7 |
| heading and first paragraph were in one block; split at CERTAIN RELATIONSHIPS AND RELATED TRANSACTIONS | 6 |
| No "Item N" headings were found; the document may not be a 10-K/10-Q or may be an exhibit. | 6 |
| Item I.1 heading appeared 2 times outside the table of contents; kept the longest body. | 5 |
| Item 1B: body is only 15 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 4 |
| heading and first paragraph were in one block; split at MANAGEMENT'S DISCUSSION AND ANALYSIS | 4 |
| Item 9C: body is only 15 chars ("Not Applicable."); likely a placeholder such as "None." or "Not applicable." | 4 |
| Item 4: body is only 15 chars ("Not Applicable."); likely a placeholder such as "None." or "Not applicable." | 4 |
| Item II.3: body is only 31 chars ("Defaults Upon Senior Securities"); likely a placeholder such as "None." or "Not applicable." | 3 |
| Item II.6 heading appeared 2 times outside the table of contents; kept the longest body. | 3 |
| Item 11: body is only 124 chars ("The information required by this Item will be included in th"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 124 chars ("The information required by this Item will be included in th"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 124 chars ("The information required by this Item will be included in th"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 124 chars ("The information required by this Item will be included in th"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item II.4: body is only 23 chars ("Mine Safety Disclosures"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1B: body is only 235 chars ("We have received no written comments regarding our periodic "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1C heading appeared 4 times outside the table of contents; kept the longest body. | 2 |
| Item 3: body is only 175 chars ("Refer to Note 14 – Contingencies of the Notes to Financial S"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 6: body is only 95 chars ("[Reserved]"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9A heading appeared 4 times outside the table of contents; kept the longest body. | 2 |
| Item 11: body is only 283 chars ("The information in the Proxy Statement set forth under the c"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 279 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 181 chars ("The information set forth in the Proxy Statement under the c"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 357 chars ("Information concerning fees and services provided by our pri"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 16 heading appeared 3 times outside the table of contents; kept the longest body. | 2 |
| heading and first paragraph were in one block; split at UNREGISTERED SALES OF EQUITY SECURITIES | 2 |
| Item 3: body is only 170 chars ("Please see Note 12 of the Notes to the Consolidated Financia"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 154 chars ("The information required by this Item is set forth in our Co"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 339 chars ("Not Applicable."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 327 chars ("Information regarding our executive compensation required by"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 371 chars ("Information regarding related transactions and director inde"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 245 chars ("Information regarding accounting fees and services required "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 130 chars ("See Item 8 of Part II, “Financial Statements and Supplementa"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 5: body is only 343 chars ("Market Information"); likely a placeholder such as "None." or "Not applicable." | 2 |
| heading and first paragraph were in one block; split at Changes in and Disagreements with Accountants | 2 |
| Item 9: body is only 43 chars ("On Accounting and Financial Disclosure"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 171 chars ("Information required by Item 11 of Part III is included in o"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 171 chars ("Information required by Item 12 of Part III is included in o"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 171 chars ("Information required by Item 13 of Part III is included in o"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 171 chars ("Information required by Item 14 of Part III is included in o"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 2: body is only 277 chars ("Our headquarters are located in Mountain View, California. W"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 246 chars ("For a description of our material pending legal proceedings,"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 4: body is only 31 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 31 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 329 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 314 chars ("The information required by this item will be included under"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 205 chars ("The information required by this item will be included under"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 218 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 218 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 218 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 218 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 139 chars ("The information required by this Item 11 of Form 10-K will b"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 214 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 164 chars ("AND DIRECTOR INDEPENDENCE"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 139 chars ("The information required by this Item 14 of Form 10-K will b"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1B: body is only 29 chars ("Unresolved Staff Comments"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 5: body is only 115 chars ("Market for Registrant’s Common Equity, Related Security Hold"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 6: body is only 14 chars ("[Reserved]"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8 heading appeared 2 times outside the table of contents; kept the longest body. | 2 |
| Item 9: body is only 89 chars ("Changes in and Disagreements with Accountants on Accounting "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9B: body is only 328 chars ("Berkshire has not adopted a Rule 10b5-1 trading arrangement "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 10: body is only 59 chars ("Directors, Executive Officers and Corporate Governance"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 27 chars ("Executive Compensation"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 99 chars ("Security Ownership of Certain Beneficial Owners and Manageme"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 77 chars ("Certain Relationships and Related Transactions and Director "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 43 chars ("Principal Accountant Fees and Services"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1B: body is only 26 chars ("Unresolved Staff Comments."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1C: body is only 145 chars ("Refer to the Operational Risk Management section of Manageme"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 76 chars ("Refer to Note 30 for a description of the Firm’s material le"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 4: body is only 24 chars ("Mine Safety Disclosures."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 7: body is only 300 chars ("Management’s discussion and analysis of financial condition "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 7A: body is only 196 chars ("Refer to the Market Risk Management section of Management’s "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 314 chars ("The Consolidated Financial Statements, together with the Not"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9: body is only 85 chars ("Changes in and Disagreements with Accountants on Accounting "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 68 chars ("Disclosure regarding Foreign Jurisdictions that Prevent Insp"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 23 chars ("Executive Compensation."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 74 chars ("Certain Relationships and Related Transactions, and Director"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 39 chars ("Principal Accounting Fees and Services."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 7: body is only 147 chars ("The index to Management’s Discussion and Analysis of Financi"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 7A: body is only 285 chars ("The company’s discussion of interest rate, foreign currency "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 105 chars ("The index to Financial Statements and Supplementary Data is "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 223 chars ("The information required by this Item 11 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 252 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 201 chars ("The information required by this Item 13 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 205 chars ("The information required by this Item 14 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 67 chars ("Disclosure Regarding Foreign Jurisdictions That Prevent Insp"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1 heading appeared 2 times outside the table of contents; kept the longest body. | 2 |
| Item 12: body is only 305 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 7A: body is only 190 chars ("The information required by this Item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9B: body is only 254 chars ("OTHER INFORMATION"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 365 chars ("Information about Director and executive compensation is inc"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 116 chars ("We incorporate by reference into this Item our disclosures m"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9: body is only 84 chars ("Changes in and Disagreements With Accountants on Accounting "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 295 chars ("The information required by this item will be included under"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 324 chars ("Our independent registered public accounting firm is Deloitt"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1B: body is only 203 chars ("The Company has received no written comments regarding its p"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 225 chars ("As disclosed in Note 14 to the Consolidated Financial Statem"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 67 chars ("See Index to Financial Statements and Supplemental Data on p"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 275 chars ("Information setting forth the security ownership of certain "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 300 chars ("Information regarding certain related transactions appearing"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 201 chars ("Information appearing under the captions “Auditor Fees and S"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 216 chars ("The consolidated financial statements and accompanying notes"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 275 chars ("Information required by this item is incorporated by referen"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 279 chars ("Information required by this item is incorporated by referen"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 247 chars ("Information required by this item is incorporated by referen"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 325 chars ("Information with respect to principal independent registered"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 122 chars ("See discussion of Legal Proceedings in Note 10 to the consol"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 194 chars ("The information required by this Item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 257 chars ("Our independent registered public accounting firm is KPMG LL"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 2: body is only 322 chars ("We own and lease real properties to support our business ope"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 331 chars ("The information required by this Item 3 is incorporated here"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 316 chars ("The information required by Items 404 and 407(a) of Regulati"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 309 chars ("The information required by Item 9(e) of Schedule 14A will b"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1 heading appeared 4 times outside the table of contents; kept the longest body. | 2 |
| Item 3: body is only 300 chars ("Certain legal proceedings in which we are involved are discu"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 93 chars ("Information required by this Item is incorporated by referen"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 93 chars ("Information required by this Item is incorporated by referen"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 210 chars ("Our independent registered public accounting firm is Pricewa"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9: body is only 15 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 137 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 169 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 378 chars ("From time to time, we and our co-investment ventures are par"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 327 chars ("The information required by this item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 262 chars ("The information required by this item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 256 chars ("The information required by this item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 226 chars ("The information required by this item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1 heading appeared 3 times outside the table of contents; kept the longest body. | 2 |
| Item 1B: body is only 39 chars ("There are no unresolved staff comments."); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 2: body is only 67 chars ("Information pertaining to our properties can be found under "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 136 chars ("Information regarding legal proceedings is included in note "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9B: body is only 371 chars ("Director and Officer Trading Arrangements and Policies"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 253 chars ("The information required by this item is set forth under the"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 293 chars ("The information required by this item is set forth under the"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 257 chars ("The information required by this item is set forth under the"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 393 chars ("Our independent registered public accounting firm is KPMG LL"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 68 chars ("Disclosures Regarding Foreign Jurisdictions that Prevent Ins"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 300 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 226 chars ("AND DIRECTOR INDEPENDENCE"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 299 chars ("The material set forth in Note 12 (pertaining to information"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 8: body is only 105 chars ("The response to this item is submitted as a separate section"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9B: body is only 305 chars ("Rule 10b5-1 Trading Plans"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 11: body is only 142 chars ("The information required by this Item 11 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 142 chars ("The information required by this Item 12 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 142 chars ("The information required by this Item 13 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 142 chars ("The information required by this Item 14 is incorporated her"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 12: body is only 348 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 13: body is only 247 chars ("AND DIRECTOR INDEPENDENCE"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 14: body is only 186 chars ("The information required by this Item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 1B: body is only 25 chars ("UNRESOLVED STAFF COMMENTS"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 3: body is only 257 chars ("Information pertaining to legal proceedings is provided in N"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 6: body is only 10 chars ("[RESERVED]"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9: body is only 84 chars ("CHANGES IN AND DISAGREEMENTS WITH ACCOUNTANTS ON ACCOUNTING "); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 9C: body is only 67 chars ("DISCLOSURE REGARDING FOREIGN JURISDICTIONS THAT PREVENT INSP"); likely a placeholder such as "None." or "Not applicable." | 2 |
| Item 10: body is only 333 chars ("The information required by this Item will be included in th"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item I.3: body is only 323 chars ("There have been no material changes to the Company’s market "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 330 chars ("Insider Trading Arrangements"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1: body is only 174 chars ("Refer to Note 13 – Contingencies of the Notes to Financial S"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1: body is only 226 chars ("Refer to Note 10 of the Notes to Condensed Consolidated Fina"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1: body is only 106 chars ("See Item 1 of Part I, “Financial Statements — Note 4 — Commi"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.2: body is only 5 chars ("None."); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.3: body is only 5 chars ("None."); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.4: body is only 15 chars ("Not applicable."); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 6: body is only 16 chars ("27."); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 6: body is only 16 chars ("29."); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item I.3: body is only 223 chars ("For quantitative and qualitative disclosures about market ri"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1: body is only 279 chars ("For a description of our material pending legal proceedings,"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.2: body is only 375 chars ("AND USE OF PROCEEDS"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 10: body is only 54 chars ("Directors, Executive Officers and Corporate Governance"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item I.3: body is only 332 chars ("There have been no material changes to our market risk expos"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.2: body is only 163 chars ("a) Sales of Unregistered Securities"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 200 chars ("For a description of our material pending legal proceedings,"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 207 chars ("For a description of our material pending legal proceedings,"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1: body is only 203 chars ("For a description of our material pending legal proceedings,"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.1A: body is only 305 chars ("Our operations and financial results are subject to various "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.2: body is only 59 chars ("Unregistered Sales of Equity Securities and Use of Proceeds"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.5: body is only 302 chars ("Rule 10b5-1 Trading Arrangements"); likely a placeholder such as "None." or "Not applicable." | 1 |
| 17 repeated running headers merged | 1 |
| Item I.3: body is only 343 chars ("Reference is made to Berkshire’s Annual Report on Form 10-K "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.2: body is only 103 chars ("Unregistered Sales of Equity Securities and Use of Proceeds "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.4: body is only 201 chars ("Information regarding the Company’s mine safety violations a"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item II.5: body is only 328 chars ("Berkshire has not adopted a Rule 10b5-1 trading arrangement "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 294 chars ("During the fiscal quarter ended December 31, 2025, none of o"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 10: body is only 301 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 203 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 12: body is only 278 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 13: body is only 203 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 14: body is only 203 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 10: body is only 326 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 189 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 12: body is only 264 chars ("OF CERTAIN BENEFICIAL OWNERS AND MANAGEMENT AND RELATED STOC"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 13: body is only 189 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 14: body is only 189 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 253 chars ("During the three months ended December 31, 2025, none of our"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 253 chars ("During the three months ended December 31, 2024, none of our"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 331 chars ("Information required by this item and appearing under the ca"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 305 chars ("Information appearing under the captions “Director Compensat"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 361 chars ("Information with respect to this item may be found in Note 9"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 361 chars ("Information with respect to this item may be found in Note 8"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 242 chars ("During the fiscal quarter ended August 31, 2025, no director"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 184 chars ("The information required by this Item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 13: body is only 198 chars ("The information required by this Item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 244 chars ("During the fiscal quarter ended September 1, 2024, no direct"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 225 chars ("The information required by this Item is incorporated herein"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 318 chars ("During the fiscal quarter ended February 1, 2026, no directo"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 246 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 12: body is only 197 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 265 chars ("During the fiscal quarter ended February 2, 2025, no directo"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 378 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 12: body is only 222 chars ("The information required by this item is incorporated by ref"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 9B: body is only 299 chars ("During the period ended December 31, 2024, none of our direc"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 178 chars ("For a discussion of our legal proceedings, refer to Note 12 "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 3: body is only 162 chars ("For a discussion of our legal proceedings, refer to Note 18 "); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 288 chars ("The material to be included in the 2026 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 13: body is only 341 chars ("The material to be included in the 2026 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 14: body is only 375 chars ("The material to be included in the 2026 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 11: body is only 288 chars ("The material to be included in the 2025 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 13: body is only 341 chars ("The material to be included in the 2025 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |
| Item 14: body is only 375 chars ("The material to be included in the 2025 AbbVie Inc. Proxy St"); likely a placeholder such as "None." or "Not applicable." | 1 |

