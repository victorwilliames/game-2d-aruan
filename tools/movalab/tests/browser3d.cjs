'use strict';
/** Headless Chrome QA: 3D character FBX rendered with Three.js. */
const fs=require('node:fs'),fsp=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const root=path.resolve(__dirname,'../../..');
const sample=path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx');
const candidates=[process.env.ARUAN_BROWSER,'/usr/bin/google-chrome','/usr/bin/chromium',
'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
function insist(value,desc){if(!value)throw Error(desc);}
async function port(){const s=net.createServer();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));const n=s.address().port;await new Promise(resolve=>s.close(resolve));return n;}
async function until(fn,desc,timeout=35000){const start=Date.now();let error;
 while(Date.now()-start<timeout){try{const value=await fn();if(value)return value;}catch(e){error=e;}await delay(150);}
 throw Error('TIMEOUT '+desc+(error?' :: '+error.message:''));
}
async function main(){
 const browserExe=candidates.find(fs.existsSync);
 insist(browserExe,'Chrome/Edge ausente: browser headless não pode ser validado');
 insist(fs.existsSync(sample),'Amostra FBX com malha ausente no pack do GitHub');
 const temp=await fsp.mkdtemp(path.join(os.tmpdir(),'movalab-browser-'));
 const workspace=path.join(temp,'workspace'),profile=path.join(temp,'profile');
 let server,browser,ws;let seq=0;const errors=[],pending=new Map();
 try{
  const sub=path.join(workspace,'sources','MixamoOriginalsPack','AnimationsWithSkin','Start Pack');
  await fsp.mkdir(sub,{recursive:true});await fsp.copyFile(sample,path.join(sub,path.basename(sample)));
  const p=await port();const base='http://127.0.0.1:'+p;
  server=spawn(process.execPath,[path.join(root,'tools/movalab/service/server.cjs')],
    {env:{...process.env,MOVALAB_PORT:String(p),MOVALAB_WORKSPACE:workspace},stdio:'ignore',windowsHide:true});
  await until(async()=>{const r=await fetch(base+'/api/health');return r.ok;},'Servidor HTTP');
  await fsp.mkdir(profile);
  browser=spawn(browserExe,['--headless=new','--no-sandbox','--disable-extensions','--no-first-run',
    '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage',
    '--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
  const marker=path.join(profile,'DevToolsActivePort');
  await until(()=>fs.existsSync(marker),'Chrome CDP');
  const debugPort=(await fsp.readFile(marker,'utf8')).split('\n')[0];
  const target=await until(async()=>{const r=await fetch('http://127.0.0.1:'+debugPort+'/json');
    return (await r.json()).find(t=>t.type==='page');},'Chrome target');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.id){const d=pending.get(m.id);if(d){pending.delete(m.id);m.error?d.reject(Error(m.error.message)):d.resolve(m.result);}return;}
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);
    if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push('HTTP '+m.params.response.status+' '+m.params.response.url);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result?.value;
  };
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1420,height:850,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base+'/'});
  const state=await until(async()=>{
    return evaluate("(() => { const c=document.querySelector('#three-stage canvas'); const n=document.querySelector('#motion-name')?.textContent; const title=document.querySelector('#viewport-title')?.textContent; return c && n?.includes('Start Walking-com-skin') && title?.includes('PERSONAGEM 3D RIGADO') ? {name:n,title,canvasWidth:c.width,canvasHeight:c.height,buttons:document.querySelectorAll('[data-view]').length} : null; })()");
  },'visualização 3D real de FBX com skin',17000).catch(async err=>{
    const diagnostic=await evaluate("({ready:document.readyState,title:document.querySelector('#viewport-title')?.textContent,motion:document.querySelector('#motion-name')?.textContent,notice:document.querySelector('#rig-warning')?.textContent,toast:document.querySelector('#toast')?.textContent,canvas:!!document.querySelector('#three-stage canvas'),files:document.querySelectorAll('.motion-card').length,html:document.body.textContent.slice(-400)})").catch(e=>({evaluationFailed:e.message}));
    throw Error(err.message+' | '+JSON.stringify(diagnostic)+' | Browser console: '+JSON.stringify(errors.slice(0,12)));
  });
  insist(state.canvasWidth>100&&state.canvasHeight>100,'Viewport WebGL sem dimensões');
  insist(state.buttons===3,'Faltam modos Malha/Ossos/Malha+Ossos');
  await evaluate("document.querySelector('[data-view=\"both\"]').click();document.querySelector('#play').click();");
  insist(errors.length===0,'Erros JS/browser: '+JSON.stringify(errors.slice(0,5)));
  console.log('MovaLab browser real FBX PASS: '+JSON.stringify(state));
 }finally{
  try{ws?.close();}catch{}
  try{server?.kill();browser?.kill();}catch{}
  await delay(300);await fsp.rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:200});
 }
}
main().catch(e=>{console.error('MovaLab Chrome 3D FAIL:',e.stack);process.exitCode=1;});
