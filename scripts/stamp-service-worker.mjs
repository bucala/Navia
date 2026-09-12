import { readFile, writeFile } from 'node:fs/promises';

const serviceWorker = new URL('../dist/sw.js', import.meta.url);
const source = await readFile(serviceWorker, 'utf8');
const buildId = (process.env.GITHUB_SHA ?? Date.now().toString(36)).slice(0, 16);

if (!source.includes('__NAVIA_BUILD_ID__')) {
  throw new Error('dist/sw.js is missing the build id placeholder');
}

await writeFile(serviceWorker, source.replaceAll('__NAVIA_BUILD_ID__', buildId));
