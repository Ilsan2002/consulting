import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const b= await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
for (const f of ['day','night']){
  const ctx=await b.newContext({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
  const p=await ctx.newPage();
  await p.goto('http://localhost:8031/',{waitUntil:'load'});
  await p.waitForTimeout(400);
  await p.evaluate((t)=>{document.querySelectorAll('.sky-img').forEach(i=>{i.style.transition='none';i.style.opacity=(i.id==='sky-'+t)?'1':'0';}); const a=document.querySelector('.agent'); if(a)a.style.visibility='hidden';},f);
  await p.waitForTimeout(120);
  await p.locator('header.hero').screenshot({ path:`${OUT}/final-${f}-nocard.png` });
  await ctx.close();
}
console.log('done'); await b.close();
