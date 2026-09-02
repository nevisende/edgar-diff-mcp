#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EdgarClient } from './edgar/client.js';
import { FileCache } from './edgar/cache.js';
import { FilingService } from './service.js';
import { buildServer } from './server.js';

const userAgent = process.env['EDGAR_USER_AGENT'] ?? '';
if (!/@/.test(userAgent)) {
  console.error('EDGAR_USER_AGENT must be set, e.g. "edgar-diff-mcp/0.1 you@example.com" (SEC fair-access policy).');
  process.exit(1);
}
const cacheDir = process.env['EDGAR_CACHE_DIR'];
const client = new EdgarClient({ userAgent, ...(cacheDir ? { cache: new FileCache(cacheDir) } : {}) });
const service = new FilingService(client);

const server = buildServer(client, service);
await server.connect(new StdioServerTransport());
console.error('edgar-diff-mcp ready on stdio (read-only).');
