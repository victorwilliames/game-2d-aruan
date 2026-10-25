'use strict';
// Read-only local fixture: no upload, no copied FBXs, Chrome exclusively headless.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),app=path.join(root,'tools/movalab/app'),data=process.env.MIXAMO_ROOT;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 if(!data)throw Error('Set MIXAMO_ROOT to the existing sources; this test never downloads them');
 const executable=[process.env.ARUAN_BROWSER,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(fs.existsSync);if(!executable)throw Error('Headless browser unavailable');
 const prefix=process.env.MOVALAB_CAPTURE||'055-mixamo-perfis';if(!/^\d{3}-[a-z0-9-]+$/.test(prefix))throw Error('Invalid capture prefix');const output=path.join(root,'capturas/timelapse',prefix+'-galeria.jpg');if(fs.existsSync(output))throw Error('Capture already exists');
 const tempRoot=path.join(root,'tools/mixamo/temp');fs.mkdirSync(tempRoot,{recursive:true});const profile=fs.mkdtempSync(path.join(tempRoot,'profile-headless-'));let browser,ws;const errors=[],pending=new Map();let seq=0;
 const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost'),p=decodeURIComponent(url.pathname);let file;
  if(p==='/')file=path.join(__dirname,'profile-gallery.html');
  else if(p==='/asset/Walking.fbx')file=path.join(data,'animation_motion/Walking.fbx');
  else if(p==='/asset/Y_Bot.fbx')file=path.join(data,'character_refined/Y_Bot.fbx');
  else for(const [prefix,base]of [['/app/',app],['/three/',path.join(app,'node_modules/three')]])if(p.startsWith(prefix)){const relative=p.slice(prefix.length);if(relative.includes('..')||relative.includes('\\'))throw Error('Invalid fixture path');file=path.resolve(base,relative);if(!file.startsWith(path.resolve(base)+path.sep))throw Error('Outside fixture');}
  if(!file||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end();}});
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=spawn(executable,['--headless=new','--no-sandbox','--disable-extensions','--disable-background-networking','--no-first-run','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
  const marker=path.join(profile,'DevToolsActivePort'),deadline=Date.now()+30000;while(!fs.existsSync(marker)){if(Date.now()>deadline||browser.exitCode!==null)throw Error('Browser launch failed');await delay(100);}
  const debugPort=fs.readFileSync(marker,'utf8').split('\n')[0],targets=await (await fetch('http://127.0.0.1:'+debugPort+'/json')).json();ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(p)m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:base});
  const end=Date.now()+45000;let result;while(!(result=await evaluate('window.__profileGalleryResult'))){if(errors.length||Date.now()>end)throw Error('Gallery failed '+errors.join('\n'));await delay(100);}
  for(const t of [0,.3,.6,1.1])await evaluate(`window.sampleProfiles(${t})`);await evaluate('window.sampleProfiles(.6)');if(errors.length)throw Error(errors.join('\n'));
  const image=await send('Page.captureScreenshot',{format:'jpeg',quality:94,fromSurface:true});fs.writeFileSync(output,Buffer.from(image.data,'base64'));fs.writeFileSync(path.join(root,'tools/movalab/docs/profile-browser-audit.json'),JSON.stringify({result,consoleErrors:errors,capture:path.basename(output),renderer:'Chrome headless SwiftShader',imagesDecoded:'Y Bot has no texture decode requirement; no other imported characters in this gallery'},null,2)+'\n');
  console.log(JSON.stringify({result,capture:output,consoleErrors:0}));await send('Browser.close');
 }finally{
  ws?.close();if(browser&&browser.exitCode===null){await Promise.race([new Promise(r=>browser.once('exit',r)),delay(2000)]);if(browser.exitCode===null)browser.kill();}await new Promise(r=>server.close(r));
  const resolved=path.resolve(profile);if(path.dirname(resolved)!==path.resolve(tempRoot)||!path.basename(resolved).startsWith('profile-headless-'))throw Error('Unsafe own-profile cleanup');fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 }
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
