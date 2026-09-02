# How this was built

This repository was written almost entirely by coding agents, in about a day and a half of wall-clock time, with me acting as the engineer who decides what "correct" means and checks that it is. I am writing this down because the process is the part I would want to read if I were evaluating the code.

## The division of labour

| Who | What |
|---|---|
| Me | The five rules in `docs/DESIGN.md`, the fixture with a known diff, the expected-Item list the evaluation checks against, every brief below, every review, every merge. |
| Claude Code (Fable 5.1) | Orchestrator: read the company research, chose the project, designed the architecture and the lanes, wrote the briefs, reviewed diffs, merged, and wrote the docs. Never typed the parser. |
| Codex (GPT-5.6) | Five implementation lanes: `diff_all_items`, typed tool outputs, the three parser fixes, the polish pass, the corpus refresh. |
| Antigravity CLI (Claude Opus 4.6) | The live-corpus evaluation harness and the first failure-class investigation. Ran out of quota mid-night; Codex took over its remaining lane. |
| Antigravity CLI (Claude Sonnet 4.6) | The CI workflow. A twenty-second job for a model that costs a fraction of the others. |

Each lane ran in its own git worktree on its own branch with a written brief. Briefs said what to read first, what not to touch (`README.md`, another lane's files), what test had to exist before the behaviour, and what the final report had to contain in under N lines. That last rule matters more than it sounds: a report I can read in thirty seconds is the difference between reviewing five lanes a night and two.

## The loop

1. **Rules before code.** `docs/DESIGN.md` was written first. Read-only, verbatim, cited, no data = no answer, honest degradation. Every brief points at it and says a green PR that weakens a rule is wrong.
2. **A fixture with a known answer.** Two synthetic 10-Ks with exactly one added, one removed and one changed paragraph, plus the parser traps built in (a table of contents, a sentence that mentions "Item 7", a placeholder "None."). The first test asserts exactly that diff. Everything else was allowed to be written by an agent because that test existed.
3. **Measure on real filings, not on the fixture.** `npm run eval:live` fetches the two most recent 10-Ks (and some 10-Qs) for 30 issuers across the common filing-agent formats and counts how many of the 18 base expected Items, plus Item 1C for filings dated on or after 2023-12-15, the parser locates. The first run said **81.8 % recall**. That number, and the list of what was missing, is what the fix lanes were briefed on.
4. **One failure class per lane, one commit per class, a fixture test that fails without the change.** Fused headings (GE, Intel, McDonald's put the heading and the first paragraph in one block). Combined headings ("Items 10, 11, 12, 13 and 14"). Repeated running headers that manufactured fake candidates (Microsoft's Item 1A diff was similarity 0.000 for that reason). Page footers leaking into diffs ("Apple Inc. | 2024 Form 10-K | 5"). After the fixes the current corpus measures **89.9% located recall (1048/1166)** and **88.2% plausible (1028/1166)**, and the remaining gaps are documented in `docs/DESIGN.md` as things the parser refuses rather than guesses.
5. **A cold review.** When the work looked finished, a fresh agent with no memory of the session was asked to judge the repository as a sceptical CTO would: the code, the tests, the docs, the claims. Its findings, and what changed because of them, are in the last section of this file.
6. **Nothing pushed by an agent.** `CLAUDE.md` forbids it, `.claude/settings.json` denies `git push`, and every commit is authored by me.

## What the agents were bad at

- **Stopping.** The evaluation lane spent its last twenty minutes writing investigation subagents about one Pfizer Item instead of reporting. The brief now says what the final answer must contain and how long it may be.
- **Wrappers.** The first typed-output pass wrapped every union result in `{ result: … }` to satisfy the MCP rule that an output schema is an object. Correct, and ugly for the agent on the other end. It was redone flat.
- **Warnings as noise.** After the first parser pass, every Apple Item carried "heading appeared 2 times". True, harmless, and exactly the kind of message that trains a reader to ignore warnings. It was tightened so losing TOC stubs and heading-only labels no longer trigger it; the latest evaluation still shows `dup-heading` flags where substantive rival bodies remain.
- **Quota.** One CLI hit its daily limit at 21:40. The lanes were independent enough that the work moved to another model without re-briefing.

## What I would keep doing

Write the rule, write the test, write the brief, read the diff. The agent writes the code. The evaluation on real data is the thing that made the difference between a demo and a tool; without it the parser would have shipped at 82 % and nobody would have known.

## Budget

Total agent spend for the project, all harnesses: the Codex lanes metered at roughly 1.5 million tokens in total across eleven lanes, plus the Antigravity and orchestrator sessions which are not metered the same way, over about a day and a half of wall-clock time. The orchestrator's job was to stay small.

## Cold review findings

Two reviewers with no memory of the build looked at the published repository: a fresh Claude (Fable 5.1) session briefed to act as a sceptical CTO, and a Codex session briefed to find real problems only. Together they produced 28 findings. The ones that mattered, and what changed:

- **The diff normalised away signs and parentheses.** `(1,234)` and `1,234` compared as unchanged. Both reviewers found it; it is the worst possible bug for a financial diff. Unchanged is now decided on a conservative normalisation that keeps digits, signs, parentheses, percent and currency symbols; the aggressive normalisation is used only to pair candidates.
- **The headline number was recall dressed as precision.** "Found" meant "a key exists", so a 314-character Item 8 counted. The evaluation now reports two numbers, located and plausible-size, calls the metric recall, counts unexpected keys, and fails loudly when an issuer yields fewer than two 10-Ks. The expected-Item lists were also incomplete (Item 9, 10-Q Items 3 to 5), which had produced 69 fake false positives.
- **Prolific filers were invisible.** The client read only the first page of EDGAR's submissions index, so Exxon had zero 10-Ks and JPMorgan one. It now follows the paginated index, with a request timeout and a bounded retry.
- **A 10-Q diff could silently compare Part I with Part II.** An unqualified "1" resolved to `I.1` on one side and `II.1` on the other and still returned `ok`. It now refuses and names both keys.
- **Tool output was too large for the client.** Apple's Item 1A diff was about 480 KB across the text and structured channels. Output is now compact JSON, word-level edits are opt-in, there is a character budget with honest `truncated`, and `offset` paging.
- **Smaller parser gaps:** `PART II, ITEM 1A` on one line; titled running headers fragmenting Berkshire's MD&A into twenty pieces (9 paragraphs returned, 1,289 after the fix); fused headings shorter than the length threshold; three short real Items in a row mistaken for a table of contents; combined headings shipping empty titles; a duplicate-heading warning that still fired on Item 16.
- **Docs drift:** three different build durations across files, a placeholder left in this document, "precision" in one table and "rate" in another. Fixed by a final consistency pass.

Not changed, on purpose: standalone one-to-three-digit lines are still dropped as page numbers (a one-cell numeric table row would vanish; documented in `docs/DESIGN.md`), the flat output schemas keep every variant field optional with a description of when it appears rather than an `anyOf` the MCP schema type does not allow at the root, and the regex search rejects nested quantifiers instead of switching to a non-backtracking engine.
