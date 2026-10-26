'use strict';
/** Headless Chrome QA: 3D character FBX rendered with Three.js. */
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),net=require('node:net');
const {spawn,spawnSync}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const root=path.resolve(__dirname,'../../..');
const sample=path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx');
const capturePrefix=process.env.MOVALAB_CAPTURE;
const fullPack=process.env.MOVALAB_ALL_ASSETS==='1';
const candidates=[process.env.ARUAN_BROWSER,'/usr/bin/google-chrome','/usr/bin/chromium',
'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
function insist(value,desc){if(!value)throw Error(desc);}
async function port(){const s=net.createServer();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));const n=s.address().port;await new Promise(resolve=>s.close(resolve));return n;}
async function linkPack(source,destination){await fsp.mkdir(destination,{recursive:true});for(const e of await fsp.readdir(source,{withFileTypes:true})){if(e.isSymbolicLink())continue;const from=path.join(source,e.name),to=path.join(destination,e.name);if(e.isDirectory())await linkPack(from,to);else if(e.isFile())try{await fsp.link(from,to);}catch(error){if(error.code!=='EEXIST')throw error;}}}
async function until(fn,desc,timeout=35000){const start=Date.now();let error;
 while(Date.now()-start<timeout){try{const value=await fn();if(value)return value;}catch(e){error=e;}await delay(150);}
 throw Error('TIMEOUT '+desc+(error?' :: '+error.message:''));
}
async function main(){
 const browserExe=candidates.find(fs.existsSync);
 insist(browserExe,'Chrome/Edge ausente: browser headless não pode ser validado');
 insist(fs.existsSync(sample),'Amostra FBX com malha ausente no pack do GitHub');
 const hierarchyOnly=process.env.MOVALAB_HIERARCHY==='1';
 const tempRoot=path.join(root,'tools/mixamo/temp');await fsp.mkdir(tempRoot,{recursive:true});
 const temp=await fsp.mkdtemp(path.join(tempRoot,'movalab-browser-'));
 const workspace=path.join(temp,'workspace'),profile=path.join(temp,'profile');
 let server,browser,ws,gameServer;let seq=0;const errors=[],pending=new Map(),contexts=new Map(),devTimings=new Map();
 try{
  const sub=path.join(workspace,'sources','MixamoOriginalsPack','AnimationsWithSkin','Start Pack');
  await fsp.mkdir(sub,{recursive:true});await fsp.link(sample,path.join(sub,path.basename(sample)));
  if(fullPack)await linkPack(path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack'),path.join(workspace,'sources/MixamoOriginalsPack'));
  const p=await port();const base='http://127.0.0.1:'+p;
  server=spawn(process.execPath,[path.join(root,'tools/movalab/service/server.cjs')],
    {env:{...process.env,MOVALAB_PORT:String(p),MOVALAB_WORKSPACE:workspace},stdio:'ignore',windowsHide:true});
  await until(async()=>{const r=await fetch(base+'/api/health');return r.ok;},'Servidor HTTP');
  await fsp.mkdir(profile);
  browser=spawn(browserExe,['--headless=new','--no-sandbox','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--no-first-run',
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
    if(m.method==='Runtime.executionContextCreated'&&m.params.context.auxData?.isDefault)contexts.set(m.params.context.auxData.frameId,m.params.context.id);
    if(m.method==='Runtime.executionContextsCleared')contexts.clear();
    if(m.id){const d=pending.get(m.id);if(d){pending.delete(m.id);m.error?d.reject(Error(m.error.message)):d.resolve(m.result);}return;}
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);
    if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push('HTTP '+m.params.response.status+' '+m.params.response.url);
    if(process.env.MOVALAB_DEV==='1'&&m.method==='Network.requestWillBeSent'&&m.params.request.url.includes('/api/mixamo/'))devTimings.set(m.params.requestId,{url:m.params.request.url,start:m.params.timestamp});
    if(process.env.MOVALAB_DEV==='1'&&m.method==='Network.responseReceived'&&devTimings.has(m.params.requestId)){const t=devTimings.get(m.params.requestId);t.elapsedMs=(m.params.timestamp-t.start)*1000;t.serverTiming=m.params.response.headers['Server-Timing'];t.networkTiming=m.params.response.timing;}
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
    if(process.env.MOVALAB_WORKFLOW_ONLY==='1'&&suffix!=='gatilhos')return;
      if(process.env.MOVALAB_EDITOR_ONLY==='1'&&suffix!=='editor')return;
    if(process.env.MOVALAB_PROXY_ONLY==='1'&&suffix!=='aruan-proxy')return;
      if(process.env.MOVALAB_LAB_ONLY==='1'&&!['laboratorio','editor'].includes(suffix))return;
    insist(/^\d{3}-[a-z0-9-]+$/.test(capturePrefix),'Prefixo de captura inválido');
    const output=path.join(root,'capturas/timelapse',capturePrefix+(suffix?'-'+suffix:'')+'.jpg');
    insist(!fs.existsSync(output),'Captura já existe: '+output);
    await delay(200);
      const size=suffix==='editor'?await evaluate('({width:innerWidth,height:document.documentElement.scrollHeight})'):null;
      const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:90,...(size?{captureBeyondViewport:true,clip:{x:0,y:0,...size,scale:1}}:{})});
    await fsp.writeFile(output,Buffer.from(shot.data,'base64'));
  };
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1420,height:850,deviceScaleFactor:1,mobile:false});
  if(process.env.MOVALAB_DEV==='1'||process.env.MOVALAB_DEV_GATE_ONLY==='1'){
    const gp=await port(),game='http://127.0.0.1:'+gp;gameServer=spawn(process.execPath,[path.join(root,'server.cjs')],{env:{...process.env,PORT:String(gp)},stdio:'ignore',windowsHide:true});await until(async()=>{const r=await fetch(game);return r.ok;},'Own game server');
    await send('Page.navigate',{url:game});await until(()=>evaluate('Boolean(window.Pilot)&&MovaGame.ready'),'Public game');insist(!await evaluate("Boolean(document.querySelector('#dev-catalog-open'))"),'DEV UI leaked outside opt-in');
    await send('Page.navigate',{url:game+'/?dev=1&movalab='+encodeURIComponent(base)});await until(()=>evaluate("Boolean(window.Pilot)&&MovaGame.ready&&Boolean(document.querySelector('#dev-catalog-open'))"),'DEV button');
    await evaluate("document.querySelector('#dev-catalog-open').click()");await until(()=>evaluate("document.querySelector('#dev-catalog-dialog').open&&Game.paused&&Input.suspended"),'Paused DEV modal');
    let devContext;const dev=async expression=>{if(!devContext){const tree=await send('Page.getFrameTree'),child=tree.frameTree.childFrames?.find(f=>f.frame.url===base+'/dev-catalog.html');if(!child||!contexts.get(child.frame.id))throw Error('DEV frame context not ready');devContext=contexts.get(child.frame.id);}const r=await send('Runtime.evaluate',{contextId:devContext,expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
    await until(async()=>{const value=await dev("({rows:document.querySelector('#results').children.length,text:document.querySelector('#status').textContent})");return value?.rows||value?.text&&value.text!=='Conectando ao catálogo local…';},'DEV catalogue mounted',90000).catch(async e=>{throw Error(e.message+' '+JSON.stringify({dom:await dev("({text:document.querySelector('#status').textContent,loaded,offset,generation:load.generation})").catch(e=>e.message),tree:await send('Page.getFrameTree'),contexts:[...contexts],errors}));});
    const snapshot=()=>evaluate("JSON.stringify({t:Game.t,hits:Game.hits,pos:Player.pos,vel:Player.vel,state:Player.state,resources:Player.resources,enemy:Pilot.enemy&&{hp:Pilot.enemy.hp,state:Pilot.enemy.enemyState,pos:Pilot.enemy.pos},pending:Player.pending})");
    const before=await snapshot();
    insist(await evaluate("(()=>{const old=Object.getOwnPropertyDescriptor(navigator,'getGamepads'),focused=Input.focused,pad={index:0,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};try{Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});Input.focused=true;Input.pollGamepad();pad.buttons[9]={pressed:true,value:1};Input.pollGamepad();return Game.paused&&Input.suspended&&Input.modalActive&&Input.pad.neutral;}finally{if(old)Object.defineProperty(navigator,'getGamepads',old);else delete navigator.getGamepads;Input.disconnectPad();Input.focused=focused;}})()"),'Gamepad Menu unpaused DEV simulation');
    let previewReport={gateOnly:true};
    if(process.env.MOVALAB_DEV==='1'){
      await dev("document.querySelector('#search').value='Punching';load()");await until(()=>dev("[...document.querySelectorAll('#results .motion p')].some(p=>p.textContent.startsWith('Punching.fbx ·'))"),'Bilingual search');
      await dev("[...document.querySelectorAll('#results .motion')].find(a=>a.querySelector('p').textContent.startsWith('Punching.fbx ·')).querySelector('button').click()");await until(()=>dev('Boolean(clip)&&mounted'),'Prepared combat preview').catch(async e=>{throw Error(e.message+' '+JSON.stringify(await dev("({status:document.querySelector('#status').textContent,details:document.querySelector('#details').textContent,mounted,clip:clip?.name,rows:document.querySelector('#results').innerText.slice(0,1000)})")));});await delay(1100);
      previewReport=await dev("({name:clip.name,time,duration:clip.duration,loaded,playing,renderReady:document.querySelector('#canvas').contentWindow.document.querySelector('canvas').width>100})");insist(previewReport.time>0&&previewReport.renderReady,'Preview did not animate');
      const assignment=await dev("(async()=>{const m=(await api('/api/mixamo/catalog?q=Punching')).motions.find(m=>m.filename==='Punching.fbx'),validation=await api('/api/mixamo/motions/'+m.id+'/validate'),a=await api('/api/mixamo/assign',{id:m.id,slot:'action',key:'KeyC',pad:'PadY'});if(!validation.integrityVerifiedNow||a.runtimeChanged||a.assignment.gameplayIntegrated||a.assignment.visuallyApproved)throw Error('Invalid staged assignment');return a;})()");
      insist(assignment.assignment.status==='draft','Assignment published gameplay');insist(!fs.existsSync(path.join(workspace,'game-bindings.json')),'Draft overwrote runtime bindings');
      const saved=JSON.parse(await fsp.readFile(path.join(workspace,'library.json'),'utf8'));insist(saved.externalSources.mixamo.assignments.length===1,'Draft not persisted');previewReport.assignment=assignment.assignment;
      const cli=spawnSync(process.execPath,[path.join(root,'tools/movalab/scripts/mixamo.cjs'),'assign',assignment.assignment.motionId,'--slot','action','--key','KeyC','--pad','PadY','--service',base],{encoding:'utf8',windowsHide:true,timeout:20000});insist(cli.status===0,'CLI assignment failed: '+cli.stderr);const cliResult=JSON.parse(cli.stdout);insist(!cliResult.runtimeChanged&&cliResult.assignments.length===1,'CLI draft changed runtime or duplicated assignment');previewReport.cliAssignment=true;
      await dev("document.querySelector('#play').click();document.querySelector('#direction').value='6';document.querySelector('#direction').dispatchEvent(new Event('change'));document.querySelector('#speed').value='2';document.querySelector('#loop').checked=false;document.querySelector('#time').value='.2';document.querySelector('#time').dispatchEvent(new Event('input'))");
      insist(await dev("!playing&&Math.abs(time-.2)<.001&&document.querySelector('#direction').value==='6'"),'Preview controls failed');
      await screenshot('dev-catalogo');
    }
    insist(before===await snapshot(),'Combat preview changed game state');insist(!await evaluate('Pilot.attack()'),'Attack leaked while preview paused');
    await evaluate("document.querySelector('#dev-catalog-close').click()");await until(()=>evaluate("!Game.paused&&!Input.suspended&&!document.querySelector('#dev-catalog-dialog').open"),'Prior movement pause restored');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});await until(()=>evaluate('Math.hypot(...Player.vel)>1'),'Normal movement restored');await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
    await evaluate("setToggle('paused',true);document.querySelector('#dev-catalog-open').click();document.querySelector('#dev-catalog-close').click()");await until(()=>evaluate("Game.paused&&Input.suspended&&document.querySelector('#dev-catalog-dialog iframe').getAttribute('src')==='about:blank'"),'Pre-existing pause preserved');
    insist(!errors.length,'DEV errors: '+JSON.stringify(errors));const report={previewReport,gameStateUnchanged:true,publicGate:true,priorPauseRestored:true,normalMovementRestored:true,timings:[...devTimings.values()].filter(t=>Number.isFinite(t.elapsedMs)),errors};if(process.env.MOVALAB_DEV==='1')await fsp.writeFile(path.join(root,'tools/movalab/docs/mixamo-dev-browser.json'),JSON.stringify(report,null,2)+'\n');console.log('DEV catalogue PASS: '+JSON.stringify({motion:previewReport.name||'gate-only',gameStateUnchanged:true,publicGate:true,priorPauseRestored:true,normalMovementRestored:true,firstCatalogueMs:report.timings[0]?.elapsedMs,errors}));return;
  }
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
  if(process.env.MOVALAB_MODELS==='1'){
    const assets=await evaluate("state.assets.filter(a=>a.externalSource&&a.category==='personagem').map(a=>({path:a.path,name:a.name}))");insist(assets.length===19,'Exactly19 selected characters required');
    await evaluate("(async()=>{await selectMotion(state.motions.find(m=>m.externalSource&&m.filename==='Walking.fbx').id);await MovaLabProcedural.openPrepared(state.motionId);state.playing=false;globalThis.modelGallery=document.createElement('canvas');modelGallery.width=1800;modelGallery.height=2200;const c=modelGallery.getContext('2d');c.fillStyle='#17211f';c.fillRect(0,0,1800,2200);c.fillStyle='#dceacb';c.font='bold 22px system-ui';c.fillText('Mixamo Walking · Aruan + três proporções +19personagens · t=0,50s',18,30);globalThis.modelWarnings=[];const old=console.warn;console.warn=(...args)=>{modelWarnings.push(args.map(String).join(' '));old(...args);};})()");
    const targets=[{path:'aruan-proxy',name:'Aruan Proxy'},{path:'aruan-proxy:small',name:'Pequeno'},{path:'aruan-proxy:heavy',name:'Robusto'},{path:'aruan-proxy:tallMuscular',name:'Alto / musculoso'},...assets],results=[],failures=[];
    for(const [index,target]of targets.entries()){
      try{
        const result=await evaluate(`(async()=>{
          modelWarnings.length=0;const path=${JSON.stringify(target.path)},start=performance.now();document.querySelector('#lab-reference').value=path;await selectCharacter(path);
          const p=state.player,model=p.character;if(state.characterPath!==path||p.active!==model||!p.retarget)throw Error('Destination failed: '+document.querySelector('#rig-warning').textContent);
          const calibration=model.userData.bindCalibration;await selectCharacter(path);if(p.character!==model||p.character.userData.bindCalibration!==calibration)throw Error('Same destination reloaded/recalibrated unnecessarily');
          const {captureRest,normalize}=await import('/humanoid.js'),rest=captureRest(model);let maxLocalOffsetError=0,worstOffsetBone=null;
          for(const time of [0,.35,.7,1.05]){p._sampled=false;p.setTime(time);model.traverse(o=>{if(!o.matrixWorld.elements.every(Number.isFinite))throw Error('Nonfinite model pose');if(o.isBone&&normalize(o.name)!=='hips'){const neutral=rest.local.get(o),error=neutral?o.position.distanceTo(neutral.position):0;if(error>maxLocalOffsetError){maxLocalOffsetError=error;worstOffsetBone=o.name;}}});}
          state.time=.5;state.playing=false;p._sampled=false;p.setTime(.5);p.frameCamera();p.renderer.render(p.scene,p.camera);MovaLabProcedural.tick();
          const {Vector3}=await import('/vendor/three.module.js');p.camera.updateMatrixWorld(true);let meshes=0,vertices=0,materials=0,maxNDC=0;const textures=new Set();model.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;const attr=o.geometry.attributes.position;for(let i=0;i<attr.count;i+=Math.max(1,Math.floor(attr.count/100))){const v=o.getVertexPosition(i,new Vector3()).applyMatrix4(o.matrixWorld).project(p.camera);maxNDC=Math.max(maxNDC,Math.abs(v.x),Math.abs(v.y));}for(const m of Array.isArray(o.material)?o.material:[o.material]){materials++;for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}}});
          const decoded=[...textures].filter(t=>{const images=Array.isArray(t.image)?t.image:[t.image];return images.every(i=>i&&Number(i.width)>0&&Number(i.height)>0);}).length;
          if(!meshes||maxLocalOffsetError>1e-6||maxNDC>1)throw Error('Invalid mesh/local bone lengths/framing: '+worstOffsetBone+' / '+maxLocalOffsetError+' / '+maxNDC);
          const diagnostics=model.userData.previewDiagnostics,c=modelGallery.getContext('2d'),x=${index%5*360},y=${48+Math.floor(index/5)*425};c.fillStyle='#dceacb';c.font='16px system-ui';c.fillText(${JSON.stringify(target.name)},x+12,y+22);c.font='12px system-ui';c.fillText('Rig '+p.retarget.report.status+' · prévia '+diagnostics.status+' · '+decoded+'/'+textures.size+' mapas',x+12,y+44);
          const canvas=p.renderer.domElement,scale=Math.min(340/canvas.width,350/canvas.height);p.renderer.render(p.scene,p.camera);c.drawImage(canvas,x+(360-canvas.width*scale)/2,y+54,canvas.width*scale,canvas.height*scale);
          const pixels=c.getImageData(x,y+54,360,350).data;let visiblePixels=0;for(let i=0;i<pixels.length;i+=4){const hi=Math.max(pixels[i],pixels[i+1],pixels[i+2]),lo=Math.min(pixels[i],pixels[i+1],pixels[i+2]);if(hi>65&&hi-lo>30)visiblePixels++;}if(visiblePixels<100)throw Error('Empty model capture: '+visiblePixels);
          const cameraModes=[];for(const view of ['front','side','back']){p.cameraView(view);p.renderer.render(p.scene,p.camera);if(!p.camera.matrixWorld.elements.every(Number.isFinite))throw Error('Camera invalid');cameraModes.push(view);}const renderModes=[];for(const mode of ['mesh','skeleton','both']){p.modeSet(mode);p.renderer.render(p.scene,p.camera);renderModes.push(mode);}p.modeSet('mesh');
          return {name:${JSON.stringify(target.name)},path,meshes,vertices,materials,textures:textures.size,decodedTextures:decoded,visiblePixels,compatibility:p.retarget.report,previewDiagnostics:diagnostics,calibration:model.userData.bindCalibration||null,maxLocalOffsetError,maxNDC,reselectedSameInstance:true,cameraModes,renderModes,resourceFailures:model.userData.resourceFailures||[],warnings:modelWarnings.slice(),loadAndSampleMs:performance.now()-start,memory:{...p.renderer.info.memory}};
        })()`);
        results.push(result);console.log('Model '+JSON.stringify({name:result.name,status:result.compatibility.status,textures:result.textures,decoded:result.decodedTextures,repaired:result.calibration?.repaired}));
      }catch(e){failures.push({name:target.name,error:e.message});console.log('Model failed '+target.name+': '+e.message);}
    }
    const concurrentSelection=await evaluate("(async()=>{const a=state.assets.find(a=>a.externalSource&&a.name==='Claire.fbx');await Promise.all([selectCharacter(a.path),selectCharacter(a.path)]);if(state.characterPath!==a.path||state.player.active!==state.player.character)throw Error('Concurrent destination selection failed');return {sameURL:true,selected:a.name,activeMatches:true};})()");
    const report={schema:'mixamo-model-preview.v1',source:'animation_motion/Walking.fbx',results,failures,concurrentSelection,consoleErrors:errors};
    if(capturePrefix){const output=path.join(root,'capturas/timelapse',capturePrefix+'-galeria.jpg');insist(!fs.existsSync(output),'Model gallery already exists');const data=await evaluate("modelGallery.toDataURL('image/jpeg',.94).split(',')[1]");await fsp.writeFile(output,Buffer.from(data,'base64'));}
    await fsp.writeFile(path.join(root,'tools/movalab/docs/mixamo-model-preview.json'),JSON.stringify(report,null,2)+'\n');
    insist(!failures.length&&errors.length===0,'Model preview failures: '+JSON.stringify({failures,errors}));insist(results.every(r=>r.decodedTextures===r.textures&&!r.resourceFailures.length),'Missing model textures/resources');
    console.log('Models headless PASS: '+JSON.stringify({destinations:results.length,imported:19,partial:results.filter(r=>r.compatibility.status==='parcial').map(r=>r.name),repaired:results.filter(r=>r.calibration?.repaired).map(r=>r.name)}));return;
  }
  if(process.env.MOVALAB_CATALOG==='1'){
    const report=await evaluate(`(async()=>{const c=await api('/api/mixamo/catalog?limit=1');if(c.total!==2317||c.characters!==19||c.counts.sourcePresent!==2317)throw Error('Incomplete external catalogue');if(document.querySelectorAll('#motion-list .motion-card').length>80)throw Error('Unbounded DOM catalogue');document.querySelector('#search').value='pouso';document.querySelector('#search').dispatchEvent(new Event('input'));return {dataset:c.dataset,revision:c.revision,total:c.total,characters:c.characters,counts:c.counts,renderedRows:document.querySelectorAll('#motion-list .motion-card').length};})()`);
    await until(()=>evaluate("state.mixamoSearch?.query==='pouso'&&filterMotions().some(m=>m.filename==='Hard_Landing.fbx')"),'Busca PT-BR de pouso');
    report.search=await evaluate("filterMotions().slice(0,5).map(m=>({name:m.nameOriginal,descriptionEn:m.descriptionEn,state:m.pipeline.state}))");
    await evaluate("selectMotion(state.motions.find(m=>m.externalSource&&m.filename==='Hard_Landing.fbx').id)");
    await until(()=>evaluate("state.characterPath==='aruan-proxy'&&state.player.active?.userData.technicalProxy&&!state.loading"),'Fonte externa no Aruan Proxy');
    report.preview=await evaluate("(async()=>{state.playing=false;state.time=.5;state.player.setTime(.5);document.querySelector('#reset-camera').click();const {Vector3}=await import('/vendor/three.module.js');state.player.camera.updateMatrixWorld(true);let maxNDC=0;state.player.active.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/100))){const p=o.getVertexPosition(i,new Vector3()).applyMatrix4(o.matrixWorld).project(state.player.camera);maxNDC=Math.max(maxNDC,Math.abs(p.x),Math.abs(p.y));}});if(maxNDC>1)throw Error('Clipped current-pose framing: '+maxNDC);const m=activeMotion();if(!m.externalSource||m.pipeline.visuallyApproved||m.pipeline.gameplayIntegrated||!document.querySelector('#motion-state').disabled)throw Error('Invented approval/integration');return {filename:m.filename,source:m.relativeSource,character:state.characterPath,metadata:document.querySelector('#motion-status').textContent,maxNDC};})()");
    if(process.env.MOVALAB_CACHE==='1'){
      const cacheStart=Date.now();await evaluate("document.querySelector('#mixamo-preview').click()");
      await until(()=>evaluate("!document.querySelector('#procedural-section').hidden&&MovaLabProcedural.clip?.metadata?.sourceFile==='animation_motion/Hard_Landing.fbx'&&document.querySelector('#lab-canvas').contentWindow.document.querySelector('#canvas-notice').textContent.includes('Hard Landing')"),'Prepared external Canvas');
      report.preparedOpenMs=Date.now()-cacheStart;
      report.cachedCanvas=await evaluate("(()=>{state.playing=false;state.time=.8;MovaLabProcedural.tick();const w=document.querySelector('#lab-canvas').contentWindow,r=w.sampleConverted(.8,1,false).rig;return {joints:Object.keys(r.humanoid.joints).length,mode:MovaLabProcedural.clip.metadata.canvasRig,quality:MovaLabProcedural.clip.metadata.hierarchyQuality?.status,reference:state.characterPath};})()");
      insist(report.cachedCanvas.joints===65&&report.cachedCanvas.mode==='hierarchy','Cached Canvas reduced to scalar channels');
      await evaluate("switchTab(true);document.querySelector('#search').value='';state.search='';state.mixamoSearch=null;document.querySelector('#pipeline-filter').value='canvasPreviewAvailable';document.querySelector('#pipeline-filter').dispatchEvent(new Event('change'));");
      report.pipelineFilter=await evaluate("filterMotions().map(m=>({name:m.filename,ready:m.pipeline.canvasPreviewAvailable}))");insist(report.pipelineFilter.length>=8&&report.pipelineFilter.every(m=>m.ready),'Prepared-state filter is inaccurate');
      if(process.env.MOVALAB_PREPARE_SAMPLE){
        const name=process.env.MOVALAB_PREPARE_SAMPLE;await evaluate(`document.querySelector('#pipeline-filter').value='all';document.querySelector('#pipeline-filter').dispatchEvent(new Event('change'));selectMotion(state.motions.find(m=>m.externalSource&&m.filename===${JSON.stringify(name)}).id)`);
        await until(()=>evaluate('!state.loading'),'Unprepared source loaded');const start=Date.now();
        await evaluate("(document.querySelector('#mixamo-prepare').hidden?document.querySelector('#mixamo-preview'):document.querySelector('#mixamo-prepare')).click()");
        await until(()=>evaluate(`!document.querySelector('#procedural-section').hidden&&MovaLabProcedural.clip?.metadata?.sourceFile?.endsWith(${JSON.stringify('animation_motion/'+name)})&&document.querySelector('#lab-canvas').contentWindow.document.querySelector('#canvas-notice').textContent.includes(${JSON.stringify(name.replace(/\.fbx$/i,'').replaceAll('_',' '))})`),'Prepare-on-demand to Canvas',90000);
        report.onDemand={name,prepareToPreviewMs:Date.now()-start};report.afterPrepare=await evaluate("(async()=>{const c=await api('/api/mixamo/catalog?limit=1');state.time=1;state.playing=false;MovaLabProcedural.tick();return c.counts;})()");
      }
    }
    await screenshot('catalogo');insist(errors.length===0,JSON.stringify(errors));
    await fsp.writeFile(path.join(root,'tools/movalab/docs/mixamo-catalog-browser.json'),JSON.stringify(report,null,2)+'\n');console.log('Mixamo external catalogue browser PASS: '+JSON.stringify(report));return;
  }
  if(hierarchyOnly){
    await evaluate("document.querySelector('#go-procedural').click()");
    await until(()=>evaluate("!document.querySelector('#procedural-section').hidden&&Boolean(globalThis.MovaLabProcedural)"),'Laboratório completo');
    await evaluate("(async()=>{document.querySelector('#lab-canvas-mode').value='hierarchy';document.querySelector('#lab-loop').checked=false;await MovaLabProcedural.convert();document.querySelector('#lab-reference').value='aruan-proxy';document.querySelector('#lab-reference').dispatchEvent(new Event('change'));})()");
    await until(()=>evaluate("MovaLabProcedural.clip?.metadata?.quality?.renderer==='hierarchy'&&state.player.active?.userData.technicalProxy"),'Prévia completa e proxy real');
    const proof=await evaluate(`(async()=>{
      state.playing=false;state.time=.4;const w=document.querySelector('#lab-canvas').contentWindow;
      const canvas=w.document.querySelector('#aruan-canvas'),views=document.createElement('canvas');views.width=1600;views.height=820;const vc=views.getContext('2d');vc.fillStyle='#d8d8cb';vc.fillRect(0,0,1600,820);vc.fillStyle='#283c37';vc.font='bold 20px system-ui';vc.fillText('Canvas completo · mesmo instante · oito direções',16,28);
      const rasterHash=()=>{let h=2166136261;const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;for(const p of pixels){h^=p;h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
      const cases=[];for(let direction=0;direction<8;direction++){
        document.querySelector('#lab-direction').value=String(direction);MovaLabProcedural.tick();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const r=w.sampleConverted(.4,direction,false).rig;if(!r.humanoid||Object.keys(r.humanoid.joints).length!==65||r.hands.L.digits.length!==5||r.hands.R.digits.length!==5)throw Error('Subset/fingers missing');
        const parts=w.characterParts(r);if(!parts.every(p=>Number.isFinite(p.depth)))throw Error('Nonfinite Canvas geometry');cases.push({direction,parts:parts.length,head:r.head.o,rasterHash:rasterHash()});
        const x=direction%4*400,y=40+Math.floor(direction/4)*390;vc.fillStyle='#283c37';vc.font='14px system-ui';vc.fillText('Direção '+direction+' · t=0,40s',x+12,y+20);vc.drawImage(canvas,x,y+30,400,350);
      }
      const poses=document.createElement('canvas');poses.width=1920;poses.height=430;const pc=poses.getContext('2d');pc.fillStyle='#d8d8cb';pc.fillRect(0,0,1920,430);pc.fillStyle='#283c37';pc.font='bold 20px system-ui';pc.fillText('Canvas completo · seis instantes do FBX real',16,28);document.querySelector('#lab-direction').value='1';const timeline=[];
      for(const [i,ratio]of [0,.17,.34,.51,.68,.86].entries()){state.time=MovaLabProcedural.clip.duration*ratio;MovaLabProcedural.tick();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));timeline.push({time:state.time,rasterHash:rasterHash()});pc.fillStyle='#283c37';pc.font='14px system-ui';pc.fillText(state.time.toFixed(2)+'s',i*320+12,58);pc.drawImage(canvas,i*320,70,320,350);}
      state.time=.4;MovaLabProcedural.tick();state.player.setTime(.4);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const {Vector3}=await import('/vendor/three.module.js'),rest=state.player.retarget.target,hip=rest.byName.get('hips').bone.getWorldPosition(new Vector3()),raw=w.AruanHumanoid.solve(MovaLabProcedural.clip,.4,[0,0,0],0,{loop:false});let maxRawFKParityError=0;
      for(const e of rest.bones){const p=e.bone.getWorldPosition(new Vector3()),expected=[p.z-hip.z,p.x-hip.x,p.y],actual=raw.humanoid.joints[e.bone.name].position;maxRawFKParityError=Math.max(maxRawFKParityError,Math.hypot(...expected.map((v,i)=>v-actual[i])));}
      if(maxRawFKParityError>.005)throw Error('Raw FK parity '+maxRawFKParityError);
      return {report:{source:activeMotion().filename,quality:MovaLabProcedural.clip.metadata.quality,cases,timeline,maxRawFKParityError,canvasMode:MovaLabProcedural.clip.metadata.canvasRig,three:'Aruan Proxy SkinnedMesh',runtime:'Canvas 2D procedural'},views:views.toDataURL('image/jpeg',.94).split(',')[1],poses:poses.toDataURL('image/jpeg',.94).split(',')[1]};
    })()`);
    const report=proof.report;
    const loadCanvasClip=async clip=>{
      const savedId=await evaluate(`(async()=>{const saved=await api('/api/procedural/clips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify(clip)})});await MovaLabProcedural.refreshBank();return saved.clip.id;})()`);
      await evaluate(`(async()=>{document.querySelector('#lab-bank').value=${JSON.stringify(savedId)};await MovaLabProcedural.loadSaved();})()`);
      await until(()=>evaluate(`document.querySelector('#lab-canvas').contentWindow.document.querySelector('#canvas-notice').textContent.startsWith(${JSON.stringify(clip.name+' ·')})`),'Loaded Canvas '+clip.name);
    };
    const original=await evaluate('structuredClone(MovaLabProcedural.clip)'),changed=structuredClone(original);changed.name='Teste de blend completo';
    const fingerIndex=changed.humanoid.bones.findIndex(b=>b.name==='LeftHandIndex2');for(const frame of changed.humanoid.rotations)frame.splice(fingerIndex*4,4,0,0,Math.SQRT1_2,Math.SQRT1_2);
    await evaluate("document.querySelector('#lab-fade').value='.3';globalThis.transitionSheet=document.createElement('canvas');transitionSheet.width=1920;transitionSheet.height=440;const tp=transitionSheet.getContext('2d');tp.fillStyle='#d8d8cb';tp.fillRect(0,0,1920,440);tp.fillStyle='#283c37';tp.font='bold 18px system-ui';tp.fillText('Transições completas · Start Walking + dedo independente para teste de blend',12,24);");
    const positions=()=>evaluate("(()=>{const w=document.querySelector('#lab-canvas').contentWindow;return Object.values(w.sampleConverted(state.time,1,false).rig.humanoid.joints).map(j=>j.position);})()");
    const before=await positions();await loadCanvasClip(changed);const beginning=await positions();
    const gap=(a,b)=>Math.max(...a.map((v,i)=>Math.hypot(...v.map((n,k)=>n-b[i][k]))));
    const transitionProof={startGap:gap(before,beginning),interruptionGap:0,frames:[]};
    const transitionFrame=async(time,column,label)=>{
      await evaluate(`state.time=${time};state.playing=false;document.querySelector('#lab-direction').value='1';MovaLabProcedural.tick();`);
      await until(()=>evaluate(`Math.abs(Number(document.querySelector('#lab-canvas').contentWindow.document.querySelector('canvas').dataset.time)-${time})<1e-7`),'Transition Canvas frame');
      return evaluate(`(()=>{const w=document.querySelector('#lab-canvas').contentWindow,r=w.sampleConverted(${time},1,false),p=transitionSheet.getContext('2d');p.fillStyle='#283c37';p.font='14px system-ui';p.fillText(${JSON.stringify(label)}+' · '+Number(${time}).toFixed(3)+'s',${column*320+10},55);p.drawImage(w.document.querySelector('canvas'),${column*320},65,320,360);return {time:${time},alpha:r.sample.transition?.alpha??1,joints:Object.keys(r.rig.humanoid.joints).length};})()`);
    };
    for(const [i,t]of [0,.15,.3].entries())transitionProof.frames.push(await transitionFrame(t,i,'Fade completo'));
    const again=structuredClone(original);again.name='Teste de blend interrompido';await loadCanvasClip(again);await transitionFrame(.1,3,'Antes de interromper');
    const priorInterrupt=await positions(),interrupted=structuredClone(changed);interrupted.name='Teste após interrupção';await loadCanvasClip(interrupted);transitionProof.interruptionGap=gap(priorInterrupt,await positions());
    for(const [i,t]of [0,.15].entries())transitionProof.frames.push(await transitionFrame(t,i+4,'Após interrupção'));
    insist(transitionProof.startGap<1e-7&&transitionProof.interruptionGap<1e-7,'Discontinuous hierarchy transition '+JSON.stringify(transitionProof));
    report.transitions=transitionProof;
    if(process.env.MOVALAB_TRANSITION_CAPTURE){const prefix=process.env.MOVALAB_TRANSITION_CAPTURE;insist(/^\d{3}-[a-z0-9-]+$/.test(prefix),'Transition capture prefix invalid');const output=path.join(root,'capturas/timelapse',prefix+'.jpg');insist(!fs.existsSync(output),'Transition capture exists');const shot=await evaluate("transitionSheet.toDataURL('image/jpeg',.94).split(',')[1]");await fsp.writeFile(output,Buffer.from(shot,'base64'));}
    if(process.env.MOVALAB_PILOT==='1'){
      const data=process.env.MIXAMO_ROOT;insist(data,'MIXAMO_ROOT must reference existing pilot cache');
      const pilot=JSON.parse(await fsp.readFile(path.join(root,'tools/movalab/docs/hierarchy-pilot-report.json'),'utf8'));
      const {gunzipSync}=require('node:zlib');report.pilot=[];
      await evaluate("globalThis.pilotSheets=[0,1].map(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1440;const p=c.getContext('2d');p.fillStyle='#d8d8cb';p.fillRect(0,0,c.width,c.height);return c;});");
      for(const [index,result]of pilot.results.entries()){
        const cacheFile=path.resolve(data,result.cacheFile);insist(cacheFile.startsWith(path.resolve(data,'cache')+path.sep),'Cache outside source root');
        const clip=JSON.parse(gunzipSync(await fsp.readFile(cacheFile)));
        await loadCanvasClip(clip);
        const frames=[];
        for(const [column,ratio]of [.15,.4,.65,.85].entries()){
          const time=clip.duration*ratio;
          await evaluate(`state.playing=false;state.time=${time};document.querySelector('#lab-direction').value='1';MovaLabProcedural.tick();`);
          await until(()=>evaluate(`Math.abs(Number(document.querySelector('#lab-canvas').contentWindow.document.querySelector('canvas').dataset.time)-${time})<1e-7`),'Pilot frame');
          frames.push(await evaluate(`(()=>{const w=document.querySelector('#lab-canvas').contentWindow,r=w.sampleConverted(${time},1,false).rig,parts=w.characterParts(r);if(!parts.every(p=>Number.isFinite(p.depth)))throw Error('Nonfinite pilot geometry');const sheet=pilotSheets[${Math.floor(index/4)}],p=sheet.getContext('2d'),x=${column*400},y=${index%4*360};p.fillStyle='#283c37';p.font='14px system-ui';p.fillText(${JSON.stringify(clip.name)}+' · '+${time}.toFixed(2)+'s',x+10,y+22);p.drawImage(w.document.querySelector('canvas'),x,y+28,400,330);return {time:${time},parts:parts.length,joints:Object.keys(r.humanoid.joints).length};})()`));
        }
        report.pilot.push({name:result.name,frames});
      }
      const prefix=process.env.MOVALAB_PILOT_CAPTURE;
      if(prefix){insist(/^\d{3}-[a-z0-9-]+$/.test(prefix),'Pilot capture prefix invalid');for(let i=0;i<2;i++){
        const output=path.join(root,'capturas/timelapse',prefix+'-'+(i+1)+'.jpg');insist(!fs.existsSync(output),'Pilot capture exists');
        const bytes=await evaluate(`pilotSheets[${i}].toDataURL('image/jpeg',.94).split(',')[1]`);await fsp.writeFile(output,Buffer.from(bytes,'base64'));
      }}
    }
    if(capturePrefix){for(const [key,suffix]of [['views','8-direcoes'],['poses','sequencia']]){const output=path.join(root,'capturas/timelapse',capturePrefix+'-'+suffix+'.jpg');insist(!fs.existsSync(output),'Captura já existe');await fsp.writeFile(output,Buffer.from(proof[key],'base64'));}}
    if(process.env.MOVALAB_CANVAS_SHEETS_ONLY!=='1')await screenshot('comparacao');
    report.publishBlocked=await evaluate("(async()=>{await MovaPublish.show();return document.querySelector('#publish-apply').disabled;})()");insist(report.publishBlocked,'Full mode enabled gameplay before validation');insist(errors.length===0,JSON.stringify(errors));
    await fsp.writeFile(path.join(root,'tools/movalab/docs/humanoid-canvas-browser.json'),JSON.stringify(report,null,2)+'\n');
    console.log('Canvas completo browser PASS: '+JSON.stringify(report));return;
  }
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
    for(const name of ['kid','cabecudo','aruan-proxy']){
      const result=await evaluate(`(async()=>{
        const m=state.motions.find(m=>m.relativeSource?.endsWith('Animations/Start Pack/Start Walking.fbx'));
        const a=${JSON.stringify(name)}==='aruan-proxy'?{path:'aruan-proxy'}:state.assets.find(a=>a.name===${JSON.stringify(name+'.fbx')});
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
    if(capturePrefix&&process.env.MOVALAB_LAB_ONLY!=='1'&&process.env.MOVALAB_EDITOR_ONLY!=='1'&&process.env.MOVALAB_WORKFLOW_ONLY!=='1'){
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
  if(fullPack&&process.env.MOVALAB_LAB==='1'){
    await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
    const canvasResult=await evaluate(`(async()=>{
      const m=state.motions.find(m=>m.relativeSource?.includes('Male Locomotion Pack/')&&m.filename==='walking.fbx');
      await selectMotion(m.id);switchTab(false);
      const clip=await MovaLabProcedural.convert();
      if(!clip)throw Error(document.querySelector('#lab-status').textContent);
      state.playing=false;state.time=.35;
      for(let i=0;i<8;i++)await new Promise(requestAnimationFrame);
      const frame=document.querySelector('#lab-canvas').contentWindow;
      let maxFootClamp=0,maxArmClamp=0,maxSlip=0;const hashes=[];
      for(let dir=0;dir<8;dir++){
        document.querySelector('#lab-direction').value=dir;
        for(let i=0;i<12;i++){await new Promise(requestAnimationFrame);if(frame.document.querySelector('canvas').dataset.direction===String(dir))break;}
        if(frame.document.querySelector('canvas').dataset.direction!==String(dir))throw Error('Canvas não pintou a direção selecionada');
        hashes.push(frame.document.querySelector('canvas').toDataURL());
        for(let step=0;step<120;step++){
          const sample=frame.sampleConverted(step/120,dir,true),r=sample.rig;
          for(const [key,b]of Object.entries({legL:r.legL,legR:r.legR,armL:r.armL,armR:r.armR})){
            const distance=Math.hypot(...b.c.map((x,k)=>x-b.target[k]));
            if(key.startsWith('leg'))maxFootClamp=Math.max(maxFootClamp,distance);else maxArmClamp=Math.max(maxArmClamp,distance);
          }
          for(const [side,anchor]of Object.entries(sample.sample.contacts)){
            const facing=Math.PI/4+dir*Math.PI/4,p=[Math.cos(facing)*anchor[0]-Math.sin(facing)*anchor[1],Math.sin(facing)*anchor[0]+Math.cos(facing)*anchor[1],anchor[2]+5];
            maxSlip=Math.max(maxSlip,Math.hypot(...r[side==='L'?'legL':'legR'].c.map((x,k)=>x-p[k])));
          }
        }
      }
      if(maxFootClamp>1e-6||maxArmClamp>1e-6||maxSlip>1e-6)throw Error('IK/contato Canvas: '+JSON.stringify({maxFootClamp,maxArmClamp,maxSlip}));
      if(new Set(hashes).size<6)throw Error('Oito vistas não mudam o desenho');
      document.querySelector('#lab-direction').value='1';
      document.querySelector('#lab-save-clip').click();
      return {name:clip.name,frames:clip.times.length,contacts:clip.contacts.length,maxFootClamp,maxArmClamp,maxSlip,views:new Set(hashes).size};
    })()`);
    await until(()=>evaluate("Boolean(document.querySelector('#lab-bank').value)&&!document.querySelector('#lab-save-clip').disabled"),'Clipe persistido no serviço');
    await screenshot('laboratorio');
    const exportFolder=path.join(temp,'downloads');await fsp.mkdir(exportFolder);
    await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:exportFolder});
    await evaluate("document.querySelector('#lab-export').click()");
    await until(()=>fs.readdirSync(exportFolder).some(f=>f.endsWith('.json')),'Download JSON procedural');
    const downloaded=JSON.parse(await fsp.readFile(path.join(exportFolder,fs.readdirSync(exportFolder).find(f=>f.endsWith('.json'))),'utf8'));
    insist(downloaded.schema==='aruan-clip'&&downloaded.humanoid.bones.length===65,'Exportação procedural incompleta');
    console.log('MovaLab Canvas real/export PASS: '+JSON.stringify(canvasResult));
      const editor=await evaluate(`(async()=>{
        const input=document.querySelector('#lab-mapping select[data-slot="Hips"]');if(!input)throw Error('Editor de mapeamento ausente');
        const parent=state.player.motion.parent;input.value='@none';input.dispatchEvent(new Event('change'));
        if(await MovaLabProcedural.convert())throw Error('Rig sem quadril aceito');if(state.player.motion.parent!==parent)throw Error('Falha de perfil destacou a referência');
        const hipsName=state.player.motion.getObjectByProperty('isBone',true).name;
        input.value=hipsName;input.dispatchEvent(new Event('change'));
        document.querySelector('#lab-start').value='.2';document.querySelector('#lab-end').value='.8';document.querySelector('#lab-loop').checked=false;
        const c=await MovaLabProcedural.convert();if(!c||c.duration!==.6||c.root[0].some(v=>v!==0))throw Error('Recorte/raiz inválidos');
        if(c.metadata.mapping.Hips!==hipsName)throw Error('Perfil manual não exportado');
        state.time=.25;state.playing=false;for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
        if(Math.abs(state.player.position-.45)>1e-5)throw Error('Referência e Canvas fora do mesmo tempo');
        document.querySelector('#lab-marker-name').value='impacto';document.querySelector('#lab-marker-add').click();
        const snapshot=()=>{const values=[];state.player.active.updateMatrixWorld(true);state.player.active.traverse(o=>{if(o.isBone)values.push(...o.matrixWorld.elements);});return values;};
        const beforeReload=snapshot();
        document.querySelector('#lab-save-clip').click();
        for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,25));if(Boolean(document.querySelector('#lab-bank').value)&&!document.querySelector('#lab-save-clip').disabled)break;}
        await MovaLabProcedural.loadSaved();
        state.time=.25;state.playing=false;state.player._sampled=false;state.player.setTime(.45);const afterReload=snapshot();
        const previewError=Math.max(...beforeReload.map((v,i)=>Math.abs(v-afterReload[i])));if(previewError>1e-5)throw Error('Referência3D mudou ao reabrir banco: '+previewError);
        const {AnimationMixer,Vector3}=await import('three'),{HumanoidRetarget,captureRest}=await import('/humanoid.js');
        const freshSource=await state.player.load('/api/motions/'+state.motionId+'/raw'),freshTarget=state.characterPath==='aruan-proxy'?(await import('/aruan-proxy.js')).createAruanProxy():await state.player.load('/api/assets/raw?path='+encodeURIComponent(state.characterPath));
        captureRest(freshSource);captureRest(freshTarget);const freshRetarget=new HumanoidRetarget(freshSource,freshTarget),freshMixer=new AnimationMixer(freshSource);freshMixer.clipAction(freshSource.animations[0]).play();freshMixer.setTime(.45);freshRetarget.apply();
        const freshHip=freshRetarget.target.byName.get('hips').bone.getWorldPosition(new Vector3()),liveHip=state.player.retarget.target.byName.get('hips').bone.getWorldPosition(new Vector3());
        let pristineError=0;for(const [name,entry]of freshRetarget.target.byName){const actual=state.player.retarget.target.byName.get(name);if(actual)pristineError=Math.max(pristineError,entry.bone.getWorldPosition(new Vector3()).sub(freshHip).distanceTo(actual.bone.getWorldPosition(new Vector3()).sub(liveHip)));}
        if(pristineError>1e-5)throw Error('Referência diverge de carregamento limpo: '+pristineError);
        const loaded=MovaLabProcedural.clip;if(loaded.duration!==.6||!loaded.events.some(e=>e.name==='impacto'&&e.time===.25)||loaded.metadata.mapping.Hips!==hipsName)throw Error('Banco perdeu recorte/marcador/perfil');
        document.querySelector('#lab-markers li button:last-child').click();
        if(loaded.events.some(e=>e.name==='impacto'))throw Error('Marcador reaberto não foi removido');
        if(Math.abs(MovaLabProcedural.referenceTime(.3)-.5)>1e-6)throw Error('Offset do banco incorreto');
        return {duration:loaded.duration,trim:loaded.metadata.trim,saved:true,markerRoundtrip:true,previewError,pristineError};
      })()`);
      console.log('MovaLab editor/banco PASS: '+JSON.stringify(editor));
      const publish=await evaluate(`(async()=>{
        await MovaPublish.show();if(document.querySelector('#publish-section').hidden)throw Error('Etapa3 não abriu');
        if(document.querySelector('[data-step="4"]').getAttribute('aria-disabled')!=='true')throw Error('Etapa4 liberada sem aplicar');
        document.querySelector('#publish-slot').value='action';document.querySelector('#publish-slot').dispatchEvent(new Event('change'));
        document.querySelector('#publish-key').value='Space';document.querySelector('#publish-key').dispatchEvent(new Event('change'));
        if(!document.querySelector('#publish-apply').disabled||!document.querySelector('#publish-conflict').textContent.includes('Cambalhota'))throw Error('Conflito comSpace não bloqueou');
        document.querySelector('#publish-replace').checked=true;document.querySelector('#publish-replace').dispatchEvent(new Event('change'));
        document.querySelector('#publish-apply').click();
        for(let i=0;i<150;i++){await new Promise(r=>setTimeout(r,25));if(!document.querySelector('#publish-game').hidden)break;}
        const saved=await api('/api/game-bindings');if(!saved.bindings.some(b=>b.key==='Space'))throw Error('Gatilho não persistiu');
        if(document.querySelector('[data-step="4"]').getAttribute('aria-disabled')!=='false')throw Error('Etapa4 não liberou após aplicar');
        document.querySelector('#quality-high').checked=true;document.querySelector('#quality-high').dispatchEvent(new Event('change'));
        if(!state.player.renderer.shadowMap.enabled)throw Error('Qualidade não mudou');
        document.querySelector('#quality-high').checked=false;document.querySelector('#quality-high').dispatchEvent(new Event('change'));
        if(state.player.renderer.shadowMap.enabled||state.player.renderer.getPixelRatio()>1)throw Error('Modo leve não restaurado');
        return {applied:true,conflict:true,lowDefault:true};
      })()`);console.log('MovaLab publicação/gatilhos PASS: '+JSON.stringify(publish));
      await screenshot('gatilhos');
      await evaluate("document.querySelector('#publish-back').click()");
      await evaluate("state.time=.25;document.querySelector('#lab-marker-name').value='recuperação';document.querySelector('#lab-marker-add').click();document.querySelector('#toast').className='';document.querySelector('#lab-map-reset').closest('details').open=true");
      await screenshot('editor');
      for(const width of [390,740]){
        await send('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
        insist(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Editor transborda em '+width);
      }
  }
  if(fullPack&&process.env.MOVALAB_LEGACY==='1'){
    await evaluate("switchTab(true)");
    await until(()=>evaluate("!document.querySelector('#legacy-all').disabled"),'Conversor Python disponível');
    await evaluate("MovaLabLegacy.convert(state.assets.filter(a=>a.legacy&&!a.derived))");
    const legacyReport=await evaluate(`(async()=>{
      await refreshCatalog();
      const assets=state.assets.filter(a=>a.legacy);
      if(assets.length!==5||assets.some(a=>!a.derived||a.category!=='personagem'))throw Error('Legados ausentes ou classificados como clipes');
      const motion=state.motions.find(m=>m.relativeSource?.includes('Male Locomotion Pack/')&&m.filename==='walking.fbx');
      await selectMotion(motion.id);state.playing=false;state.time=.3;
      const reports=[];
      for(const asset of assets){
        await selectCharacter('legacy:'+asset.derived.id);state.playing=false;state.time=.3;state.player.setTime(.3);
        const p=state.player;
        if(p.active!==p.character)throw Error('Modelo convertido incompatível: '+asset.name+' / '+document.querySelector('#rig-warning').textContent);
        let meshes=0,bad=0,texturedMeshes=0;p.active.traverse(o=>{if(o.isMesh){meshes++;for(const material of Array.isArray(o.material)?o.material:[o.material])if(material?.map){if(!material.map.image?.width)bad++;else texturedMeshes++;}}if(!o.matrixWorld.elements.every(Number.isFinite))bad++;});
        if(!meshes||bad)throw Error('GLB sem malha finita');
        if(asset.derived.report.counts.images&&!texturedMeshes)throw Error('Imagem GLB não decodificada');
        reports.push({name:asset.name,meshes,texturedMeshes,compatibility:p.retarget?.report.status,units:p.active.userData.sourceUnits});
      }
      return reports;
    })()`);
    console.log('MovaLab cinco legados/GLB real PASS: '+JSON.stringify(legacyReport));
    if(capturePrefix){
      const output=path.join(root,'capturas/timelapse',capturePrefix+'-legados.jpg');insist(!fs.existsSync(output),'Captura de legados já existe');
      const data=await evaluate(`(async()=>{
        const out=document.createElement('canvas');out.width=1600;out.height=900;const ctx=out.getContext('2d');ctx.fillStyle='#1c2023';ctx.fillRect(0,0,1600,900);
        const assets=state.assets.filter(a=>a.legacy);
        for(let i=0;i<assets.length;i++){
          const a=assets[i];await selectCharacter('legacy:'+a.derived.id);state.playing=false;state.time=.3;state.player.setTime(.3);state.player.frameCamera();
          state.player.renderer.render(state.player.scene,state.player.camera);
          const x=i%3*1600/3,y=Math.floor(i/3)*450;ctx.drawImage(state.player.renderer.domElement,x,y+32,1600/3,358);
          ctx.fillStyle='#cce5b4';ctx.font='16px system-ui';ctx.fillText(a.name+' · FBX6100 → GLB',x+12,y+22);ctx.font='12px system-ui';ctx.fillText((a.derived.report.counts.images||0)+' texturas embutidas; movimento Mixamo aplicado',x+12,y+414);
        }
        return out.toDataURL('image/jpeg',.93).split(',')[1];
      })()`);await fsp.writeFile(output,Buffer.from(data,'base64'));
    }
  }
  insist(errors.length===0,'Erros JS/browser: '+JSON.stringify(errors.slice(0,5)));
  console.log('MovaLab browser real FBX PASS: '+JSON.stringify({state,catalog,playback,combinations}));
 }finally{
  try{ws?.close();}catch{}
  try{server?.kill();gameServer?.kill();browser?.kill();}catch{}
  await delay(300);insist(path.dirname(path.resolve(temp))===path.resolve(tempRoot)&&path.basename(temp).startsWith('movalab-browser-'),'Unsafe own fixture cleanup');await fsp.rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:200});
 }
}
main().catch(e=>{console.error('MovaLab Chrome 3D FAIL:',e.stack);process.exitCode=1;});
