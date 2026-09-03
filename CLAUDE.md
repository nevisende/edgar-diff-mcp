# CLAUDE.md — working agreement for agents on this repo

You are working on a **read-only** MCP server. The five rules in `docs/DESIGN.md` are not
suggestions; a PR that weakens any of them is wrong even if it is green.

## Non-negotiables
- **No writes.** Do not add tools or code paths that mutate anything beyond `EDGAR_CACHE_DIR`.
- **No LLM calls inside the server.** The server returns filing text; reasoning happens in the client.
- **No guessed sections.** If a parse is uncertain, return `not_found` + `availableItems`, or add to `warnings[]`. Never return a stub as if it were the section.
- **Every returned paragraph carries a citation.** If you add an output shape, it carries one too.
- **Tests before behaviour.** Every change to `sections.ts` or `diff/sections.ts` comes with a fixture-backed test that fails without the change.

## Commands
- `npm run check` — typecheck + tests. Must pass before you stop.
- `npm run demo` — offline diff of the bundled fixtures. Use it to eyeball formatting changes.
- `npm run smoke:live -- <TICKER> [ITEM]` — real EDGAR. Needs `EDGAR_USER_AGENT` with an email. Do not run in CI.
- `npm run eval:live` — measure the 30-issuer corpus; uses the network and requires `EDGAR_USER_AGENT` with an email.
- `npm run scenarios:mcp` — build and run the deterministic MCP scenario layer; uses the network and benefits from `EDGAR_CACHE_DIR`.
- `scripts/scenarios-harness.sh <claude|codex|agy> [id]` — run one or all agent scenarios; uses the network, the selected CLI/provider, and their quota.
- `npm run scenarios:grade` — grade the captured harness answers; offline once those answer files exist.
- `npm run examples` — regenerate real MCP and CLI output in `examples/`; refreshes live EDGAR indexes and requires `EDGAR_USER_AGENT` with an email.

## Conventions
- TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` — keep them on. Use `?? ''` / explicit guards instead of `!` where the value can genuinely be missing.
- Zod schemas describe every tool input; the description text is what the agent reads — write it for the agent.
- Tests colocate by concern in `tests/`; fixtures are synthetic and documented in `tests/fixtures/README.md`. Never add a real issuer's filing as a fixture.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`). One logical change per commit.
- Do not push, publish, or tag unless explicitly asked.

## When you are unsure
Say so in the PR description and leave the behaviour as `not_found` rather than inventing a heuristic. A false negative here costs a re-query; a false positive costs someone's trust in the number.
