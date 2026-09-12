import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
const databaseId = config.match(/^\s*database_id\s*=\s*"([^"]+)"/m)?.[1];

if (!databaseId || databaseId === '00000000-0000-0000-0000-000000000000') {
  console.error(
    'Deployment blocked: configure the production D1 database_id in wrangler.toml before deploying.',
  );
  process.exitCode = 1;
}
