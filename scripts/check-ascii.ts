import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function filesMatching(directory: string, suffix: string): Promise<string[]> {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => join(directory, entry.name));
}

const files = [...new Set([
  ...await filesBelow('src'),
  ...await filesBelow('scripts'),
  ...await filesBelow('scenarios'),
  ...await filesMatching('tests', '.ts'),
  ...await filesMatching('docs', '.md'),
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'examples/README.md',
  'evals/latest.md',
  'evals/scenarios/mcp-client.md',
  'evals/scenarios/report.md',
  'package.json',
])].sort();

let failures = 0;
for (const file of files) {
  const contents = await readFile(join(root, file), 'utf8');
  let line = 1;
  let column = 1;
  for (const character of contents) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint > 0x7f) {
      const label = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
      console.error(`${relative(root, join(root, file))}:${line}:${column}: non-ASCII ${label}`);
      failures++;
    }
    if (character === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
}

if (failures > 0) {
  console.error(`ASCII check failed with ${failures} non-ASCII character${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}

console.log(`ASCII check passed for ${files.length} files.`);
