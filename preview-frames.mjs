/* Preview each sky frame in place on the homepage hero. */
import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const frames = ['night', 'dawn', 'day', 'sunset', 'dusk'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8031/', { waitUntil: 'load' });
await p.waitForTimeout(500);
for (const id of frames) {
  await p.evaluate((target) => {
    document.querySelectorAll('.sky-img').forEach(img => {
      img.style.transition = 'none';
      img.style.opacity = (img.id === 'sky-' + target) ? '1' : '0';
    });
  }, id);
  await p.waitForTimeout(150);
  await p.locator('.hero').screenshot({ path: `${OUT}/frame-${id}.png` });
  console.log(`frame-${id}.png written`);
}
console.log(errs.length ? 'JS ERRORS: ' + errs.join(' | ') : 'no JS errors');
await b.close();
