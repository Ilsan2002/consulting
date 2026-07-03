/* Settled-state axe + screenshots for the pixel-skyline site (production-live-snapshot). */
import { chromium } from 'playwright';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core');

const BASE = 'http://localhost:8031';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const pages = ['index', 'services', 'work', 'about', 'contact'];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let totalTypes = 0;

for (const name of pages) {
  const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 960 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(`${BASE}/${name}.html`, { waitUntil: 'load' });
  await p.addStyleTag({ content: '.rv{opacity:1!important;transform:none!important;transition:none!important}' });
  await p.waitForTimeout(500);

  // axe
  await p.addScriptTag({ path: axePath });
  const r = await p.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  const nodes = r.violations.reduce((a, v) => a + v.nodes.length, 0);
  console.log(`${name.padEnd(9)} — ${r.violations.length} violation type(s)${nodes ? `, ${nodes} node(s)` : ''}${errors.length ? ` · JS errors: ${errors.length}` : ''}`);
  r.violations.forEach(v => {
    console.log(`   [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.help}`);
    v.nodes.slice(0, 3).forEach(n => console.log(`      ${n.target.join(' ')}`));
  });
  errors.forEach(e => console.log(`   JS: ${e}`));
  totalTypes += r.violations.length;

  // screenshots: desktop full + mobile full
  await p.screenshot({ path: `${OUT}/${name}-desktop.png`, fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}-mobile.png`, fullPage: true });
  await ctx.close();
}
await b.close();
console.log(totalTypes === 0 ? '\n✓ axe clean on all 5 pages' : `\n✗ ${totalTypes} violation type(s)`);
