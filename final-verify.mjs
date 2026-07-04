/* Final check: frames rendered from the REAL stylesheet (opacity toggled only,
   so the per-frame transforms come from CSS). Homepage + a subpage, desk + mob. */
import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function shot(url, frame, vp, tag) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dsf || 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(350);
  await p.evaluate((t) => { document.querySelectorAll('.sky-img').forEach(i => { i.style.transition = 'none'; i.style.opacity = (i.id === 'sky-' + t) ? '1' : '0'; }); }, frame);
  await p.waitForTimeout(120);
  await p.locator('header.hero').screenshot({ path: `${OUT}/fin-${tag}-${frame}.png` });
  await ctx.close();
}
for (const f of ['day', 'night', 'dusk']) await shot('http://localhost:8031/', f, { w: 1920, h: 1080 }, 'home');
await shot('http://localhost:8031/', 'dusk', { w: 390, h: 844, dsf: 2 }, 'mob');
await shot('http://localhost:8031/services.html', 'day', { w: 1920, h: 1080 }, 'svc');
await shot('http://localhost:8031/services.html', 'dusk', { w: 390, h: 844, dsf: 2 }, 'svcmob');
console.log('done');
await b.close();
