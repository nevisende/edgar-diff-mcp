# Scenario harness report

Generated 2026-09-02T21:50:56.700Z. **This is string-level grading only**: checks inspect the captured natural-language answer, not factual entailment or quote fidelity. Missing answer files and nonzero harness exits fail explicitly. The embedded prompt and command diagnostics are excluded from grading. Note that one Codex run (`xom-holding-company`) failed on a provider usage limit rather than on the task.

| Scenario | Claude | Codex | Agy |
|---|---|---|---|
| nvda-risk-factors | PASS | PASS | PASS |
| aapl-mdna-tariffs | PASS | PASS | PASS |
| tsla-where-it-moved | FAIL: names Item 9B as most changed; names Item 15 in the top three; includes an SEC Archives citation URL | PASS | PASS |
| brk-10q-part-ii | PASS | PASS | PASS |
| ge-honest-not-found | PASS | PASS | PASS |
| jpm-legal-proceedings | PASS | PASS | PASS |
| xom-holding-company | PASS | FAIL: harness exit code is zero; discloses the holding-company mismatch or uses operating-company CIK | PASS |

## Per-harness totals

| Harness | Passed |
|---|---:|
| claude | 6/7 |
| codex | 6/7 |
| agy | 7/7 |
