import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import type { KeyValueCache } from './client.js';

/** Tiny on-disk cache so repeated diffs don't re-hit EDGAR. Opt-in. */
export class FileCache implements KeyValueCache {
  constructor(private readonly dir: string) {}
  private path(key: string): string {
    return join(this.dir, createHash('sha1').update(key).digest('hex'));
  }
  async get(key: string): Promise<string | undefined> {
    try {
      return await readFile(this.path(key), 'utf8');
    } catch {
      return undefined;
    }
  }
  /** Write to a temp file and rename, so a crash never leaves a truncated filing that "parses" to nothing. */
  async set(key: string, value: string): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const final = this.path(key);
    const tmp = `${final}.${process.pid}.tmp`;
    await writeFile(tmp, value, 'utf8');
    await rename(tmp, final);
  }
}
