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
3. **Measure on real filings, not on the fixture.** `npm run eval:live` fetches the two most recent 10-Ks (and some 10-Qs) for 30 issuers across the common filing-agent formats and counts how many of the 18 expected Items the parser locates. The first run said **81.8 %**. That number, and the list of what was missing, is what the fix lanes were briefed on.
4. **One failure class per lane, one commit per class, a fixture test that fails without the change.** Fused headings (GE, Intel, McDonald's put the heading and the first paragraph in one block). Combined headings ("Items 10, 11, 12, 13 and 14"). Repeated running headers that manufactured fake candidates (Microsoft's Item 1A diff was similarity 0.000 for that reason). Page footers leaking into diffs ("Apple Inc. | 2024 Form 10-K | 5"). After the fixes the corpus reads **89.9 %**, and the remaining gaps are documented in `docs/DESIGN.md` as things the parser refuses rather than guesses.
5. **A cold review.** When the work looked finished, a fresh agent with no memory of the session was asked to judge the repository as a sceptical CTO would: the code, the tests, the docs, the claims. Its findings, and what changed because of them, are in the last section of this file.
6. **Nothing pushed by an agent.** `CLAUDE.md` forbids it, `.claude/settings.json` denies `git push`, and every commit is authored by me.

## What the agents were bad at

- **Stopping.** The evaluation lane spent its last twenty minutes writing investigation subagents about one Pfizer Item instead of reporting. The brief now says what the final answer must contain and how long it may be.
- **Wrappers.** The first typed-output pass wrapped every union result in `{ result: … }` to satisfy the MCP rule that an output schema is an object. Correct, and ugly for the agent on the other end. It was redone flat.
- **Warnings as noise.** After the first parser pass, every Apple Item carried "heading appeared 2 times". True, harmless, and exactly the kind of message that trains a reader to ignore warnings. It was tightened to fire only when a rival body is real.
- **Quota.** One CLI hit its daily limit at 21:40. The lanes were independent enough that the work moved to another model without re-briefing.

## What I would keep doing

Write the rule, write the test, write the brief, read the diff. The agent writes the code. The evaluation on real data is the thing that made the difference between a demo and a tool; without it the parser would have shipped at 82 % and nobody would have known.

## Budget

Total agent spend for the project, all harnesses: roughly 0.9 million tokens in the Codex lanes alone (metered), plus the Antigravity and orchestrator sessions which are not metered the same way, over about five hours of wall-clock time. The orchestrator's job was to stay small.

## Cold review findings

_Pending: filled in after the review._
