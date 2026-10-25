'use strict';
/** Headless Chrome QA: 3D character FBX rendered with Three.js. */
const fs=require('node:fs'),fsp=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const root=path.resolve(__dirname,'../../..');
const sample=path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx');
const capturePrefix=process.env.MOVALAB_CAPTURE;
const fullPack=process.env.MOVALAB_ALL_ASSETS==='1';
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
  if(fullPack)await fsp.cp(path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack'),path.join(workspace,'sources/MixamoOriginalsPack'),{recursive:true});
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
  const screenshot=async suffix=>{
    if(!capturePrefix)return;
    insist(/^\d{3}-[a-z0-9-]+$/.test(capturePrefix),'Prefixo de captura inválido');
    const output=path.join(root,'capturas/timelapse',capturePrefix+(suffix?'-'+suffix:'')+'.jpg');
    insist(!fs.existsSync(output),'Captura já existe: '+output);
    await delay(200);
    const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:90});
    await fsp.writeFile(output,Buffer.from(shot.data,'base64'));
  };
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1420,height:850,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base+'/'});
  if(fullPack){
    await until(()=>evaluate('state.motions.length>1&&Boolean(state.player)'),'Catálogo completo');
    await evaluate("selectMotion(state.motions.find(m=>m.filename==='Start Walking-com-skin-mixamo.fbx').id)");
  }
  const state=await until(async()=>{
    return evaluate("(() => { const c=document.querySelector('#three-stage canvas'); const n=document.querySelector('#motion-name')?.textContent; const title=document.querySelector('#viewport-title')?.textContent; return c && n?.includes('Start Walking-com-skin') && title?.includes('PERSONAGEM 3D RIGADO') ? {name:n,title,canvasWidth:c.width,canvasHeight:c.height,buttons:document.querySelectorAll('[data-view]').length} : null; })()");
  },'visualização 3D real de FBX com skin',17000).catch(async err=>{
    const diagnostic=await evaluate("({ready:document.readyState,title:document.querySelector('#viewport-title')?.textContent,motion:document.querySelector('#motion-name')?.textContent,notice:document.querySelector('#rig-warning')?.textContent,toast:document.querySelector('#toast')?.textContent,canvas:!!document.querySelector('#three-stage canvas'),files:document.querySelectorAll('.motion-card').length,html:document.body.textContent.slice(-400)})").catch(e=>({evaluationFailed:e.message}));
    throw Error(err.message+' | '+JSON.stringify(diagnostic)+' | Browser console: '+JSON.stringify(errors.slice(0,12)));
  });
  insist(state.canvasWidth>100&&state.canvasHeight>100,'Viewport WebGL sem dimensões');
  insist(state.canvasHeight<850,'Catálogo esticou o palco além da tela');
  insist(state.buttons===3,'Faltam modos Malha/Ossos/Malha+Ossos');
  await evaluate("document.querySelector('[data-view=\"both\"]').click();document.querySelector('#play').click();");
  const catalog=await evaluate(`(async()=>{
    document.querySelector('#motion-category').value='Caminhada';
    document.querySelector('#motion-favorite').checked=true;await saveMetadata();
    await refreshCatalog();
    if(!activeMotion().favorite||activeMotion().category!=='Caminhada')throw Error('Metadados não persistiram');
    state.category='Dança';listMotions();
    if(filterMotions().some(m=>m.id===state.motionId))throw Error('Filtro de categoria');
    state.category='all';state.favorites=true;listMotions();
    if(filterMotions().some(m=>!m.favorite))throw Error('Filtro de favoritas');
    state.favorites=false;listMotions();
    state.playing=false;state.time=.3;state.player.setTime(.3);
    return {motions:state.motions.length,characters:state.assets.filter(a=>a.category==='personagem').length,
      legacy:state.assets.filter(a=>a.legacy).length};
  })()`);
  await screenshot('');
  const playback=await evaluate(`(()=>{
    const p=state.player;state.playing=false;state.loop=false;p.setLoop(false);
    p.setTime(p.duration);
    if(Math.abs(p.action.time-p.duration)>1e-5)throw Error('Fim sem loop não preservado');
    p.setTime(.2);if(Math.abs(p.action.time-.2)>1e-5)throw Error('Scrub após fim travado');
    p.setWireframe(true);let wire=false;p.active.traverse(o=>{if(o.isMesh)wire=wire||Boolean(o.material?.wireframe);});
    if(!wire)throw Error('Aramado inativo');p.setWireframe(false);
    p.cameraView('front');p.frameCamera();
    return {endpoint:true,scrubAfterEnd:true,wireframe:true};
  })()`);
  const combinations=[];
  if(fullPack){
    for(const name of ['kid','cabecudo']){
      const result=await evaluate(`(async()=>{
        const m=state.motions.find(m=>m.relativeSource?.endsWith('Animations/Start Pack/Start Walking.fbx'));
        const a=state.assets.find(a=>a.name===${JSON.stringify(name+'.fbx')});
        // Deliberately concurrent: selecting a character must not cancel the motion request.
        await Promise.all([selectMotion(m.id),selectCharacter(a.path)]);
        state.playing=false;state.time=1;state.player.setTime(1);
        const p=state.player,r=p.retarget;
        if(!r)throw Error('Retarget não ativo');
        let error=0;
        for(const e of r.target.bones)if(e!==r.target.byName.get('hips'))error=Math.max(error,e.bone.position.distanceTo(r.target.local.get(e.bone).position));
        if(error>1e-6)throw Error('Comprimentos do destino alterados');
        if(r.report.missing.length)throw Error('Juntas essenciais ausentes');
        p.frameCamera();
        return {name:${JSON.stringify(name)},report:r.report,maxPositionError:error,renderer:p.renderer.info.memory};
      })()`);
      combinations.push(result);await screenshot(name);
    }
  }
  for(const width of [390,740]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
    insist(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Layout transborda em '+width);
  }
  if(fullPack){
    await send('Emulation.setDeviceMetricsOverride',{width:1420,height:850,deviceScaleFactor:1,mobile:false});
    const motionReport=await evaluate(`(async()=>{
      const p=state.player,files=['walking.fbx','standard run.fbx','idle.fbx'],report=[];
      for(const filename of files){
        const m=state.motions.find(m=>m.relativeSource?.includes('Male Locomotion Pack/')&&m.filename===filename);
        if(!m)throw Error('Clipe de QA ausente: '+filename);
        await selectMotion(m.id);state.playing=false;state.time=.3;p.setTime(.3);
        const initial=p.retarget.target.byName.get('lefthand').bone.matrixWorld.elements.slice();
        state.time=Math.min(.8,p.duration*.8);p.setTime(state.time);
        const later=p.retarget.target.byName.get('lefthand').bone.matrixWorld.elements;
        const delta=Math.max(...later.map((v,i)=>Math.abs(v-initial[i])));
        if(delta<1e-5)throw Error('Pose estática em '+filename);
        report.push({filename,duration:p.duration,delta});
      }
      p.setPlacement({yaw:90,x:10,z:20});
      if(Math.abs(p.stageGroup.rotation.y-Math.PI/2)>1e-6)throw Error('Orientação não aplicada');
      p.setPlacement({yaw:0,x:0,z:0});p.setInPlace(true);p.setTime(.1);
      const rest=p.retarget.target.byName.get('hips'),hip=rest.bone;
      const e=hip.matrixWorld.elements;
      if(Math.abs(e[12]-rest.position.x)>1e-5||Math.abs(e[14]-rest.position.z)>1e-5)throw Error('No lugar falhou');
      p.setInPlace(false);
      for(let i=0;i<30;i++)await new Promise(requestAnimationFrame);
      const count=p.renderer.info.render.frame;
      for(let i=0;i<12;i++)await new Promise(requestAnimationFrame);
      if(p.renderer.info.render.frame-count>1)throw Error('Preview pausado repinta continuamente');
      return {clips:report,pausedRedraws:p.renderer.info.render.frame-count};
    })()`);
    console.log('MovaLab motion/controls PASS: '+JSON.stringify(motionReport));
    if(capturePrefix){
      const data=await evaluate(`(async()=>{
        const output=document.createElement('canvas');output.width=1600;output.height=900;
        const ctx=output.getContext('2d');ctx.fillStyle='#1c2023';ctx.fillRect(0,0,1600,900);
        const files=['walking.fbx','standard run.fbx','idle.fbx'];
        for(let row=0;row<3;row++){
          const m=state.motions.find(m=>m.relativeSource?.includes('Male Locomotion Pack/')&&m.filename===files[row]);
          await selectMotion(m.id);state.playing=false;state.player.setTime(m.duration*.5);state.player.frameCamera();
          for(let col=0;col<4;col++){
            state.player.setTime(m.duration*col/4);state.player.renderer.render(state.player.scene,state.player.camera);
            ctx.drawImage(state.player.renderer.domElement,col*400,row*300+24,400,269);
            ctx.fillStyle='#cce5b4';ctx.font='14px system-ui';ctx.fillText(files[row]+' · '+(m.duration*col/4).toFixed(2)+'s',col*400+12,row*300+20);
          }
        }
        return output.toDataURL('image/jpeg',.92).split(',')[1];
      })()`);
      const file=path.join(root,'capturas/timelapse',capturePrefix+'-movimentos.jpg');
      insist(!fs.existsSync(file),'Tira já existe');await fsp.writeFile(file,Buffer.from(data,'base64'));
    }
  }
  insist(errors.length===0,'Erros JS/browser: '+JSON.stringify(errors.slice(0,5)));
  console.log('MovaLab browser real FBX PASS: '+JSON.stringify({state,catalog,playback,combinations}));
 }finally{
  try{ws?.close();}catch{}
  try{server?.kill();browser?.kill();}catch{}
  await delay(300);await fsp.rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:200});
 }
}
main().catch(e=>{console.error('MovaLab Chrome 3D FAIL:',e.stack);process.exitCode=1;});
