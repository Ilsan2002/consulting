import { chromium } from 'playwright';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core');
const pages = ['index','services','work','about','contact'];
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
let total=0;
for (const name of pages) {
  const ctx = await b.newContext({ reducedMotion:'reduce' });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:8031/ru/${name}.html`, { waitUntil:'load' });
  await p.addStyleTag({ content: '.rv{opacity:1!important;transform:none!important;transition:none!important}' });
  await p.waitForTimeout(500);
  await p.addScriptTag({ path: axePath });
  const r = await p.evaluate(async () => await window.axe.run(document, { resultTypes:['violations'] }));
  const nodes = r.violations.reduce((a,v)=>a+v.nodes.length,0);
  console.log(`ru/${name.padEnd(9)} — ${r.violations.length} violation type(s)${nodes?`, ${nodes} node(s)`:''}`);
  r.violations.forEach(v=>console.log(`   [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.help}`));
  total+=r.violations.length; await ctx.close();
}
console.log(total===0?'\n✓ axe clean on all 5 RU pages':`\n✗ ${total} violation type(s)`);
await b.close();
