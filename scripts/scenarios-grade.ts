import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { scenarios, type AnswerCheck } from '../scenarios/scenarios.js';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUTPUT_ROOT = `${REPO}/evals/scenarios`;
const HARNESSES = ['claude', 'codex', 'agy'] as const;
type Harness = (typeof HARNESSES)[number];

interface CheckResult {
  name: string;
  pass: boolean;
}

interface GradeResult {
  scenario: string;
  harness: Harness;
  pass: boolean;
  file: string;
  checks: CheckResult[];
  failedChecks: string[];
}

function answerSection(markdown: string): string | undefined {
  const marker = '## Answer\n';
  const start = markdown.indexOf(marker);
  if (start === -1) return undefined;
  const answer = markdown.slice(start + marker.length);
  const diagnostics = answer.indexOf('\n## Command diagnostics\n');
  return (diagnostics === -1 ? answer : answer.slice(0, diagnostics)).trim();
}

function evaluateCheck(answer: string, check: AnswerCheck): CheckResult {
  let matched: boolean;
  if (typeof check.predicate === 'function') {
    matched = check.predicate(answer);
  } else if (typeof check.predicate === 'string') {
    matched = answer.includes(check.predicate);
  } else {
    check.predicate.lastIndex = 0;
    matched = check.predicate.test(answer);
  }
  return { name: check.name, pass: check.negate ? !matched : matched };
}

async function gradeFile(harness: Harness, scenario: (typeof scenarios)[number]): Promise<GradeResult> {
  const relativeFile = `${harness}/${scenario.id}.md`;
  const checks: CheckResult[] = [];
  let markdown = '';
  try {
    markdown = await readFile(`${OUTPUT_ROOT}/${relativeFile}`, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      checks.push({ name: 'answer file exists', pass: false });
    } else {
      checks.push({ name: `answer file is readable: ${error instanceof Error ? error.message : String(error)}`, pass: false });
    }
  }

  if (markdown) {
    const exitCode = /^- Exit code: (\d+)$/m.exec(markdown)?.[1];
    checks.push({ name: 'harness exit code is zero', pass: exitCode === '0' });
    const answer = answerSection(markdown);
    checks.push({ name: 'answer section exists', pass: answer !== undefined });
    if (answer !== undefined) checks.push(...scenario.checks.map((check) => evaluateCheck(answer, check)));
  }

  const failedChecks = checks.filter((check) => !check.pass).map((check) => check.name);
  return {
    scenario: scenario.id,
    harness,
    pass: failedChecks.length === 0,
    file: relativeFile,
    checks,
    failedChecks,
  };
}

const grades = (
  await Promise.all(
    scenarios.flatMap((scenario) => HARNESSES.map((harness) => gradeFile(harness, scenario))),
  )
).sort((a, b) => scenarios.findIndex((scenario) => scenario.id === a.scenario) - scenarios.findIndex((scenario) => scenario.id === b.scenario)
  || HARNESSES.indexOf(a.harness) - HARNESSES.indexOf(b.harness));

const totals = Object.fromEntries(HARNESSES.map((harness) => {
  const harnessGrades = grades.filter((grade) => grade.harness === harness);
  return [harness, { passed: harnessGrades.filter((grade) => grade.pass).length, total: harnessGrades.length }];
})) as Record<Harness, { passed: number; total: number }>;
const generatedAt = new Date().toISOString();
const report = {
  kind: 'string-level scenario grading',
  generatedAt,
  harnesses: HARNESSES,
  totals,
  results: grades,
};

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function matrixCell(grade: GradeResult): string {
  return grade.pass ? 'PASS' : `FAIL: ${grade.failedChecks.join('; ')}`;
}

const matrixRows = scenarios.map((scenario) => {
  const cells = HARNESSES.map((harness) => {
    const grade = grades.find((entry) => entry.scenario === scenario.id && entry.harness === harness);
    return escapeCell(grade ? matrixCell(grade) : 'FAIL: internal missing grade');
  });
  return `| ${scenario.id} | ${cells.join(' | ')} |`;
});
const totalRows = HARNESSES.map((harness) => {
  const total = totals[harness];
  return `| ${harness} | ${total.passed}/${total.total} |`;
});
const markdown = `# Scenario harness report

Generated ${generatedAt}. **This is string-level grading only**: checks inspect the captured natural-language answer, not factual entailment or quote fidelity. Missing answer files and nonzero harness exits fail explicitly. The embedded prompt and command diagnostics are excluded from grading. Note that one Codex run (\`xom-holding-company\`) failed on a provider usage limit rather than on the task.

| Scenario | Claude | Codex | Agy |
|---|---|---|---|
${matrixRows.join('\n')}

## Per-harness totals

| Harness | Passed |
|---|---:|
${totalRows.join('\n')}
`;

await mkdir(OUTPUT_ROOT, { recursive: true });
await writeFile(`${OUTPUT_ROOT}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(`${OUTPUT_ROOT}/report.md`, markdown);

for (const harness of HARNESSES) {
  const total = totals[harness];
  console.log(`${harness}: ${total.passed}/${total.total}`);
}
