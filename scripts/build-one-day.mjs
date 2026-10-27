import { copyFile, cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../dist/', import.meta.url);
const homepage = new URL('../index.html', import.meta.url);
const original = new URL('../production-live-snapshot/', import.meta.url);

// Both custom domains share one Pages project. Keep the current English site and
// the original Russian pages available for the expiry; route only .us temporarily.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(original)) {
  if (entry === 'functions' || entry === '_routes.json') continue;
  await cp(new URL(entry, original), new URL(entry, output), { recursive: true });
}
await mkdir(new URL('_temporary/', output), { recursive: true });
await copyFile(homepage, new URL('_temporary/index.html', output));
await writeFile(new URL('_routes.json', output), JSON.stringify({
  version: 1,
  include: ['/*'],
  exclude: ['/assets/*'],
}, null, 2) + '\n');
console.log(`Temporary contact page built in ${fileURLToPath(output)}`);
