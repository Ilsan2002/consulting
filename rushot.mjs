import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const b= await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
for (const [page,vp,tag] of [['index',{w:1440,h:900},'desk'],['services',{w:1440,h:1500},'desk'],['contact',{w:1440,h:1100},'desk'],['index',{w:390,h:844,dsf:2},'mob']]){
  const ctx=await b.newContext({ viewport:{width:vp.w,height:vp.h}, deviceScaleFactor:vp.dsf||1, reducedMotion:'reduce' });
  const p=await ctx.newPage();
  await p.goto(`http://localhost:8031/ru/${page}.html`,{waitUntil:'load'});
  await p.addStyleTag({content:'.rv{opacity:1!important;transform:none!important}'});
  await p.waitForTimeout(700); // let webfonts settle
  await p.screenshot({ path:`${OUT}/ru-${page}-${tag}.png`, fullPage: page!=='index'||tag==='mob' });
  if(page==='index'&&tag==='desk') await p.locator('header.hero').screenshot({ path:`${OUT}/ru-index-hero.png` });
  await ctx.close();
}
console.log('done'); await b.close();
