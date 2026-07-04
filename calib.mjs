/* Per-frame crop calibration: apply {scale, pos} to each sky frame and
   screenshot the hero at desktop + mobile so we can check the central
   palace/horizon land consistently across frames. */
import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';

// tune here — day is the reference framing (tightest); zoom the wider ones in.
const CFG = {
  'sky-day':    { scale: 1.00, pos: '50% 60%' },
  'sky-dawn':   { scale: 1.02, pos: '50% 60%' },
  'sky-sunset': { scale: 1.02, pos: '50% 60%' },
  'sky-night':  { scale: 1.12, pos: '50% 58%' },
  'sky-dusk':   { scale: 1.30, pos: '50% 54%' },
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function render(frame, vp, tag) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dsf || 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8031/', { waitUntil: 'load' });
  await p.waitForTimeout(350);
  await p.evaluate(({ cfg, target }) => {
    document.querySelectorAll('.sky-img').forEach(img => {
      img.style.transition = 'none';
      const c = cfg[img.id] || { scale: 1, pos: '50% 60%' };
      img.style.objectPosition = c.pos;
      img.style.transform = `scale(${c.scale})`;
      img.style.transformOrigin = 'center center';
      img.style.opacity = (img.id === 'sky-' + target) ? '1' : '0';
    });
  }, { cfg: CFG, target: frame });
  await p.waitForTimeout(120);
  await p.locator('header.hero').screenshot({ path: `${OUT}/cal-${tag}-${frame}.png` });
  await ctx.close();
}
for (const f of ['day', 'night', 'dusk', 'dawn', 'sunset']) await render(f, { w: 1920, h: 1080 }, 'desk');
for (const f of ['day', 'night', 'dusk']) await render(f, { w: 390, h: 844, dsf: 2 }, 'mob');
console.log('done');
await b.close();
