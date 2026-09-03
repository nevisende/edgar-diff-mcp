# AGENTS.md

Short version of `CLAUDE.md` for any agent that does not read Claude-specific files.

1. Read `docs/DESIGN.md` first. The five rules there define correctness.
2. Read `docs/SCENARIOS.md` before changing scenario plans, harnesses, grading, or scenario-driven parser coverage.
3. Run `npm run check` before and after your change. Both must be green.
4. Parser or diff changes require a fixture-backed test in `tests/`.
5. Never add write capability, LLM calls, or heuristics that return a section you are not confident in.
6. Conventional commits. Do not push.
