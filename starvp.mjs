import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const b= await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const vps=[[1920,1080],[1440,900],[1366,768]];
for (const [w,h] of vps){
  const ctx=await b.newContext({ viewport:{width:w,height:h}, reducedMotion:'reduce' });
  const p=await ctx.newPage();
  await p.goto('http://localhost:8031/',{waitUntil:'load'});
  await p.waitForTimeout(400);
  await p.evaluate(()=>{document.querySelectorAll('.sky-img').forEach(i=>{i.style.transition='none';i.style.opacity=(i.id==='sky-day')?'1':'0';});});
  await p.waitForTimeout(120);
  // measure sparkle: brightest cluster in bottom-right quadrant of the rendered hero background
  const info = await p.evaluate(()=>{
    const rect = document.querySelector('.agent').getBoundingClientRect();
    return { card:{left:Math.round(rect.left),top:Math.round(rect.top),right:Math.round(rect.right),bottom:Math.round(rect.bottom)}, vw:innerWidth, vh:innerHeight };
  });
  console.log(`${w}x${h}: card L${info.card.left} T${info.card.top} R${info.card.right} B${info.card.bottom}`);
  await p.locator('header.hero').screenshot({ path:`${OUT}/svp-${w}x${h}-day.png` });
  await ctx.close();
}
console.log('done'); await b.close();
