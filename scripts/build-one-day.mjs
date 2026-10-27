import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../dist/', import.meta.url);
const homepage = new URL('../index.html', import.meta.url);

// Export only the temporary page; the original site's files stay out of the deployment.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(homepage, new URL('index.html', output));
await copyFile(homepage, new URL('404.html', output));
await writeFile(new URL('robots.txt', output), 'User-agent: *\nDisallow: /\n');
await writeFile(new URL('_headers', output), `/*
  Cache-Control: no-store
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
`);
console.log(`Temporary contact page built in ${fileURLToPath(output)}`);
