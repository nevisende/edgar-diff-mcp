#!/usr/bin/env bash

set -u

REPO=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUTPUT_ROOT="$REPO/evals/scenarios"
TEMPLATE="$REPO/scenarios/claude-mcp.template.json"
CLAUDE_CONFIG="$OUTPUT_ROOT/claude-mcp.json"
PROMPT_PREFIX="Use only the edgar-diff MCP tools for facts. Quote only text returned by the tools and keep each quote's citation (accession, item, paragraph, url) next to it. If a tool returns not_found, say so plainly and do not infer the content."

usage() {
  printf 'Usage: %s <claude|codex|agy> [scenario-id]\n' "$0" >&2
}

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  usage
  exit 2
fi

HARNESS=$1
FILTER=${2:-}
case "$HARNESS" in
  claude) MODEL=sonnet ;;
  codex) MODEL='default (codex exec)' ;;
  agy) MODEL=gemini-3.8-flash-high ;;
  *)
    usage
    exit 2
    ;;
esac

mkdir -p "$OUTPUT_ROOT/$HARNESS"
REPO="$REPO" node -e '
  const fs = require("node:fs");
  const template = fs.readFileSync(process.argv[1], "utf8");
  fs.writeFileSync(process.argv[2], template.replaceAll("$REPO", process.env.REPO));
' "$TEMPLATE" "$CLAUDE_CONFIG"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/edgar-scenarios.XXXXXX")
SCENARIO_LIST="$TMP_DIR/scenarios.tsv"
ANSWER_TMP="$TMP_DIR/answer.txt"
COMMAND_LOG="$TMP_DIR/command.log"
TMPDIR_RUN=""
cleanup() {
  rm -f "$SCENARIO_LIST" "$ANSWER_TMP" "$COMMAND_LOG"
  [ -n "$TMPDIR_RUN" ] && rm -rf "$TMPDIR_RUN"
  rmdir "$TMP_DIR" 2>/dev/null || true
}
trap cleanup EXIT HUP INT TERM

cd "$REPO" || exit 1
npx --no-install tsx -e '
  import { scenarios } from "./scenarios/scenarios.ts";
  for (const scenario of scenarios) {
    console.log(`${scenario.id}\t${scenario.prompt.replace(/[\t\r\n]+/g, " ")}`);
  }
' > "$SCENARIO_LIST"
if [ "$?" -ne 0 ]; then
  printf 'Could not load scenario definitions.\n' >&2
  exit 1
fi

found=0
failures=0
while IFS=$'\t' read -r scenario_id scenario_prompt; do
  if [ -n "$FILTER" ] && [ "$scenario_id" != "$FILTER" ]; then
    continue
  fi
  found=$((found + 1))
  outfile="$OUTPUT_ROOT/$HARNESS/$scenario_id.md"
  full_prompt="$PROMPT_PREFIX

$scenario_prompt"
  : > "$ANSWER_TMP"
  : > "$COMMAND_LOG"
  started_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  started_seconds=$(date '+%s')

  TMPDIR_RUN=$(mktemp -d "${TMPDIR:-/tmp}/edgar-run.XXXXXX")

  case "$HARNESS" in
    claude)
      (
        cd "$TMPDIR_RUN" && claude -p --model sonnet --mcp-config "$CLAUDE_CONFIG" --strict-mcp-config --allowedTools "mcp__edgar-diff__*" --output-format text "$full_prompt"
      ) > "$ANSWER_TMP" 2> "$COMMAND_LOG"
      exit_code=$?
      ;;
    codex)
      codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C "$TMPDIR_RUN" --ephemeral -o "$ANSWER_TMP" "$full_prompt" < /dev/null > "$COMMAND_LOG" 2>&1
      exit_code=$?
      ;;
    agy)
      (
        cd "$TMPDIR_RUN" && agy -p "$full_prompt" --model gemini-3.8-flash-high --dangerously-skip-permissions --add-dir "$TMPDIR_RUN" --print-timeout 10m
      ) > "$ANSWER_TMP" 2> "$COMMAND_LOG"
      exit_code=$?
      ;;
  esac

  rm -rf "$TMPDIR_RUN"
  TMPDIR_RUN=""

  finished_seconds=$(date '+%s')
  wall_seconds=$((finished_seconds - started_seconds))
  {
    printf '# Scenario answer\n\n'
    printf -- '- Harness: %s\n' "$HARNESS"
    printf -- '- Model: %s\n' "$MODEL"
    printf -- '- Date: %s\n' "$started_at"
    printf -- '- Wall-clock seconds: %s\n' "$wall_seconds"
    printf -- '- Exit code: %s\n\n' "$exit_code"
    printf '## Prompt\n\n%s\n\n' "$scenario_prompt"
    printf '## Answer\n\n'
    if [ -s "$ANSWER_TMP" ]; then
      sed -e '${/^$/d;}' "$ANSWER_TMP"
      printf '\n'
    else
      printf '_No answer was produced._\n'
    fi
    if [ "$exit_code" -ne 0 ] && [ -s "$COMMAND_LOG" ]; then
      printf '\n## Command diagnostics\n\n```text\n'
      sed -e '${/^$/d;}' "$COMMAND_LOG"
      printf '\n```\n'
    fi
  } > "$outfile"

  printf '[%s] %s (%ss, exit %s)\n' "$HARNESS" "$scenario_id" "$wall_seconds" "$exit_code" >&2
  if [ "$exit_code" -ne 0 ]; then
    failures=$((failures + 1))
  fi
done < "$SCENARIO_LIST"

if [ "$found" -eq 0 ]; then
  printf 'Unknown scenario id: %s\n' "$FILTER" >&2
  exit 2
fi
if [ "$failures" -ne 0 ]; then
  printf '%s of %s harness commands failed; all requested scenarios were attempted.\n' "$failures" "$found" >&2
  exit 1
fi
