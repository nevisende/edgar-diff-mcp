# AGENTS.md

Short version of `CLAUDE.md` for any agent that does not read Claude-specific files.

1. Read `docs/DESIGN.md` first. The five rules there define correctness.
2. Run `npm run check` before and after your change. Both must be green.
3. Parser or diff changes require a fixture-backed test in `tests/`.
4. Never add write capability, LLM calls, or heuristics that return a section you are not confident in.
5. Conventional commits. Do not push.
