const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../dist/hero.js'), 'utf8');

function events(target = {}) {
  const handlers = new Map();
  target.addEventListener = (type, fn) => {
    if (!handlers.has(type)) handlers.set(type, []);
    handlers.get(type).push(fn);
  };
  target.emit = (type, values = {}) => {
    const event = {cancelable:true, defaultPrevented:false, target:{closest:()=>null},
      preventDefault(){this.defaultPrevented=true;}, ...values};
    for (const fn of [...(handlers.get(type) || [])]) fn(event);
    return event;
  };
  return target;
}
function element() {
  const classes = new Set();
  return events({style:{},dataset:{},children:[],inert:false,
    setAttribute(){}, getBoundingClientRect:()=>({left:420,top:190,width:600,height:600}),
    classList:{toggle(c,on){if(on)classes.add(c);else classes.delete(c);},remove(c){classes.delete(c);},contains(c){return classes.has(c);}}});
}
async function scene({reduced=false,webgl=true,imageFailure=false,withIntro=false}={}) {
  let now=0, next=0, canvas, observer;
  const frames=new Map(), uniforms=new Map(), warnings=[], observers=new Map(), entrances=[];
  const gl=new Proxy({}, {get:(_,name)=>{
    if(name==='getShaderParameter'||name==='getProgramParameter')return()=>true;
    if(name==='getUniformLocation')return(_,key)=>key;
    if(name==='uniform1f')return(key,value)=>uniforms.set(key,value);
    if(String(name).startsWith('create'))return()=>({});
    return()=>{};
  }});
  const hero=element();hero.offsetHeight=1000;
  const stage=element();Object.assign(stage,{clientWidth:1440,clientHeight:1000,insertBefore(){}});
  stage.getBoundingClientRect=()=>({left:0,top:0});
  const nodes={'.hero':hero,'.hero-stage':stage,'.hero-art':element(),'.hero-slogan':element(),'.intro-label':element(),'.scroll-cue':element(),'.hero-caption':element()};
  nodes['.hero-slogan'].children=[element(),element()];
  if(withIntro){
    const intro=element();intro.contains=()=>false;
    intro.querySelector=()=>({children:Array.from({length:3},()=>({animate(){const animation={cancelled:false,cancel(){this.cancelled=true;}};entrances.push(animation);return animation;}}))});
    nodes['.intro-section']=intro;
  }
  const media=events({matches:reduced});
  const document=events({hidden:false,querySelector:s=>nodes[s]||null,
    createElement(){canvas=element();canvas.getContext=()=>webgl?gl:null;return canvas;}});
  const context=events({document,matchMedia:()=>media,performance:{now:()=>now},
    console:{warn:(...args)=>warnings.push(args)},devicePixelRatio:1,innerWidth:1440,innerHeight:1000,scrollY:0,
    requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
    Image:class{set src(value){queueMicrotask(()=>imageFailure?this.onerror(new Error('Missing image')):this.onload());}},
    IntersectionObserver:class{constructor(fn){this.callback=fn;observer=fn;}observe(target){observers.set(target,this.callback);}disconnect(){}},location:{reload(){}}});
  vm.runInNewContext(source,context);
  await new Promise(setImmediate);
  return {context,document,media,nodes,uniforms,warnings,frames,entrances,get canvas(){return canvas;},
    frame(ms=16.67){now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));},
    advance(ms){for(let t=0;t<ms;t+=16.67)this.frame();},
    wheel(deltaY,extra={}){return context.emit('wheel',{deltaY,deltaX:0,deltaMode:0,...extra});},
    motion(matches){media.matches=matches;media.emit('change');},
    intersect(value){observer([{isIntersecting:value}]);},
    enterIntro(){observers.get(nodes['.intro-section'])([{isIntersecting:true}]);}};
}

test('forward flight finishes, then allows normal page scrolling',async()=>{
  const s=await scene();s.frame();assert.equal(s.canvas.dataset.progress,'0.000');
  assert.equal(s.wheel(220).defaultPrevented,true);s.advance(3400);
  assert.equal(s.canvas.dataset.progress,'1.000');assert.equal(s.nodes['.hero-slogan'].style.opacity,1);
  assert.equal(s.wheel(120).defaultPrevented,false);
});
test('reversing during the flight returns to the illustration',async()=>{
  const s=await scene();s.frame();s.wheel(220);s.advance(700);
  assert.ok(+s.canvas.dataset.progress>.22);s.wheel(-100);s.advance(3400);
  assert.equal(s.canvas.dataset.progress,'0.000');assert.equal(s.nodes['.intro-label'].style.opacity,1);
});
test('paused artwork becomes sharp and flying blur stays bounded',async()=>{
  const s=await scene();s.frame();s.wheel(100);s.advance(700);
  assert.ok(s.uniforms.get('uBlur')<.001);
  s.wheel(120);for(let i=0;i<100;i++){s.frame();assert.ok(s.uniforms.get('uBlur')<=.65);}
});
test('horizontal gestures, pinch zoom, and non-cancelable events remain native',async()=>{
  const s=await scene();s.frame();
  for(const event of [{deltaX:250},{ctrlKey:true},{cancelable:false}])assert.equal(s.wheel(100,event).defaultPrevented,false);
  s.frame();assert.equal(s.canvas.dataset.progress,'0.000');
});
test('reduced motion starts static and can enable animation without reloading',async()=>{
  const s=await scene({reduced:true});assert.equal(s.canvas,undefined);
  s.motion(false);await new Promise(setImmediate);s.frame();
  assert.equal(s.nodes['.hero-stage'].classList.contains('depth-scene-ready'),true);
  const firstCanvas=s.canvas;s.motion(true);s.motion(false);s.frame();assert.equal(s.canvas,firstCanvas);
});
test('changing to reduced motion cancels the flight and restores the static labels',async()=>{
  const s=await scene();s.frame();s.wheel(220);s.advance(300);s.motion(true);
  assert.equal(s.frames.size,0);assert.equal(s.nodes['.hero-stage'].classList.contains('depth-scene-ready'),false);
  assert.equal(s.nodes['.intro-label'].style.opacity,'');assert.equal(s.nodes['.scroll-cue'].inert,false);
  assert.equal(s.nodes['.hero-caption'].style.opacity,'');s.motion(false);s.frame();
  assert.equal(s.canvas.dataset.progress,'0.000');
});
test('hidden tabs and offscreen heroes stop rendering, then resume',async()=>{
  const s=await scene();s.frame();s.document.hidden=true;s.document.emit('visibilitychange');assert.equal(s.frames.size,0);
  s.document.hidden=false;s.document.emit('visibilitychange');assert.equal(s.frames.size,1);
  s.intersect(false);assert.equal(s.frames.size,0);s.intersect(true);assert.equal(s.frames.size,1);
});
test('open navigation and links do not trap users in the animation',async()=>{
  const s=await scene();s.frame();s.nodes['dialog[open]']={};assert.equal(s.wheel(220).defaultPrevented,false);
  delete s.nodes['dialog[open]'];
  s.document.emit('click',{target:{closest:()=>({getAttribute:()=> '#intro'})}});s.frame();assert.equal(s.canvas.dataset.progress,'1.000');
  s.document.emit('click',{target:{closest:()=>({getAttribute:()=> '#top'})}});s.frame();assert.equal(s.canvas.dataset.progress,'0.000');
});
test('touch input advances vertically and leaves horizontal swipes alone',async()=>{
  const s=await scene();s.frame();s.context.emit('touchstart',{touches:[{clientX:200,clientY:600}]});
  assert.equal(s.context.emit('touchmove',{touches:[{clientX:300,clientY:590}]}).defaultPrevented,false);
  assert.equal(s.context.emit('touchmove',{touches:[{clientX:200,clientY:350}]}).defaultPrevented,true);
  s.advance(3400);assert.equal(s.canvas.dataset.progress,'1.000');
});
test('missing WebGL or textures preserves static artwork and native scrolling',async()=>{
  for(const options of [{webgl:false},{imageFailure:true}]){
    const s=await scene(options);assert.equal(s.nodes['.hero-stage'].classList.contains('depth-scene-ready'),false);
    assert.equal(s.wheel(220).defaultPrevented,false);assert.equal(s.frames.size,0);
  }
});

// Gestures must never skip directly to a different plane before the next frame.
test('large scroll impulses start from the displayed composition without a jump',async()=>{
  const s=await scene();s.frame();s.wheel(900);s.frame();
  assert.ok(+s.canvas.dataset.progress<.03);
  const visits=[];
  for(let i=0;i<210;i++){
    s.frame();const current=s.canvas.dataset.stage;
    if(visits.at(-1)!==current)visits.push(current);
  }
  assert.deepEqual(visits,['kurmanjan','city','hills','mountains','message']);
});
test('the next section takes over without leaving the scroll cue over its text',async()=>{
  const s=await scene();s.frame();s.wheel(220);s.advance(3400);
  s.context.scrollY=500;s.context.emit('scroll');s.frame();
  assert.equal(s.nodes['.hero-stage'].style.transform,'translate3d(0,500px,0)');
  assert.ok(s.nodes['.hero-slogan'].style.opacity>0);
  assert.ok(s.nodes['.hero-slogan'].style.opacity<1);
  assert.equal(s.nodes['.scroll-cue'].inert,true);
  s.motion(true);assert.equal(s.nodes['.hero-stage'].style.transform,'');
});
test('a background tab resumes the flight instead of skipping to the end',async()=>{
  const s=await scene();s.frame();s.wheel(220);s.advance(500);
  const before=+s.canvas.dataset.progress;
  s.document.hidden=true;s.document.emit('visibilitychange');s.advance(8000);
  s.document.hidden=false;s.document.emit('visibilitychange');s.frame();
  assert.ok(+s.canvas.dataset.progress-before<.02);
  s.advance(3400);assert.equal(s.canvas.dataset.progress,'1.000');
});

test('copy enters once and immediately settles when reduced motion is enabled',async()=>{
  const s=await scene({withIntro:true});s.frame();s.enterIntro();
  assert.equal(s.entrances.length,3);s.enterIntro();assert.equal(s.entrances.length,3);
  s.motion(true);assert.ok(s.entrances.every(animation=>animation.cancelled));
});
