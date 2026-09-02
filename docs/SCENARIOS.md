# End-to-end analyst scenarios

Seven analyst scenarios designed to verify that the `edgar-diff` MCP server delivers verifiable, cited answers when driven by real coding agents, without hallucinating, guessing missing sections, or dropping citations.

## 1. What this is

The scenario suite tests the server at two distinct layers:

- **Layer A: Model-free MCP client (`scripts/scenarios-mcp.ts`).** A deterministic client over `@modelcontextprotocol/sdk` connects to `node dist/main.js` via stdio against live SEC EDGAR data. It runs predefined tool call pipelines (`resolve_company` → `list_filings` → `diff_sections` / `diff_all_items` / `search_filing` / `get_section`) and asserts structural ground truth: HTTP/tool status, array lengths, exact paragraph counts, accession identifiers, verbatim substrings, and SEC Archives citation URLs.
- **Layer B: Agent harnesses with registered MCP tools (`scripts/scenarios-harness.sh`).** The same scenario prompts executed as natural-language tasks across three agent CLIs:
  1. **Claude Code** with Claude Sonnet (the `sonnet` alias in Claude Code) (`claude -p --model sonnet`)
  2. **Codex CLI** with GPT-5.6 (`codex exec` running `gpt-5.6-sol`)
  3. **Antigravity CLI** with Gemini 3.8 Flash (`agy -p --model gemini-3.8-flash-high`)

Each agent runs in an isolated directory with the server registered as an MCP server, receives a strict system prompt prefix requiring verbatim quotations and citations, and answers independently. Captured Markdown answers are then graded by `scripts/scenarios-grade.ts`.

### Running the scenarios

```bash
# Layer A: Deterministic MCP client run
npm run scenarios:mcp

# Layer B: Run agent harness (claude, codex, or agy; optional scenario-id)
scripts/scenarios-harness.sh <claude|codex|agy> [scenario-id]

# Layer B: Grade captured harness answers
npm run scenarios:grade
```

### Server registration per harness

The server was registered in each harness using the following configurations:

- **Codex CLI:**
  ```bash
  codex mcp add edgar-diff --env EDGAR_USER_AGENT="edgar-diff-mcp/0.1 furkandenizhan@gmail.com" --env EDGAR_CACHE_DIR="/path/to/.edgar-cache" -- node /path/to/edgar-diff-mcp/dist/main.js
  ```
- **Antigravity CLI:**
  ```bash
  agy mcp add -e EDGAR_USER_AGENT="edgar-diff-mcp/0.1 furkandenizhan@gmail.com" -e EDGAR_CACHE_DIR="/path/to/.edgar-cache" edgar-diff node /path/to/edgar-diff-mcp/dist/main.js
  ```
- **Claude Code:**
  Configured via `--mcp-config <path>` using the template in `scenarios/claude-mcp.template.json`:
  ```json
  {
    "mcpServers": {
      "edgar-diff": {
        "command": "node",
        "args": ["/path/to/edgar-diff-mcp/dist/main.js"],
        "env": {
          "EDGAR_USER_AGENT": "edgar-diff-mcp/0.1 furkandenizhan@gmail.com",
          "EDGAR_CACHE_DIR": "/path/to/edgar-diff-mcp/.edgar-cache"
        }
      }
    }
  }
  ```
  and executed with `--mcp-config "$CLAUDE_CONFIG" --strict-mcp-config --allowedTools "mcp__edgar-diff__*"`.

## 2. The scenario table

| ID | What the analyst asks | Why it is a realistic test | Ground-truth check |
|---|---|---|---|
| `nvda-risk-factors` | What new risk factors did NVIDIA add in its latest 10-K compared with the prior one? Quote the added paragraphs verbatim with citations. | Exercises TOC/heading parsing, paragraph LCS, and Dice pairing over volatile disclosures with substantial paragraph reflow, commercial partner risks, and new export controls (China H20, Groq IP license). | CIK `0001045810`; Item 1A diff returns added paragraphs > 0, verbatim Groq licence agreement, target accession `0001045810-26-000021`, and SEC Archives citation URLs. |
| `aapl-mdna-tariffs` | In Apple's most recent 10-K, does the MD&A (Item 7) mention tariffs? Quote every matching paragraph with citations, then tell me whether those paragraphs are new compared with the previous 10-K. | Tests combining targeted in-filing regex search (`search_filing` on Item 7) with cross-year section diffing (`diff_sections`) to verify temporal provenance without losing paragraph citations. | CIK `0000320193`; Item 7 search yields exactly 4 matches including the 2025 tariff disclosure; diff marks paragraphs 24 and 25 as `added`; citations present. |
| `tsla-where-it-moved` | Between Tesla's last two 10-Ks, which Items changed the most? Rank the top three by similarity and say how many paragraphs were added, removed and changed in each. | Tests report-wide triage via `diff_all_items` without fetching bulky text payloads. Tests sorting by similarity score, separating small high-percentage shifts (Item 9B) from massive document edits (Item 15, Item 7). | CIK `0001318605`; Item 9B ranks first (similarity 0.12, +7/-1/~1), Item 15 ranks second (similarity 0.328, +20/-202/~9), Item 7 ranks third (similarity 0.615, +35/-38/~97). |
| `brk-10q-part-ii` | Compare Berkshire Hathaway's Part II Item 1A (Risk Factors) between its two most recent 10-Q filings. Use the qualified item II.1A. If nothing changed, say so explicitly. | Exercises 10-Q Part qualification (`II.1A`), avoiding collisions with Part I Items. Tests handling of short boilerplate cross-references and evaluates whether agents recognise subsequent table headings (Item 2 repurchases). | CIK `0001067983`; resolves accessions `0001193125-26-341032` and `0001193125-26-202243`; `diff_sections` on `II.1A` returns stats (+14/-10/~1); Layer B asserts `II.1A`, accessions, and counts or explicit unchanged disclosure. |
| `ge-honest-not-found` | What are GE Aerospace's risk factors in its latest 10-K? Quote them with citations. | Exercises Rule 4 ("No data = no answer") and Rule 5 ("Honest degradation"). GE Aerospace uses custom body headings and a cross-reference index at the end, omitting formal `Item N` headings. Tests whether agents report `not_found` rather than hallucinating plausible text. | CIK `0000040545`; `list_items` yields 0 items; `get_section` returns `status: "not_found"` with `reason: 'Item "1A" was not found in this filing.'`; Layer B checks confirm refusal and zero fabricated quotes. |
| `jpm-legal-proceedings` | How did JPMorgan's Legal Proceedings (Item 3) change between its last two 10-Ks? Quote added and removed paragraphs with citations. | Tests paginated EDGAR submission index traversal across prolific filers, and zero-change detection on identical single-paragraph cross-references ("Refer to Note 30..."). | CIK `0000019617`; paginated index retrieves accessions `0001628280-26-008131` and `0000019617-25-000270`; `diff_sections` returns +0/-0/~0 and similarity 1.0; Layer B verifies accession citations and zero change report. |
| `xom-holding-company` | Diff Exxon's risk factors between its last two 10-Ks. | Tests entity-resolution traps during corporate restructuring. Ticker `XOM` resolves on EDGAR to "ExxonMobil Holdings Corp" (CIK `0002115436`), which has filed 0 10-Ks; operating filings reside under CIK `0000034088`. Tests whether agents discover the empty filing list and fall back to the operating CIK. | Layer A verifies XOM ticker resolves to holding company CIK `0002115436` with 0 10-Ks, resolves operating CIK `0000034088` with two 10-Ks, and diffs Item 1A; Layer B checks confirm disclosure of holding mismatch or use of CIK `0000034088`. |

## 3. Layer A results

Model-free run through a real MCP client using stdio against `node dist/main.js` and real SEC EDGAR data (`evals/scenarios/mcp-client.md`).

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

## 4. Layer B results

Evaluated across three independent agent harnesses running against the registered MCP server (`evals/scenarios/report.md`).

| Scenario | Claude | Codex | Agy |
|---|---|---|---|
| nvda-risk-factors | PASS | PASS | PASS |
| aapl-mdna-tariffs | PASS | PASS | PASS |
| tsla-where-it-moved | PASS | PASS | PASS |
| brk-10q-part-ii | PASS | PASS | PASS |
| ge-honest-not-found | PASS | PASS | PASS |
| jpm-legal-proceedings | PASS | PASS | PASS |
| xom-holding-company | PASS | FAIL: harness exit code is zero; discloses the holding-company mismatch or uses operating-company CIK | PASS |

### Per-harness totals

| Harness | Model | Passed |
|---|---|---:|
| Claude Code | Claude Sonnet (the `sonnet` alias in Claude Code) | 7/7 |
| Codex CLI | GPT-5.6 (`gpt-5.6-sol`) | 6/7* |
| Antigravity CLI | Gemini 3.8 Flash (`gemini-3.8-flash-high`) | 7/7 |

*\*Note on Codex `xom-holding-company`: The single failure recorded for Codex was caused by an upstream provider usage-limit error (`ERROR: You've hit your usage limit... try again at Sep 3rd, 2026 3:04 AM`) after 2 seconds of execution, before any MCP tool calls were dispatched. It represents an environmental quota exhaustion rather than a task or reasoning failure. This scenario will be re-run when quota resets and the matrix will be updated.*

### Wall-clock seconds per run

Extracted from the headers of each recorded answer file:

| Scenario | Claude (Sonnet) | Codex (GPT-5.6) | Agy (Gemini 3.8 Flash) |
|---|---:|---:|---:|
| `nvda-risk-factors` | 103s | 178s | 130s |
| `aapl-mdna-tariffs` | 27s | 70s | 31s |
| `tsla-where-it-moved` | 19s | 29s | 31s |
| `brk-10q-part-ii` | 22s | 54s | 45s |
| `ge-honest-not-found` | 20s | 46s | 29s |
| `jpm-legal-proceedings` | 24s | 53s | 32s |
| `xom-holding-company` | 46s | 2s* | 75s |

### Scenario-by-scenario harness comparison

#### `nvda-risk-factors`
All three harnesses invoked tools in sensible logical progression (`resolve_company` → `list_filings` → `diff_sections`). None paraphrased; all preserved citations next to quotes. The models differed primarily in how they handled the large volume of 36 added paragraphs. Claude separated parser reflow artifacts from substantive changes, grouping the additions into five clear themes and quoting paragraph 44: *"We have entered into an intellectual property license arrangement with Groq, Inc., or Groq, that required significant, nonrefundable payments."* Codex took a literal approach, listing every one of the 36 added items in numbered order and noting: *"Some are bullets or sentence fragments because that is how the filing text was segmented; I have not repaired or inferred missing text."* Agy used a structured categorisation, separating the new standalone counterparty risk factor and substantive additions from the HTML reflow fragments, which it placed in a concluding section. All three correctly cited accession `0001045810-26-000021` and provided SEC URLs.

#### `aapl-mdna-tariffs`
All three harnesses executed quickly and cleanly (Claude 27s, Agy 31s, Codex 70s). Each called `search_filing` for "tariff" in Item 7, identified all 4 matching paragraphs, and used `diff_sections` on Item 7 to verify that all four were newly added in FY2025 (`0000320193-25-000079`) and completely absent from FY2024. All three distinguished the new subsection heading (paragraph 24, *"Tariffs and Other Measures"*), the core tariff impact narrative (paragraph 25: *"Beginning in the second quarter of 2025, new U.S. Tariffs were announced..."*), and the gross margin discussions (paragraphs 78 and 79). Codex confirmed the prior year explicitly: *"A search of the previous Item 7 returned zero matches for 'tariff.'"* Citations were maintained adjacent to every quote across all three runs.

#### `tsla-where-it-moved`
Each harness called `diff_all_items` and identified the identical top three Items sorted by lowest similarity: Item 9B (Other Information, similarity 0.12, +7/-1/~1), Item 15 (Exhibits, similarity 0.328, +20/-202/~9), and Item 7 (MD&A, similarity 0.615, +35/-38/~97). Codex presented a concise Markdown table linking to both accession documents. Claude and Agy both went further by providing sound analyst commentary on the metric; Claude pointed out: *"Item 9B's ranking is skewed by its very small size (only 2 base / 8 target paragraphs), so Item 15 or Item 7 may be more meaningful as 'most changed' depending on whether you weight by absolute volume of change."* None of the three attempted redundant or costly text diffs.

#### `brk-10q-part-ii`
All three models properly qualified the item as `II.1A` without defaulting to an unqualified query. Furthermore, all three models noticed and documented a server-side parser quirk: Berkshire's Item 1A is a single static paragraph referencing its Form 10-K, but the parsed section swallowed the subsequent "Item 2" heading, including the share-repurchase tables (+14 added, -10 removed, ~1 changed). All three models analysed the text and correctly reported that the substantive risk factor disclosure itself had not changed:
Claude: *"Result: the substantive Risk Factors text did not change... All of the diffs the tool found are limited to the routine share-repurchase table embedded in this Item..."*
Codex: *"The reported differences occur after that Item 2 heading and concern quarter-specific repurchase information—not the Item 1A risk-factor text. Thus, the risk factors themselves were unchanged."*
Agy quoted paragraph 0 identically across both filings and clearly delineated the subsequent repurchase table values. Both quarterly accessions (`0001193125-26-341032` and `0001193125-26-202243`) were properly cited.

#### `ge-honest-not-found`
This scenario evaluated whether models would respect Rule 4 and Rule 5 when an Item is missing. Calling `get_section` for Item 1A returned `status: "not_found"` with `reason: 'Item "1A" was not found in this filing.'` and `availableItems: []`. All three harnesses respected the result and refused to fabricate or guess risk factors:
Claude: *"Per the tool's guidance, I won't infer or guess the risk factors content — the parser could not locate any Items in this document, so no verbatim text or citation is available."*
Codex: *"Because no risk-factor section or cited paragraphs were returned, I cannot quote or infer its contents."*
Agy: *"Because the tool returned not_found, no risk factor text could be retrieved, and no content is inferred."*
All three cited the accession (`0000040545-26-000008`) and the SEC filing URL.

#### `jpm-legal-proceedings`
All three harnesses navigated EDGAR's paginated submissions index to locate JPMorgan's last two 10-Ks across disparate accession series (`0001628280-26-008131` and `0000019617-25-000270`). Running `diff_sections` on Item 3 returned similarity 1.0 with 0 added, 0 removed, and 0 changed paragraphs. All three reported that the disclosure did not change, quoted the single sentence verbatim (*"Refer to Note 30 for a description of the Firm's material legal proceedings."*), and attached citations for both filings. Claude also noted the server's warning: *"The tool flagged this as a likely placeholder (76 chars), which is accurate — JPMorgan's actual legal-proceedings detail lives in Note 30... not in Item 3 itself."*

#### `xom-holding-company`
This scenario tests entity resolution during corporate restructuring. Ticker `XOM` resolves to "ExxonMobil Holdings Corp" (CIK `0002115436`), which has zero 10-K filings. Claude and Agy both handled the scenario successfully: observing that the holding company had no filings, both resolved the operating company CIK `0000034088` (`EXXON MOBIL CORP`) and compared accessions `0000034088-25-000010` and `0000034088-26-000045`. Moreover, both models identified a server-side parser artifact: all 6 "added" paragraphs were recurring `"Financial Table of Contents"` page breaks:
Claude: *"All 6 paragraphs the tool flagged as 'added' are the identical placeholder string 'Financial Table of Contents' — a parser artifact from page-break/navigation markup in the newer filing's HTML, not new risk-factor prose."*
Agy similarly noted: *"all 6 are pagination markers reading 'Financial Table of Contents'"*.
Codex failed due to a provider usage limit (exit code 1 after 2s), producing no answer. The failure is neither a model comprehension defect nor a server bug, but an API quota event.

## 5. What the scenarios taught us about the server

Concrete observations about server behaviour and tool performance across the runs:

- **Recurring navigation links leak into diffs as added paragraphs.** In Exxon's 10-K, `diff_sections` reported 6 added paragraphs that were simply `"Financial Table of Contents"` links inserted at page breaks. The parser's page furniture filter catches repeated headers when identical short labels repeat (≥3 times), but isolated navigation anchors and unlabelled table links slip through into paragraph arrays.
- **Section boundary overrun on single-paragraph Items.** In Berkshire Hathaway's 10-Q, Part II Item 1A consists of one sentence referencing the Form 10-K. The parser failed to terminate the section before the next heading ("Item 2. Unregistered Sales of Equity Securities..."), absorbing the subsequent share-repurchase activity tables into Item 1A. Tightening boundary detection between consecutive short Items will prevent false diff volume.
- **Payload budgeting is necessary for large diffs.** Sections with significant changes (NVIDIA Item 1A returned 36 additions and 52 changes) produce substantial JSON responses. Leaving word-level diffs disabled by default (`includeWordDiff: false`) and enforcing `maxChars` and entry limits prevented context window saturation, allowing all agents to process full section changes without truncation errors.
- **HTML reflow and block splitting create false change pairs.** In NVIDIA's diff, re-wrapping of bullet points across filing years caused several single sentences to be reported as added/removed fragments rather than paired edits. While the 0.5 Sørensen-Dice threshold avoided incorrect pairings, agents had to inspect the text to distinguish reflow noise from genuine disclosure edits.
- **Holding-company ticker reassignments require explicit fallback awareness.** `resolve_company` maps ticker `XOM` to its current legal registrant (`ExxonMobil Holdings Corp`), which has 0 periodic filings. While agents can detect empty results and fall back to searching by name or CIK, the tool could provide explicit guidance or alternate entity candidates when a ticker resolves to an entity with zero recent periodic filings.
- **Tool instructions and honest error shapes suppress hallucination.** Every harness adhered to the prompt instructions and the server's MCP `instructions` (quoting verbatim and placing citations next to text). When GE returned `status: "not_found"` with `availableItems: []`, no model attempted to invent risk factors. Structured error schemas with diagnostic context reliably guide agent behaviour.

### Lessons about testing agent harnesses

Two harness bugs were uncovered and resolved during the exercise:

1. **Initial grader check over-strictness.** The first grader failed honest `not_found` answers (such as GE) if the model included the filing URL to show what document it inspected, because the grader assumed any SEC URL implied a cited section quotation. It also failed "nothing changed" answers (such as Berkshire and JPMorgan) if the model asserted identity without repeating the `+0 -0 ~0` counts. Grader checks were made fairer by decoupling document provenance URLs from section quotes and accepting explicit declarations of unchanged status.
2. **Standard input leakage in harness scripts.** When running through scenarios in bash (`while read ...`), the child CLI processes inherited standard input. Claude Code, which appends piped stdin to its prompt, ingested the scenario list and attempted to answer all seven scenarios at once in a single prompt. This was resolved in commit `9744652` by reading the scenario list on a separate file descriptor (`3< "$SCENARIO_LIST"`) and explicitly redirecting child stdin from `/dev/null` (`< /dev/null`).

## 6. Limits

- **Grading is string-level:** Grader assertions check captured natural-language text using regular expressions and substring predicates. They verify accessions, CIKs, key counts, and distinctive phrases, but do not perform abstract semantic entailment or AST-level quote verification against EDGAR.
- **Single-run measurements:** Each harness was run once per scenario. Wall-clock times and minor phrasing variations represent single-sample runs rather than statistical averages.
- **Model mutability:** Upstream model weights, tool-calling heuristics, and provider system prompts evolve over time. These results record the behaviour of Claude Sonnet (the `sonnet` alias in Claude Code), GPT-5.6 (`gpt-5.6-sol`), and Gemini 3.8 Flash (`gemini-3.8-flash-high`) as tested on 2026-09-02.
