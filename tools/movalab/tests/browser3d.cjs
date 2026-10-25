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
        const freshSource=await state.player.load('/api/motions/'+state.motionId+'/raw'),freshTarget=await state.player.load('/api/assets/raw?path='+encodeURIComponent(state.characterPath));
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
  try{server?.kill();browser?.kill();}catch{}
  await delay(300);await fsp.rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:200});
 }
}
main().catch(e=>{console.error('MovaLab Chrome 3D FAIL:',e.stack);process.exitCode=1;});
