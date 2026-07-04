import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-consulting/ac66dcd0-2f8e-5728-949b-b85b4b17f86e/scratchpad/qa-shots';
const b= await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const ctx=await b.newContext({ viewport:{width:1440,height:1600}, reducedMotion:'reduce' });
const p=await ctx.newPage();
await p.goto('http://localhost:8031/work.html',{waitUntil:'load'});
await p.addStyleTag({content:'.rv{opacity:1!important;transform:none!important}'});
await p.waitForTimeout(400);
// screenshot the playbooks section
await p.locator('#playbooks').screenshot({ path:`${OUT}/work-order.png` });
console.log('done'); await b.close();
