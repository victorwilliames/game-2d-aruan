// Native CDP smoke: Node 24 + installed Chrome, no npm dependencies. Never opens a visible window.
const {spawn}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.argv[2]||'006-baseline';process.chdir(root);
const profile=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'aruan-headless-'));
const server=spawn(process.execPath,['server.cjs'],{cwd:root,windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'15317'}});
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:'15317'}});
const capture=out!=='--smoke';
let ws;let debugPort;const pending=new Map();let seq=0;const errors=[];
async function waitFor(url){for(let i=0;i<80;i++){try{return await(await fetch(url)).json()}catch{await new Promise(r=>setTimeout(r,150));}}throw Error('CDP unavailable');}
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
(async()=>{for(let i=0;i<100&&!fs.existsSync(path.join(profile,'DevToolsActivePort'));i++)await new Promise(r=>setTimeout(r,100));debugPort=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];const tabs=await waitFor('http://127.0.0.1:'+debugPort+'/json');ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown'||m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m);});await send('Runtime.enable');await send('Log.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
for(const page of ['index.html','inspecao.html']){await send('Page.navigate',{url:'http://127.0.0.1:15317/'+page});await new Promise(r=>setTimeout(r,3000));const studio=page==='inspecao.html';await evaluate(studio?'pause(true);time=0;renderStudio()':'Game.paused=true;Pilot.reset();Game.t=0;Pilot.step(1/120);Pilot.render()');const file=`capturas/timelapse/${out}-${studio?'estudio':'campo'}.jpg`;fs.mkdirSync(path.dirname(file),{recursive:true});const r=await send('Page.captureScreenshot',{format:'jpeg',quality:90});if(capture)fs.writeFileSync(file,Buffer.from(r.data,'base64'));if(studio){
// The studio does not load effects at runtime; load its painter only for trail QA.
await evaluate(fs.readFileSync('js/effects.js','utf8'));
if(capture&&fs.existsSync('tests/browser-combat.js'))for(let attack=0;attack<3;attack++){
 const data=await evaluate(fs.readFileSync('tests/browser-combat.js','utf8').replace('__ATTACK__',attack));
 fs.writeFileSync(`capturas/timelapse/${out}-golpe-${attack+1}-direcoes.jpg`,Buffer.from(data.split(',')[1],'base64'));
}
const data=await evaluate('renderStudio();turn.toDataURL("image/jpeg",.94)');if(capture)fs.writeFileSync(`capturas/timelapse/${out}-direcoes.jpg`,Buffer.from(data.split(',')[1],'base64'));for(const m of ['idle','walk','run','dodge','0','1','2'])await evaluate(`motion=${JSON.stringify(m)};(()=>{const a=studioSample(0,1,false).rig,b=studioSample(duration(),1,false).rig;for(const k of ['armL','armR','legL','legR'])if(vDist(a[k].c,b[k].c)>1e-6)throw Error('studio loop seam: '+motion);})();time=duration()*.5;renderStudio()`);for(const m of ['idle','walk','run','dodge','0','1','2']){const strip=await evaluate(`(()=>{motion=${JSON.stringify(m)};const c=document.createElement('canvas');c.width=1600;c.height=900;const x=c.getContext('2d');for(let i=0;i<6;i++){x.save();x.translate((i%3)*1600/3,Math.floor(i/3)*450);drawView(x,1600/3,450,duration()*i/6,1,false);x.fillStyle='#263b3b';x.font='16px system-ui';x.fillText(motion+' · '+(duration()*i/6).toFixed(2)+' s',18,30);x.restore();}return c.toDataURL('image/jpeg',.9);})()`);if(capture)fs.writeFileSync(`capturas/timelapse/${out}-${m}-sequencia.jpg`,Buffer.from(strip.split(',')[1],'base64'));}
}else {
if(capture)for(const mode of ['reversal','dodge','cancel']){
 const strip=await evaluate(fs.readFileSync('tests/browser-motion.js','utf8').replace('__MODE__',mode));
 fs.writeFileSync(`capturas/timelapse/${out}-live-${mode}.jpg`,Buffer.from(strip.split(',')[1],'base64'));
}
if(fs.existsSync('tests/browser-input.js'))console.log(await evaluate(fs.readFileSync('tests/browser-input.js','utf8')));console.log(await evaluate('JSON.stringify({frames:Game.frames,cache:WorldScene.cacheBuilds,finite:Player.rig.head.o.every(Number.isFinite)})'));if(page==='index.html'){
for(const [width,height]of [[1600,900],[360,740]])for(const deviceScaleFactor of [1,2]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor,mobile:false});
 console.log(await evaluate(`(()=>{resize();Input.clear();for(let i=0;i<8;i++){resetPlayer();const a=i*TAU/8,r=edgeR(a)-40;Player.pos=[Math.cos(a)*r,Math.sin(a)*r,0];for(let n=0;n<360;n++)update(1/120);render();const p=pj2(Player.pos),h=pj2(Player.rig.head.o),x=(p[0]*Cam.px+Cam.offX)/Cam.dpr,y=(p[1]*Cam.px+Cam.offY)/Cam.dpr,hy=(h[1]*Cam.px+Cam.offY)/Cam.dpr;if(x<40||x>Cam.cssW-40||hy<60||y>Cam.cssH-60)throw Error('camera safe frame');}resetPlayer();return {camera:'8 edges passed',viewport:[Cam.cssW,Cam.cssH],dpr:Cam.dpr};})()`));
}
await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
if(fs.existsSync('tests/browser-performance.js'))console.log('Work cost (not FPS):',JSON.stringify(await evaluate(fs.readFileSync('tests/browser-performance.js','utf8'))));
}
}if(capture)console.log(file);}
for(const f of fs.readdirSync('capturas/timelapse').filter(f=>f.startsWith(out)&&f.endsWith('.jpg'))){const b=fs.readFileSync(path.join('capturas/timelapse',f));if(b[0]!==255||b[1]!==216)throw Error('JPEG inválido: '+f);const r=await fetch('http://127.0.0.1:15317/capturas/timelapse/'+f);if(r.status!==200||!r.headers.get('content-type').startsWith('image/jpeg'))throw Error('MIME inválido: '+f);}if(errors.length)throw Error(JSON.stringify(errors));console.log('OK: jogo, estúdio, 8 direções e 7 animações; console sem erros.');})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(ws&&ws.readyState===1){try{await Promise.race([send('Browser.close'),new Promise(r=>setTimeout(r,1000))]);}catch{}ws.close();}browser.kill();server.kill();});
