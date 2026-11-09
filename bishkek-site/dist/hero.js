(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const slogan = document.querySelector('.hero-slogan');
  const introCopy = document.querySelector('.intro-label');
  const scrollCue = document.querySelector('.scroll-cue');
  const caption = document.querySelector('.hero-caption');
  const intro = document.querySelector('.intro-section');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // The HTML illustration and all navigation remain usable without animation.
  if (!hero || !stage || !slogan) return;
  let initialized = false;
  function initializeAnimation() {
  if (initialized || reducedMotion.matches) return;
  initialized = true;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = value => value * value * (3 - 2 * value);
  const cream = '#e1d9c7', burgundy = '#490314';
  const svg = (body, width, height) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="${burgundy}" stroke="${cream}" stroke-width="5" stroke-linejoin="miter">${body}</svg>`);
  const ring = svg('<circle cx="420" cy="420" r="413" fill="none" stroke-width="10"/>',840,840);
  const cover = svg(`<circle cx="71" cy="71" r="71" fill="${burgundy}" stroke="none"/>`,142,142);

  // Fixed camera and vanishing point, as in the reference. Each art plane
  // advances along the same camera path. Spacing gives the foreground, city,
  // hills and mountains separate passes, while depth compensation preserves
  // the approved composition at rest. No sideways drift or changing scale pivot.
  const layers = [
    {name:'mountains',src:'./assets/intro-mountains-v3.png',rect:[-140,295,1280,427],depth:2.25,speed:1,duotone:true,fade:[.865,.945]},
    {name:'hills',src:'./assets/intro-hills-v3.png',rect:[-140,475,1280,205],uv:[0,.4,1,.48],depth:1.8,speed:1,duotone:true,fade:[.82,.865]},
    {name:'city',src:'./assets/intro-bishkek-landmarks-v5.png',rect:[-60,0,1000,1000],depth:1.2,speed:1,duotone:true},
    {name:'sun-rays',src:'./assets/rays.png',rect:[-204,-106,1451,560],depth:.25,speed:1,rays:true},
    {name:'kurmanjan',src:'./assets/kurmanjan.png',rect:[105,195,690,746],depth:.25,speed:1},
    {name:'sun-backing',src:cover,rect:[656,193,142,142],depth:.25,speed:1},
    {name:'original-sun',src:'./assets/sun-source.png',rect:[661,196,134,127],uv:[680/845,0,165/845,157/906],depth:.25,speed:1},
    {name:'outer-frame',src:ring,rect:[80,80,840,840],depth:0,speed:1,unmasked:true,slowRotation:true}
  ];

  const canvas = document.createElement('canvas');
  canvas.className = 'depth-scene';
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.layers = layers.length;
  stage.insertBefore(canvas, document.querySelector('.hero-art'));
  const gl = canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'});
  if (!gl) return;

  const vertex = `
    attribute vec2 aPosition;
    attribute vec2 aUV;
    uniform vec2 uOrigin, uSize;
    uniform mediump vec2 uCenter;
    uniform vec4 uUV;
    uniform float uDepth, uTravel, uLogoScale, uRotation, uAspect;
    varying vec2 vUV;
    void main(){
      vec2 xy=(uOrigin+aPosition*uSize)*(3.0+uDepth)/3.0*uLogoScale;
      float z=-uDepth+uTravel;
      float c=cos(uRotation),s=sin(uRotation);
      vec3 world=vec3(xy.x*c+z*s,xy.y,-xy.x*s+z*c);
      float cameraZ=world.z-3.0;
      float f=1.3032253728;
      gl_Position=vec4(world.x*f/uAspect,world.y*f,-1.000500125*cameraZ-1.000250063,-cameraZ);
      gl_Position.xy+=(uCenter*2.0-1.0)*gl_Position.w;
      vUV=uUV.xy+aUV*uUV.zw;
    }`;
  const fragment = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform mediump vec2 uCenter;
    uniform float uOpacity,uDuotone,uMask,uRays,uTime;
    varying vec2 vUV;
    void main(){
      vec4 color=texture2D(uTexture,vUV);
      if(uDuotone>.5){
        float tone=smoothstep(.22,.78,dot(color.rgb,vec3(.33333)));
        color.rgb=mix(vec3(.28627,.01176,.07843),vec3(.88235,.85098,.78039),tone);
        color.a=smoothstep(.08,.92,color.a);
      }
      if(uRays>.5){
        vec2 point=(vUV-vec2(.64,.63))*vec2(2.6,1.0);
        float dist=length(point),maskValue=1.0;
        for(int i=0;i<3;i++){
          float ringPos=mod(uTime*.2+float(i)/3.0,1.0)*1.1;
          float ringMask=1.0-smoothstep(0.0,.04,abs(dist-ringPos));
          maskValue-=ringMask*(1.0-smoothstep(0.0,1.1,ringPos));
        }
        color.a*=clamp(maskValue,0.0,1.0);
      }
      if(uMask>0.0){
        vec2 point=(gl_FragCoord.xy/uResolution-uCenter)*vec2(uResolution.x/uResolution.y,1.0);
        color.a*=1.0-smoothstep(uMask-1.5/uResolution.y,uMask+1.5/uResolution.y,length(point));
      }
      color.a*=uOpacity;
      gl_FragColor=vec4(color.rgb*color.a,color.a);
    }`;
  const blurVertex = `attribute vec2 aPosition;attribute vec2 aUV;varying vec2 vUV;void main(){gl_Position=vec4(aPosition*2.0,0.0,1.0);vUV=vec2(aUV.x,1.0-aUV.y);}`;
  const blurFragment = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform float uBlur;
    uniform mediump vec2 uCenter;
    varying vec2 vUV;
    void main(){
      if(uBlur<.0001){gl_FragColor=texture2D(uTexture,vUV);return;}
      vec2 direction=vUV-uCenter;
      float dist=length(direction);
      vec2 normalizedDir=dist>0.0?direction/dist:vec2(0.0);
      float radialFactor=smoothstep(0.0,.7,dist);
      float centerFalloff=1.0-smoothstep(.999,1.0,clamp(dist,0.0,1.0));
      radialFactor*=1.0-centerFalloff*.7;
      vec2 velocity=normalizedDir*uBlur*radialFactor*.1;
      vec4 sum=vec4(0.0);
      for(int i=0;i<20;i++){
        float t=float(i)/19.0;
        sum+=texture2D(uTexture,vUV-velocity*t);
      }
      gl_FragColor=sum/20.0;
    }`;
  function program(vs,fs){
    const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
    const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
  }
  let sceneProgram, blurProgram;
  try{sceneProgram=program(vertex,fragment);blurProgram=program(blurVertex,blurFragment);}catch(error){console.warn('The animated scene is unavailable; showing the static illustration.',error);return;}
  const uniforms = Object.fromEntries(['uOrigin','uSize','uCenter','uUV','uDepth','uTravel','uLogoScale','uRotation','uAspect','uTexture','uResolution','uOpacity','uDuotone','uMask','uRays','uTime'].map(name=>[name,gl.getUniformLocation(sceneProgram,name)]));
  const blurUniforms={texture:gl.getUniformLocation(blurProgram,'uTexture'),blur:gl.getUniformLocation(blurProgram,'uBlur'),center:gl.getUniformLocation(blurProgram,'uCenter')};
  const geometry=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,geometry);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,0,1,.5,-.5,1,1,-.5,.5,0,0,-.5,.5,0,0,.5,-.5,1,1,.5,.5,1,0]),gl.STATIC_DRAW);
  function bindGeometry(p){
    gl.bindBuffer(gl.ARRAY_BUFFER,geometry);
    const pos=gl.getAttribLocation(p,'aPosition'),uv=gl.getAttribLocation(p,'aUV');
    gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
  }
  function setupTexture(texture){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  const textureCache=new Map();
  function loadTexture(src){
    if(textureCache.has(src))return textureCache.get(src);
    const promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const texture=gl.createTexture();setupTexture(texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);resolve(texture);};image.onerror=reject;image.src=src;});
    textureCache.set(src,promise);return promise;
  }
  const framebuffer=gl.createFramebuffer(),frameTexture=gl.createTexture();
  let width=0,height=0,logoScale=1,progress=0,target=0,rotation=0,pointer=0,lastRenderedProgress=0,motionBlur=0;
  let centerX=.72,centerY=.48;
  let ready=false,inView=true,raf=0,snap=null,startTime=performance.now(),lastFrame=0;
  let touchStart=null,lastTouchY=0;
  let introShown=false, introAnimations=[];

  // Entry effects are progressive enhancement: the actual copy stays in the
  // document and remains visible if animation is unavailable or disabled.
  const introObserver = intro ? new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || introShown || reducedMotion.matches) return;
    introShown=true;
    const content=intro.querySelector('.intro-layout');
    if (content && !intro.contains(document.activeElement)) {
      introAnimations=[...content.children].map((element,index) => element.animate([
        {opacity:0,transform:'translateY(24px)'},
        {opacity:1,transform:'translateY(0)'}
      ], {duration:800,delay:index*85,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    }
    introObserver.disconnect();
  }, {threshold:.12}) : null;
  if (introObserver) introObserver.observe(intro);

  function resize(){
    width=stage.clientWidth;height=stage.clientHeight;
    const pixelRatio=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);
    const artRect=document.querySelector('.hero-art').getBoundingClientRect();
    const stageRect=stage.getBoundingClientRect();
    const artSize=artRect.width;
    centerX=(artRect.left-stageRect.left+artSize/2)/width;
    centerY=1-(artRect.top-stageRect.top+artRect.height/2)/height;
    canvas.dataset.center=[centerX.toFixed(3),centerY.toFixed(3)].join(',');
    logoScale=artSize*.84/(2.66/(2*Math.tan(75*Math.PI/360)*3)*height);
    setupTexture(frameTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,frameTexture,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  }
  function render(time){
    gl.viewport(0,0,canvas.width,canvas.height);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(sceneProgram);bindGeometry(sceneProgram);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(uniforms.uTexture,0);gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.uCenter,centerX,centerY);
    gl.uniform1f(uniforms.uLogoScale,logoScale);gl.uniform1f(uniforms.uAspect,width/height);gl.uniform1f(uniforms.uTime,time);
    const frameDistance=3-progress*5;
    const mask=3.1-progress*4.75>.7?1.33*.99*logoScale/(2*Math.tan(75*Math.PI/360)*frameDistance):-1;
    let visible=0;
    for(const layer of layers){
      const travel=progress*5*layer.speed*(1+(layer.acceleration??0)*Math.pow(progress,layer.power??1));
      const distance=3+layer.depth-travel;
      if(distance<.5)continue;
      const fade=layer.fade?range(progress,...layer.fade):0;
      const opacity=(layer.opacity??1)*(1-smooth(fade));
      if(opacity<.001)continue;
      const [x,y,w,h]=layer.rect,unit=3.1666666667/1000;
      gl.uniform2f(uniforms.uOrigin,(x+w/2-500)*unit,(500-y-h/2)*unit);gl.uniform2f(uniforms.uSize,w*unit,h*unit);
      gl.uniform4fv(uniforms.uUV,layer.uv||[0,0,1,1]);
      gl.uniform1f(uniforms.uDepth,layer.depth);
      gl.uniform1f(uniforms.uTravel,travel);
      gl.uniform1f(uniforms.uRotation,rotation*(layer.slowRotation?.5:1));
      gl.uniform1f(uniforms.uOpacity,opacity);gl.uniform1f(uniforms.uDuotone,layer.duotone?1:0);gl.uniform1f(uniforms.uMask,layer.unmasked?-1:mask);gl.uniform1f(uniforms.uRays,layer.rays?1:0);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,layer.texture);gl.drawArrays(gl.TRIANGLES,0,6);visible++;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.disable(gl.BLEND);gl.useProgram(blurProgram);bindGeometry(blurProgram);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,frameTexture);gl.uniform1i(blurUniforms.texture,0);
    gl.uniform2f(blurUniforms.center,centerX,centerY);
    gl.uniform1f(blurUniforms.blur,motionBlur);gl.drawArrays(gl.TRIANGLES,0,6);
    canvas.dataset.progress=progress.toFixed(3);canvas.dataset.visiblePlanes=visible;
    canvas.dataset.stage=progress<.55?'kurmanjan':progress<.74?'city':progress<.86?'hills':progress<.945?'mountains':'message';
    // The last ridge recedes as the type arrives. Short vertical movement and
    // staggered easing give the eye time to settle before normal page scrolling.
    const revealOffset=Math.max(0,hero.offsetHeight-innerHeight);
    const handoff=clamp(scrollY-revealOffset,0,height);
    // Hold the scene while the next section rises over it. The hero clips the
    // stage, so this never creates a fixed overlay above the rest of the page.
    stage.style.transform=`translate3d(0,${handoff}px,0)`;
    const exit=smooth(range(handoff/height,.25,.95));
    slogan.style.opacity=1-exit;
    slogan.style.transform=`translateY(${-exit*24}px)`;
    [...slogan.children].forEach((span,index)=>{
      const p=smooth(range(progress,.885+index*.025,.985+index*.015));
      span.style.transform=`translateY(${(1-p)*28}px)`;
      span.style.opacity=p;
    });
    if(introCopy){
      const fade=range(progress,.05,.30);
      introCopy.style.opacity=1-fade*fade*(3-2*fade);
      introCopy.inert=fade>=.99;
    }
    if(scrollCue){
      const cueOpacity=Math.max(1-range(progress,0,.16),range(progress,.95,1));
      const visibleCue=cueOpacity*(1-smooth(range(handoff/height,0,.25)));
      scrollCue.style.opacity=visibleCue;
      scrollCue.inert=visibleCue<=.01;
    }
    if(caption)caption.style.opacity=.6*(1-range(progress,0,.20));
  }
  function tick(now){
    raf=0;if(!ready||!inView||document.hidden||reducedMotion.matches)return;
    const frameTime=lastFrame?Math.min(now-lastFrame,64):16.67;lastFrame=now;
    if(snap){const p=clamp((now-snap.start)/snap.duration);const ease=snap.to===1?1-Math.pow(1-p,2):smooth(p);progress=snap.from+(snap.to-snap.from)*ease;if(p===1){target=progress=snap.to;snap=null;}}
    else{progress+=(target-progress)*(1-Math.exp(-frameTime/70));if(Math.abs(target-progress)<.0001)progress=target;}
    // Blur follows movement, so a paused view remains sharp. Cap its extent
    // to keep the city and ridgelines legible during the fastest part.
    const speed=Math.abs(progress-lastRenderedProgress)*1000/frameTime;
    const wantedBlur=Math.min(.65,speed*.75)*Math.sin(Math.PI*progress);
    motionBlur+=(wantedBlur-motionBlur)*(1-Math.exp(-frameTime/70));
    lastRenderedProgress=progress;
    const wantedRotation=pointer*.2*Math.pow(1-progress,3);rotation+=(wantedRotation-rotation)*(1-Math.exp(-frameTime/158));
    render((now-startTime)/1000);
    // The finished scene contains no moving artwork. Reverse input wakes it.
    if(progress<1||snap)raf=requestAnimationFrame(tick);
  }
  function wake(){if(!raf&&ready&&inView&&!document.hidden&&!reducedMotion.matches)raf=requestAnimationFrame(tick);}
  function snapTo(value){snap={from:progress,to:value,start:performance.now(),duration:Math.max(650,Math.abs(value-progress)*2600)};target=value;wake();}
  function applyDelta(delta,event){
    if(!ready||!event.cancelable||!delta||reducedMotion.matches||document.querySelector('dialog[open]'))return false;
    // Let compact screens reveal the illustration before consuming a scroll gesture.
    const revealOffset=Math.max(0,hero.offsetHeight-innerHeight);
    if(scrollY<revealOffset-2||scrollY>revealOffset+(revealOffset?innerHeight*.25:2))return false;
    if(snap){
      event.preventDefault();
      // A deliberate reverse gesture can turn the flight around immediately.
      if((delta<-12&&snap.to===1)||(delta>12&&snap.to===0))snapTo(snap.to===1?0:1);
      return true;
    }
    if((delta>0&&target>=1)||(delta<0&&target<=0))return false;
    if(event.cancelable)event.preventDefault();
    const previous=target;target=clamp(target+delta*.001);
    if(previous<.2&&target>=.2)snapTo(1);
    else if(previous>.9&&target<=.9)snapTo(0);
    wake();return true;
  }
  addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);applyDelta(delta,event);},{passive:false});
  addEventListener('touchstart',event=>{if(event.touches.length!==1)return;touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};lastTouchY=touchStart.y;},{passive:true});
  addEventListener('touchmove',event=>{if(!touchStart||event.touches.length!==1)return;const point=event.touches[0];if(Math.abs(point.clientY-touchStart.y)<Math.abs(point.clientX-touchStart.x))return;const delta=lastTouchY-point.clientY;lastTouchY=point.clientY;applyDelta(delta,event);},{passive:false});
  addEventListener('touchend',()=>{touchStart=null;},{passive:true});
  addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
  addEventListener('keydown',event=>{if(event.target.closest('button,a,input,textarea,select,[contenteditable]'))return;const down=['ArrowDown','PageDown',' '].includes(event.key),up=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey);if(down||up)applyDelta(up?-100:100,event);});
  addEventListener('pointermove',event=>{if(event.pointerType!=='touch')pointer=(event.clientX/innerWidth-.5)*2;},{passive:true});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    snap=null;
    if(link.getAttribute('href')==='#top'){progress=target=0;}
    else{progress=target=1;}
    wake();
  });
  addEventListener('resize',()=>{if(ready){resize();wake();}},{passive:true});
  addEventListener('scroll',wake,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;lastFrame=0;if(snap)snap.pausedAt=performance.now();}
    else{if(snap?.pausedAt!==undefined){snap.start+=performance.now()-snap.pausedAt;delete snap.pausedAt;}wake();}
  });
  reducedMotion.addEventListener('change',()=>{
    stage.classList.toggle('depth-scene-ready',ready&&!reducedMotion.matches);
    if(reducedMotion.matches){
      cancelAnimationFrame(raf);raf=0;snap=null;progress=target=lastRenderedProgress=0;rotation=motionBlur=0;lastFrame=0;
      stage.style.transform='';
      introAnimations.forEach(animation=>animation.cancel());
      slogan.style.opacity=0;
      if(introCopy){introCopy.style.opacity='';introCopy.inert=false;}
      if(scrollCue){scrollCue.style.opacity='';scrollCue.inert=false;}
      if(caption)caption.style.opacity='';
    }
    wake();
  });
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)wake();else{cancelAnimationFrame(raf);raf=0;lastFrame=0;}},{threshold:0}).observe(hero);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();ready=false;stage.classList.remove('depth-scene-ready');
    stage.style.transform='';
    slogan.style.opacity=0;
    if(introCopy){introCopy.style.opacity='';introCopy.inert=false;}
    if(scrollCue){scrollCue.style.opacity='';scrollCue.inert=false;}
    if(caption)caption.style.opacity='';
  });
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  Promise.all(layers.map(async layer=>{layer.texture=await loadTexture(layer.src);})).then(()=>{
    ready=true;resize();stage.classList.toggle('depth-scene-ready',!reducedMotion.matches);wake();
  }).catch(error=>console.warn('The animated scene could not load; showing the static illustration.',error));
  }
  reducedMotion.addEventListener('change',initializeAnimation);
  initializeAnimation();
})();
