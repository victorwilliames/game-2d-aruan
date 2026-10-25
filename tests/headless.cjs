// Native CDP QA. Node 24 + an installed Chrome/Edge; no npm dependencies or visible windows.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process');
const appearanceOnly=process.argv.includes('--appearance-only'),turnOnly=process.argv.includes('--turn-only'),studioOnly=process.argv.includes('--studio-only'),gameEconomyOnly=process.argv.includes('--game-economy-only'),recoveryOnly=process.argv.includes('--recovery-only'),trailOnly=process.argv.includes('--trail-only'),blinkOnly=process.argv.includes('--blink-only');
const root=path.resolve(__dirname,'..'),out=process.argv[2]||'--smoke',capture=out!=='--smoke';
const transitionOnly=process.argv.includes('--transition-only'),clipOnly=process.argv.includes('--clip-only')||transitionOnly;
const captureDir=path.join(root,'capturas','timelapse'),pending=new Map(),errors=[],written=[];
let server,browser,profile,ws,sequence=0,base,closing=false;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function check(value,message){if(!value)throw Error(message);}
function send(method,params={}){
 return new Promise((resolve,reject)=>{
  const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},60000);timer.unref();
  pending.set(id,{resolve,reject,timer});
  try{ws.send(JSON.stringify({id,method,params}));}catch(e){clearTimeout(timer);pending.delete(id);reject(e);}
 });
}
async function evaluate(expression){
 const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
 return r.result.value;
}
async function until(probe,label,timeout=20000){
 const end=Date.now()+timeout;let last;
 while(Date.now()<end){try{const result=await probe();if(result)return result;}catch(e){last=e;}await delay(100);}
 throw Error(label+' timed out'+(last?': '+last.message:''));
}
async function reservePort(){
 const socket=net.createServer();await new Promise((resolve,reject)=>{socket.once('error',reject);socket.listen(0,'127.0.0.1',resolve);});
 const port=socket.address().port;await new Promise((resolve,reject)=>socket.close(e=>e?reject(e):resolve()));return port;
}
async function startServer(){
 const port=await reservePort();base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server.cjs'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:String(port)}});
 await new Promise((resolve,reject)=>{
  let stderr='';const timer=setTimeout(()=>reject(Error('Local server startup timed out')),10000);
  server.stderr.on('data',b=>{stderr=(stderr+b).slice(-1500);});
  server.once('error',e=>{clearTimeout(timer);reject(e);});server.once('exit',code=>{clearTimeout(timer);reject(Error('Local server exited '+code+': '+stderr));});
  server.stdout.once('data',()=>{clearTimeout(timer);resolve();});
 });
}
async function startBrowser(){
 const candidates=[process.env.ARUAN_BROWSER,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
 const executable=candidates.find(p=>fs.existsSync(p));check(executable,'Install/use an existing Chrome or Edge, or set ARUAN_BROWSER.');
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'aruan-headless-'));
 // Linux CI runners can lack the kernel namespace permissions Chrome requires.
 // The browser only visits our isolated localhost fixture and a fresh profile.
 const ciFlags=process.platform==='linux'&&process.env.CI?['--no-sandbox','--disable-dev-shm-usage']:[];
 browser=spawn(executable,['--headless=new',...ciFlags,'--disable-gpu','--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
 let browserLog='';browser.stderr.on('data',b=>browserLog=(browserLog+b).slice(-3000));
 let launchError;browser.once('error',e=>{launchError=e;});
 const marker=path.join(profile,'DevToolsActivePort');
 await until(()=>{if(launchError)throw launchError;if(browser.exitCode!==null)throw Error('Headless browser exited before CDP startup');return fs.existsSync(marker);},'Headless browser').catch(e=>{throw Error(e.message+' | '+executable+' | '+browserLog);});
 const port=fs.readFileSync(marker,'utf8').split('\n')[0];
 const tabs=await until(async()=>{const r=await fetch('http://127.0.0.1:'+port+'/json');const list=await r.json();return list.find(t=>t.type==='page');},'CDP page target');
 ws=new WebSocket(tabs.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);return;}
  if(closing)return;
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push('console.error: '+m.params.args.map(a=>a.value||a.description).join(' '));
  if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);
  if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push('HTTP '+m.params.response.status+': '+m.params.response.url);
  if(m.method==='Network.loadingFailed'&&!m.params.canceled)errors.push('Network: '+m.params.errorText);
  if(m.method==='Network.requestWillBeSent'){
   try{if(new URL(m.params.request.url).pathname.startsWith('/referencias/'))errors.push('Reference asset requested in runtime: '+m.params.request.url);}catch{}
  }
 });
 ws.addEventListener('close',()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('CDP closed'));}pending.clear();});
 for(const method of ['Runtime.enable','Log.enable','Page.enable','Network.enable'])await send(method);
}
async function metrics(width=1600,height=900,deviceScaleFactor=1,mobile=false){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor,mobile});}
async function navigate(page){
 const url=base+'/'+page;await send('Page.navigate',{url});
 const marker=page==='index.html'?"typeof Pilot==='object'":"typeof renderStudio==='function'";
 await until(()=>evaluate(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&(${marker})`),'Page '+page);
}
function save(name,data){
 if(!capture)return;check(data[0]===255&&data[1]===216&&data[2]===255,'Not a JPEG: '+name);
 const file=path.join(captureDir,out+'-'+name+'.jpg');check(!fs.existsSync(file),'Refusing to overwrite '+file);
 fs.writeFileSync(file,data);written.push(file);
}
async function screenshot(name){if(capture){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:90,captureBeyondViewport:false});save(name,Buffer.from(r.data,'base64'));}}
function saveDataURL(name,data){if(capture){check(data.startsWith('data:image/jpeg;base64,'),'Canvas must encode JPEG');save(name,Buffer.from(data.split(',')[1],'base64'));}}
async function scenario(file){return evaluate(fs.readFileSync(path.join(root,'tests',file),'utf8'));}
async function checkCamera(){
 for(const [width,height]of [[1600,900],[360,740]])for(const dpr of [1,2]){
  await metrics(width,height,dpr);
  console.log(await evaluate(`(()=>{resize();Input.clear();for(let i=0;i<8;i++){resetPlayer();const a=i*TAU/8,r=edgeR(a)-40;Player.pos=[Math.cos(a)*r,Math.sin(a)*r,0];for(let n=0;n<360;n++)update(1/120);render();const p=pj2(Player.pos),h=pj2(Player.rig.head.o),x=(p[0]*Cam.px+Cam.offX)/Cam.dpr,y=(p[1]*Cam.px+Cam.offY)/Cam.dpr,hy=(h[1]*Cam.px+Cam.offY)/Cam.dpr;if(x<40||x>Cam.cssW-40||hy<60||y>Cam.cssH-60)throw Error('camera safe frame');}resetPlayer();return {camera:'8 edges passed',viewport:[Cam.cssW,Cam.cssH],dpr:Cam.dpr};})()`));
 }
 await metrics();
}
async function checkTouch(){
 for(const [width,height,dpr]of [[360,740,2],[740,360,2],[320,568,1]]){
  await metrics(width,height,dpr,true);await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  console.log(await scenario('browser-touch.js'));
  const p=await evaluate("(()=>{resetPlayer();Game.paused=true;Input.suspended=false;Input.activate('touch');const z=document.querySelector('#touch-zone').getBoundingClientRect(),a=document.querySelector('#touch-attack').getBoundingClientRect();return {j:{x:z.left+Math.min(70,z.width/2),y:z.top+70,id:1},a:{x:a.left+a.width/2,y:a.top+a.height/2,id:2}};})()");
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p.j]});p.j.x+=44;
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p.j]});
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p.j,p.a]});p.a.y-=30;
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p.j,p.a]});await screenshot('toque-'+width+'x'+height);
  // For touchEnd, name the changed touch: the attacking finger, not the held joystick.
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[p.a]});
  console.log(await evaluate("(()=>{if(Input.clicks.length!==1||Math.hypot(...Input.movement())<.99)throw Error('native multitouch transport');update(1/120);if(Player.state!=='attack')throw Error('native touch attack');return 'Native CDP multitouch passed';})()"));
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await evaluate("resetPlayer();setToggle('paused',true);window.PilotBenchmarkSamples=40");
  console.log('Mobile work cost (not FPS):',width+'x'+height,JSON.stringify(await scenario('browser-performance.js')));await evaluate('delete window.PilotBenchmarkSamples');
 }
 await send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await metrics();
 await evaluate("resize();resetPlayer();Input.activate('touch');Game.t=0;Game.hits=0;update(1/120);render()");await screenshot('toque-tablet');
}
async function checkAccessibility(){
 console.log(await scenario('browser-accessibility.js'));
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 check(await evaluate("document.activeElement===canvas&&canvas.matches(':focus-visible')&&parseFloat(getComputedStyle(canvas).outlineWidth)>=2"),'Native keyboard focus ring');
 await evaluate("setToggle('paused',false);resetPlayer();Player.pos=[0,100,0];window.__keyboardStart=Player.pos.slice()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD',windowsVirtualKeyCode:68});await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16});
 check(await evaluate("(()=>{for(let n=0;n<30;n++)update(1/120);return vDist(Player.pos,window.__keyboardStart)>20;})()"),'Native keyboard movement');
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD',windowsVirtualKeyCode:68});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16});
 check(await evaluate("!Input.keys.has('KeyD')&&!Input.keys.has('ShiftLeft')"),'Native key release');
 await evaluate("delete window.__keyboardStart;canvas.blur();document.body.removeAttribute('tabindex');setToggle('paused',true);resetPlayer()");
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await until(()=>evaluate('Game.reducedMotion'),'Reduced motion preference');
 check(await evaluate("(()=>{const props=WorldScene.props;try{WorldScene.props=[];hit(2);return Game.shake===0;}finally{WorldScene.props=props;resetPlayer();}})()"),'Reduced motion shake');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await until(()=>evaluate('!Game.reducedMotion'),'Normal motion preference');
 console.log('Native keyboard, focus ring and reduced-motion media passed');
}
async function checkGameEconomy(){
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await until(()=>evaluate('!Game.reducedMotion'),'Initial normal motion preference');
 console.log(await scenario('browser-game-economy.js'));
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:200,y:150});await evaluate('(async()=>{for(let n=0;n<3;n++)await new Promise(requestAnimationFrame);window.__gameResizePaints=0;window.__gameOriginalRenderer=render;render=function(...args){window.__gameResizePaints++;return window.__gameOriginalRenderer(...args);};})()');
 try{
  for(const [w,h,dpr]of [[1024,768,1],[360,740,2],[1600,900,1],[1600,900,2]]){await metrics(w,h,dpr);console.log(await evaluate('(async()=>{for(let n=0;n<4;n++)await new Promise(requestAnimationFrame);const count=window.__gameResizePaints,r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);if(count<1||count>3||canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr))throw Error("Game resize/DPR invalidation");if(Math.abs(Input.mouse[0]/dpr-200)>.1||Math.abs(Input.mouse[1]/dpr-150)>.1)throw Error("Reticle CSS position changed with DPR");window.__gameResizePaints=0;for(let n=0;n<5;n++)await new Promise(requestAnimationFrame);if(window.__gameResizePaints)throw Error("Game resize did not settle");return {gameResize:[innerWidth,innerHeight,dpr],paints:count,stablePaints:0,mouseCSS:Input.mouse.map(n=>n/dpr)};})()'));}
  await evaluate('Game.shake=3;Cam.shakeX=2;Cam.shakeY=-1;camUpdateOffsets();render();window.__gameResizePaints=0');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await until(()=>evaluate('Game.reducedMotion'),'Paused reduced motion');
  const reduced=await evaluate('(async()=>{for(let n=0;n<4;n++)await new Promise(requestAnimationFrame);return {shake:Game.shake,x:Cam.shakeX,y:Cam.shakeY,paints:window.__gameResizePaints,reduced:Game.reducedMotion};})()');check(reduced.shake===0&&reduced.x===0&&reduced.y===0&&reduced.paints>0,'Paused reduced motion redraw/offset reset: '+JSON.stringify(reduced));await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await until(()=>evaluate('!Game.reducedMotion'),'Normal motion preference');
 }finally{await evaluate('render=window.__gameOriginalRenderer;delete window.__gameOriginalRenderer;delete window.__gameResizePaints');await metrics();}
 await evaluate('(async()=>{for(let n=0;n<4;n++)await new Promise(requestAnimationFrame);})()');await screenshot('campo-pausa-dpr');console.log('Native pointer, isolated DPR and paused reduced-motion updates passed');
}
async function checkGame(){
 await evaluate("setToggle('paused',true);resetPlayer();Game.t=0;update(1/120);render()");await screenshot('campo');await checkAccessibility();await checkGameEconomy();
 if(capture)for(const mode of ['reversal','dodge','cancel'])saveDataURL('live-'+mode,await evaluate(fs.readFileSync(path.join(root,'tests/browser-motion.js'),'utf8').replace('__MODE__',mode)));
 console.log(await scenario('browser-input.js'));console.log(await evaluate('({frames:Game.frames,cache:WorldScene.cacheBuilds,finite:Player.rig.head.o.every(Number.isFinite)})'));
 await checkCamera();console.log('Work cost (not FPS):',JSON.stringify(await scenario('browser-performance.js')));
 console.log(await scenario('browser-gamepad.js'));await screenshot('com-controle');await evaluate('window.__restorePadTest();delete window.__restorePadTest');
 await checkTouch();
 // Pixel readback allocates large buffers; keep it after the timing samples.
 console.log(await scenario('browser-game-buffer.js'));
}
async function checkStudioBuffers(){
 try{for(const dpr of [1,1.25,2]){await metrics(1600,900,dpr);console.log(await scenario('browser-studio-buffer.js'));}}finally{await metrics();}
}
async function checkStudioEconomy(){
 console.log(await scenario('browser-studio-economy.js'));
 await evaluate('window.__studioResizePaints=0;window.__studioOriginalRenderer=renderStudio;renderStudio=function(...args){window.__studioResizePaints++;return window.__studioOriginalRenderer(...args);}');
 try{for(const [w,h,dpr]of [[1024,768,1],[360,740,2],[1600,900,1],[1600,900,2]]){await metrics(w,h,dpr);console.log(await evaluate('(async()=>{for(let n=0;n<4;n++)await new Promise(requestAnimationFrame);const count=window.__studioResizePaints,r=sheet.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);if(count<1||count>4||sheet.width!==Math.round(r.width*dpr)||sheet.height!==Math.round(r.height*dpr))throw Error("Studio resize/DPR invalidation");window.__studioResizePaints=0;for(let n=0;n<5;n++)await new Promise(requestAnimationFrame);if(window.__studioResizePaints)throw Error("Studio resize did not settle");return {studioResize:[innerWidth,innerHeight,dpr],paints:count,stablePaints:0};})()'));}}finally{await evaluate('renderStudio=window.__studioOriginalRenderer;delete window.__studioOriginalRenderer;delete window.__studioResizePaints');await metrics();}
}
async function checkStudio(){
 await evaluate('pause(true);motion="idle";time=0;renderStudio()');await screenshot('estudio');await checkStudioEconomy();await checkStudioBuffers();console.log(await scenario('browser-skin.js'));
 if(await evaluate("typeof SwordTrail==='undefined'"))await evaluate(fs.readFileSync(path.join(root,'js/effects.js'),'utf8'));
 console.log(await scenario('browser-blink.js'));saveDataURL('piscada-sequencia',await evaluate('window.__blinkSheet'));
 console.log(await scenario('browser-trail-head.js'));
 for(let attack=0;attack<3;attack++)saveDataURL('golpe-'+(attack+1)+'-direcoes',await evaluate(fs.readFileSync(path.join(root,'tests/browser-combat.js'),'utf8').replace('__ATTACK__',attack)));
 saveDataURL('direcoes',await evaluate('renderStudio();turn.toDataURL("image/jpeg",.94)'));
 for(const motion of ['idle','walk','run','dodge','0','1','2']){
  await evaluate(`motion=${JSON.stringify(motion)};(()=>{const a=studioSample(0,1,false).rig,b=studioSample(duration(),1,false).rig;for(const k of ['armL','armR','legL','legR'])if(vDist(a[k].c,b[k].c)>1e-6)throw Error('studio loop seam: '+motion);for(const k of POSE_FIELDS)if(k!=='roll'&&Math.abs(a.pose[k]-b.pose[k])>1e-6)throw Error('pose loop seam: '+motion+'/'+k);})();time=duration()*.5;renderStudio()`);
  if(capture)saveDataURL(motion+'-sequencia',await evaluate(`(()=>{motion=${JSON.stringify(motion)};const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=900;const c=sheet.getContext('2d');for(let i=0;i<6;i++){c.save();c.translate((i%3)*1600/3,Math.floor(i/3)*450);drawView(c,1600/3,450,duration()*i/6,1,false);c.fillStyle='#263b3b';c.font='16px system-ui';c.fillText(motion+' · '+(duration()*i/6).toFixed(2)+' s',18,30);c.restore();}return sheet.toDataURL('image/jpeg',.9);})()`));
 }
}
async function checkAppearance(){
 console.log(await scenario('browser-appearance.js'));
 await metrics();await screenshot('personalizacao');
 for(const preset of ['original','mata','terra']){
  await evaluate('Appearance.preset('+JSON.stringify(preset)+');motion="idle";time=0;renderStudio()');
  saveDataURL('aparencia-'+preset,await evaluate(`(()=>{const out=document.createElement('canvas');out.width=1600;out.height=900;const ctx=out.getContext('2d');for(let d=0;d<8;d++){ctx.save();ctx.translate(d%4*400,Math.floor(d/4)*450);drawView(ctx,400,450,0,d,false);ctx.restore();}return out.toDataURL('image/jpeg',.93);})()`));
 }
 const exports=path.join(profile,'exports');fs.mkdirSync(exports);
 await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:exports});
 await evaluate('Appearance.preset("mata");document.getElementById("appearance-export").click()');
 const exported=path.join(exports,'aruan-aparencia.json');await until(()=>fs.existsSync(exported),'JSON download');
 const data=JSON.parse(fs.readFileSync(exported,'utf8'));check(data.version===1&&data.outfit==='layered','Downloaded JSON content');
 await evaluate('Appearance.reset()');const doc=await send('DOM.getDocument');const node=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#appearance-file'});
 await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[exported]});await until(()=>evaluate('Appearance.current.outfit==="layered"&&document.getElementById("appearance-file").value===""'),'JSON file input');
 for(const [width,height]of [[360,740],[740,360],[320,568]]){
  await metrics(width,height,1,true);await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await evaluate('document.getElementById("appearance-reset").scrollIntoView({block:"center"});renderStudio()');
  const r=await evaluate('(()=>{const el=document.getElementById("appearance-reset"),r=el.getBoundingClientRect();if(r.height<44||document.documentElement.scrollWidth>innerWidth+1)throw Error("Appearance mobile layout: "+JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth,height:r.height,overflow:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.tagName+"#"+e.id).slice(0,12)}));return {x:r.x+r.width/2,y:r.y+r.height/2,id:1};})()');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[r]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  check(await evaluate('Appearance.current.outfit==="wrap"'),'Native touch appearance reset');
  await evaluate('Appearance.preset("mata");renderStudio();(()=>{const r=document.getElementById("inspection").getBoundingClientRect();if(r.top<-.5||r.bottom>innerHeight)throw Error("Appearance preview must stay visible while editing");})()');await screenshot('personalizacao-'+width+'x'+height);
 }
 await send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await metrics();
 await evaluate('Appearance.preset("mata");Appearance.save()');await navigate('index.html');
 check(await evaluate('Appearance.current.outfit==="layered"&&Appearance.current.hair==="cropped"&&Appearance.materials().cloth.base==="#2e786b"'),'Appearance persisted into game');
 await evaluate('setToggle("paused",true);resetPlayer();Game.t=0;update(1/120);render()');await screenshot('personalizado-campo');
 await evaluate('Appearance.reset();Appearance.save()');await navigate('inspecao.html');
 check(await evaluate('Appearance.current.outfit==="wrap"'),'Original restored after customization QA');console.log('Appearance JSON download/file input, native touch 3 sizes and field persistence passed');
}
async function verifyJPEGs(){
 const files=fs.readdirSync(captureDir).filter(f=>f.endsWith('.jpg'));
 for(const name of files){
  const bytes=fs.readFileSync(path.join(captureDir,name));check(bytes[0]===255&&bytes[1]===216&&bytes[2]===255,'JPEG signature: '+name);
  const response=await fetch(base+'/capturas/timelapse/'+encodeURIComponent(name),{signal:AbortSignal.timeout(5000)});
  check(response.status===200&&response.headers.get('content-type')?.startsWith('image/jpeg'),'JPEG HTTP/MIME: '+name);await response.arrayBuffer();
 }
 return files.length;
}
async function checkExternalClip(){
 await navigate('index.html');check(await evaluate("typeof AruanClips==='undefined'"),'Jogo recebeu o player experimental automaticamente');
 await navigate('inspecao.html');
 await evaluate('pause(true);Appearance.reset();time=0;motion="idle";renderStudio();window.__v1ClipBaseline=sheet.toDataURL()');
 const file=path.join(root,'tools/movalab/workspace/exports/mixamo-walking.aruan-clip.v1.json');check(fs.existsSync(file),'Gere a fixture real com node tools/movalab/tests/procedural.mjs --write');
 const doc=await send('DOM.getDocument'),node=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#external-clip-file'});
 await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[file]});
 await until(()=>evaluate("rigMode==='v2'&&externalClip?.schema==='aruan-clip'&&document.querySelector('#external-clip-file').value===''") ,'Importação nativa do clipe');
 console.log(await evaluate(fs.readFileSync(path.join(root,'tests/browser-clip.js'),'utf8')));
 if(!transitionOnly){
 await evaluate('time=.35;direction=1;pause(true);renderStudio()');await screenshot('estudio');
 saveDataURL('direcoes',await evaluate('turn.toDataURL("image/jpeg",.93)'));
 saveDataURL('sequencia',await evaluate(`(()=>{
  const out=document.createElement('canvas');out.width=1600;out.height=900;const ctx=out.getContext('2d');
  for(let i=0;i<6;i++){ctx.save();ctx.translate(i%3*1600/3,Math.floor(i/3)*450);drawView(ctx,1600/3,450,externalClip.duration*i/6,1,false);ctx.restore();}return out.toDataURL('image/jpeg',.92);
 })()`));
 }
 const additional=['mixamo-run.aruan-clip.v1.json','mixamo-idle.aruan-clip.v1.json'].map(name=>path.join(root,'tools/movalab/workspace/exports',name));
 for(const filename of additional)check(fs.existsSync(filename),'Gere os clipes com node tools/movalab/tests/clip-transitions.mjs --write');
 await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:additional});
 await until(()=>evaluate("externalClips.length===3&&document.querySelector('#external-clip-file').value===''") ,'Clipes adicionais importados');
 console.log(await evaluate(fs.readFileSync(path.join(root,'tests/browser-transitions.js'),'utf8')));
 if(process.argv.includes('--clip-performance')){
  const report=await evaluate(fs.readFileSync(path.join(root,'tests/browser-clip-performance.js'),'utf8'));
  fs.writeFileSync(path.join(root,'tools/movalab/docs/clip-performance-report.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
 }
 if(transitionOnly){
  await evaluate("externalClip=window.__transitionExamples[0].clip;externalTransition=window.__transitionExamples[0];time=.15;direction=1;pause(true);ui('external-clip').value=String(externalClips.findIndex(e=>e.clip===externalClip));ui('external-clip-status').textContent='Caminhada → corrida · transição0,30s · IK/apoios verificados; arte em revisão.';renderStudio()");
  await screenshot('estudio');
  saveDataURL('sequencia',await evaluate(`(()=>{
   const out=document.createElement('canvas');out.width=1600;out.height=900;const ctx=out.getContext('2d'),previous=externalTransition,previousClip=externalClip;
   for(let row=0;row<2;row++)for(let col=0;col<3;col++){
    externalTransition=window.__transitionExamples[row];externalClip=externalTransition.clip;ctx.save();ctx.translate(col*1600/3,row*450);drawView(ctx,1600/3,450,col*.15,1,false);ctx.fillStyle='#263c36';ctx.font='14px system-ui';ctx.fillText((row?'Corrida → idle':'Caminhada → corrida')+' · '+(col*.15).toFixed(2)+' s',14,22);ctx.restore();
   }
   externalTransition=previous;externalClip=previousClip;return out.toDataURL('image/jpeg',.92);
  })()`));
 }
 check(await evaluate("(()=>{setRigMode('v1');time=0;motion='idle';renderStudio();return sheet.toDataURL()===window.__v1ClipBaseline;})()"),'V1 não voltou aos mesmos pixels');
}
async function childExit(child){
 if(!child||child.exitCode!==null||child.signalCode!==null)return;
 await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(2000)]);
}
async function cleanup(){
 closing=true;
 if(ws?.readyState===1){try{await Promise.race([send('Browser.close'),delay(1000)]);}catch{}ws.close();}
 await childExit(browser);if(browser&&browser.exitCode===null&&browser.signalCode===null)browser.kill();
 if(server&&server.exitCode===null&&server.signalCode===null)server.kill();await childExit(server);
 if(profile){
  const resolved=path.resolve(profile),temporaryRoot=path.resolve(os.tmpdir());
  check(path.dirname(resolved)===temporaryRoot&&path.basename(resolved).startsWith('aruan-headless-'),'Unsafe profile cleanup target');
  fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 }
}
async function main(){
 check(!capture||/^\d{3}-[a-z0-9-]+$/.test(out),'Use --smoke or a new numbered prefix such as 017-regressao.');
 if(capture)check(!fs.readdirSync(captureDir).some(f=>f.startsWith(out+'-')&&f.endsWith('.jpg')),'Capture prefix already exists; choose a new number.');
 try{
  await startServer();await startBrowser();await metrics();
  if(process.argv.includes('--movalab-game-only')){await navigate('index.html');console.log(await scenario('browser-game-movalab.js'));await screenshot('jogo');}
  else if(clipOnly){await checkExternalClip();}
  else if(blinkOnly){await navigate('index.html');await navigate('inspecao.html');await evaluate('pause(true)');console.log(await scenario('browser-blink.js'));saveDataURL('piscada-sequencia',await evaluate('window.__blinkSheet'));}
  else if(trailOnly){await navigate('index.html');await navigate('inspecao.html');await evaluate(fs.readFileSync(path.join(root,'js/effects.js'),'utf8'));console.log(await scenario('browser-trail-head.js'));}
  else if(recoveryOnly){await navigate('index.html');console.log(await scenario('browser-game-buffer.js'));await navigate('inspecao.html');await checkStudioBuffers();}
  else if(gameEconomyOnly){await navigate('index.html');await evaluate('setToggle("paused",true);resetPlayer();render()');await checkGameEconomy();await navigate('inspecao.html');await evaluate('pause(true);renderStudio()');}
  else if(turnOnly){await navigate('index.html');await evaluate('setToggle("paused",true);resetPlayer();render()');await navigate('inspecao.html');await evaluate('pause(true);Appearance.reset()');saveDataURL('giro-sequencia',await scenario('browser-turn.js'));}
  else{if(studioOnly){await navigate('index.html');await evaluate('setToggle("paused",true);resetPlayer();render()');}else if(!appearanceOnly){await navigate('index.html');await checkGame();}
   await navigate('inspecao.html');if(!appearanceOnly)await checkStudio();await checkAppearance();}
  const jpegCount=await verifyJPEGs();check(errors.length===0,errors.join('\n'));
  console.log(JSON.stringify({result:'OK',pages:2,animations:trailOnly?3:(turnOnly||gameEconomyOnly||recoveryOnly||blinkOnly)?1:7,directions:gameEconomyOnly?1:turnOnly?6:8,consoleAndNetworkErrors:errors.length,referenceRequests:0,jpegMIMEs:jpegCount,capturesWritten:written.length}));
 }finally{await cleanup();}
}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{cleanup().finally(()=>process.exit(130));});
main().catch(e=>{console.error(e.message);process.exitCode=1;});
