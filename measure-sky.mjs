/* Measure the horizon line of each sky painting (row of steepest sky→land
   luminance drop) so we can align them with per-frame object-position. */
import { chromium } from 'playwright';
const base = 'http://localhost:8031/assets/img/';
const files = ['sky-night','sky-dawn','sky-day','sky-sunset','sky-dusk'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext()).newPage();
await p.goto('http://localhost:8031/', { waitUntil: 'load' });
const results = {};
for (const f of files) {
  const r = await p.evaluate(async (url) => {
    const img = new Image(); img.src = url; await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, W, H).data;
    // row-average luminance
    const rows = new Float64Array(H);
    for (let y = 0; y < H; y++) {
      let s = 0;
      for (let x = 0; x < W; x += 4) { // sample every 4px
        const i = (y * W + x) * 4;
        s += 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
      }
      rows[y] = s / (W/4);
    }
    // smooth
    const sm = new Float64Array(H); const k = 6;
    for (let y = 0; y < H; y++) { let s=0,n=0; for (let j=-k;j<=k;j++){const yy=y+j; if(yy>=0&&yy<H){s+=rows[yy];n++;}} sm[y]=s/n; }
    // steepest drop (sky brighter than land) within band [15%,70%]
    let bestY = -1, bestDrop = -1e9;
    const y0 = Math.floor(H*0.15), y1 = Math.floor(H*0.70);
    for (let y = y0; y < y1; y++) {
      const drop = sm[y-4] - sm[y+4]; // positive = getting darker downward
      if (drop > bestDrop) { bestDrop = drop; bestY = y; }
    }
    return { W, H, horizonY: bestY, horizonFrac: +(bestY/H).toFixed(4), drop: +bestDrop.toFixed(1) };
  }, base + f + '.webp?v=2');
  results[f] = r;
  console.log(`${f.padEnd(11)} ${JSON.stringify(r)}`);
}
// Given the full hero at reference viewports, compute object-position-y to
// land every horizon at the same screen fraction as the DAY frame currently.
function objPosY(fH, W, H, vpW, vpH) {
  const s = Math.max(vpW/W, vpH/H);
  const oy = H*s - vpH; if (oy <= 0) return 50;
  // we want screen_y = fH*H*s - py*oy to equal a target; solve later per target
  return { s, oy, hpx: fH*H*s };
}
const ref = { vpW: 1920, vpH: 1080 };
const day = results['sky-day'];
const dbits = objPosY(day.horizonFrac, day.W, day.H, ref.vpW, ref.vpH);
// current day uses py=0.62 → its horizon screen y:
const dayScreenY = dbits.hpx - 0.62*dbits.oy;
console.log(`\nDAY horizon screen-Y at ${ref.vpW}x${ref.vpH}, py=62% => ${dayScreenY.toFixed(0)}px (${(dayScreenY/ref.vpH*100).toFixed(1)}%)`);
console.log('\nPer-frame object-position-y to match DAY horizon at 1920x1080:');
for (const f of files) {
  const r = results[f];
  const bits = objPosY(r.horizonFrac, r.W, r.H, ref.vpW, ref.vpH);
  const py = (bits.hpx - dayScreenY) / bits.oy; // fraction
  const clamped = Math.max(0, Math.min(1, py));
  console.log(`  #${f}: object-position:50% ${(clamped*100).toFixed(0)}%   (raw ${(py*100).toFixed(0)}%, horizonFrac ${r.horizonFrac})`);
}
await b.close();
