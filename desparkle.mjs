/* Remove the baked-in sparkle from day/night/dawn (1305x816) by clone-stamping
   the immediately-adjacent foliage over it. Sunset has no sparkle -> skipped.
   Exports sky-<name>-4.webp + an after-crop of the corner for verification. */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const OUT = '/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const IMGDIR = '/home/user/consulting/production-live-snapshot/assets/img';
const targets = ['day', 'night', 'dawn']; // sunset clean

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext()).newPage();
await p.goto('http://localhost:8031/', { waitUntil: 'load' });

const results = await p.evaluate(async (targets) => {
  function load(url){ return new Promise((res)=>{ const i=new Image(); i.onload=()=>res(i); i.src=url; }); }
  // sparkle box (1305x816 images); source = pure dark foliage below-left
  const DX=1140, DY=656, DW=92, DH=96;   // dst covers the sparkle + margin
  const SX=1044, SY=720;                  // clean trees, no plaza, no sparkle
  const out=[];
  for (const name of targets) {
    const img = await load(`assets/img/sky-${name}-3.webp`);
    const W=img.naturalWidth, H=img.naturalHeight;
    const c=document.createElement('canvas'); c.width=W; c.height=H;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
    const snap=document.createElement('canvas'); snap.width=W; snap.height=H; snap.getContext('2d').drawImage(c,0,0);
    // opaque core: fully replace the sparkle with clean foliage
    ctx.drawImage(snap, SX, SY, DW, DH, DX, DY, DW, DH);
    // feathered ring: blend a second foliage patch over the box edges to soften the seam
    const t=document.createElement('canvas'); t.width=DW; t.height=DH; const tc=t.getContext('2d');
    tc.drawImage(snap, SX-30, SY-24, DW, DH, 0, 0, DW, DH); // different foliage, breaks repeat
    tc.globalCompositeOperation='destination-in';
    const g=tc.createRadialGradient(DW/2,DH/2, Math.min(DW,DH)*0.30, DW/2,DH/2, Math.min(DW,DH)*0.52);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.9)');
    tc.fillStyle=g; tc.fillRect(0,0,DW,DH);
    ctx.drawImage(t, DX, DY);
    // after-crop of the corner
    const cx=Math.floor(W*0.80), cy=Math.floor(H*0.70), cw=W-cx, ch=H-cy;
    const cc=document.createElement('canvas'); cc.width=cw; cc.height=ch; cc.getContext('2d').drawImage(c,cx,cy,cw,ch,0,0,cw,ch);
    out.push({ name, W, H, after: cc.toDataURL('image/png'), webp: c.toDataURL('image/webp', 0.92) });
  }
  return out;
}, targets);

for (const r of results) {
  writeFileSync(`${OUT}/corner-${r.name}-after.png`, Buffer.from(r.after.split(',')[1],'base64'));
  writeFileSync(`${IMGDIR}/sky-${r.name}-4.webp`, Buffer.from(r.webp.split(',')[1],'base64'));
  console.log(`sky-${r.name}-4.webp written (${Math.round(Buffer.from(r.webp.split(',')[1],'base64').length/1024)}KB)`);
}
await b.close();
console.log('done');
