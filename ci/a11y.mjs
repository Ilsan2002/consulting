/* Accessibility gate — runs axe-core over every page in the settled state
   (reduced-motion so the motion layer bails to a clean static scan).
   Exits non-zero on any violation, so CI fails the build. */
import { chromium } from 'playwright';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core');

const pages = ['index', 'services', 'work', 'about', 'contact'];
let totalTypes = 0;
const b = await chromium.launch();
for (const name of pages) {
  const ctx = await b.newContext({ reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(`${process.cwd()}/${name}.html`).href, { waitUntil: 'load' });
  await p.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important;transition:none!important}' });
  await p.waitForTimeout(400);
  await p.addScriptTag({ path: axePath });
  const r = await p.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  const nodes = r.violations.reduce((a, v) => a + v.nodes.length, 0);
  console.log(`${name.padEnd(9)} — ${r.violations.length} violation type(s)${nodes ? `, ${nodes} node(s)` : ''}`);
  r.violations.forEach(v => console.log(`   [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.help}`));
  totalTypes += r.violations.length;
  await ctx.close();
}
await b.close();
if (totalTypes > 0) { console.error(`\n✗ ${totalTypes} axe violation type(s) — failing build`); process.exit(1); }
console.log('\n✓ axe clean on all pages');
