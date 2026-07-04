/* Capture the homepage hero as the user sees it, at several real viewports,
   and force specific frames to check centering + inter-frame alignment. */
import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const viewports = [
  { w: 1920, h: 1080, tag: '1920x1080' },
  { w: 1536, h: 864,  tag: '1536x864'  },
  { w: 1366, h: 768,  tag: '1366x768'  },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function shoot(vp, frame) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8031/', { waitUntil: 'load' });
  await p.waitForTimeout(400);
  await p.evaluate((target) => {
    document.querySelectorAll('.sky-img').forEach(img => {
      img.style.transition = 'none';
      img.style.opacity = (img.id === 'sky-' + target) ? '1' : '0';
    });
  }, frame);
  await p.waitForTimeout(120);
  await p.screenshot({ path: `${OUT}/vp-${vp.tag}-${frame}.png` }); // viewport-only = the hero
  await ctx.close();
}
for (const vp of viewports) await shoot(vp, 'day');
await shoot({ w: 1920, h: 1080, tag: '1920x1080' }, 'night');
await shoot({ w: 1920, h: 1080, tag: '1920x1080' }, 'dusk');
console.log('done');
await b.close();
