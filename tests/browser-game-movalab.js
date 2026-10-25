(async()=>{
 const insist=(v,s)=>{if(!v)throw Error(s);};
 setToggle('paused',true);resetPlayer();Input.suspended=false;
 const files={idle:'mixamo-idle.aruan-clip.v1.json',walk:'mixamo-walking.aruan-clip.v1.json',run:'mixamo-run.aruan-clip.v1.json'};
 const bindings=Object.entries(files).map(([slot,filename])=>({slot,filename,name:'Mixamo '+slot,key:null}));
 bindings.push({slot:'action',filename:files.walk,name:'Ação Mixamo F',key:'KeyF'},{slot:'action',filename:files.idle,name:'Ação Espaço',key:'Space'});
 const originalFetch=globalThis.fetch;
 globalThis.fetch=(url,options)=>String(url).endsWith('game-bindings.json')?Promise.resolve(new Response(JSON.stringify({version:1,bindings}),{status:200,headers:{'Content-Type':'application/json'}})):originalFetch(url,options);
 try{await MovaGame.init(Input);}finally{globalThis.fetch=originalFetch;}
 insist(MovaGame.bindings.length===5,'Clipes não carregados no jogo');
 const modes=new Set();let maxBoneError=0,maxFootClamp=0;
 const gap=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
 for(let direction=0;direction<8;direction++){
  resetPlayer();Input.clear();Player.facing=Player.visualFacing=direction*Math.PI/4;
  for(const mode of ['idle','walk','run']){
   Input.keys.clear();if(mode!=='idle')for(const key of [['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW'],['KeyW'],['KeyW','KeyD']][direction])Input.keys.add(key);if(mode==='run')Input.keys.add('ShiftLeft');
   for(let i=0;i<100;i++){
    update(1/120);modes.add(MovaGame.active);
    for(const [k,a,b]of [['legL',27,27],['legR',27,27],['armL',23,22],['armR',23,22]]){const x=Player.rig[k];maxBoneError=Math.max(maxBoneError,Math.abs(gap(x.a,x.b)-a),Math.abs(gap(x.b,x.c)-b));if(k.startsWith('leg'))maxFootClamp=Math.max(maxFootClamp,gap(x.c,x.target));}
   }
  }
 }
 insist(['Mixamo idle','Mixamo walk','Mixamo run'].every(n=>modes.has(n)),'Estados do controlador não escolhem clipes reais: '+JSON.stringify([...modes]));
 Input.clear();Input.suspended=false;dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF',bubbles:true}));update(1/120);
 insist(MovaGame.active==='Ação Mixamo F','Tecla F não disparou a animação');
 dispatchEvent(new KeyboardEvent('keyup',{code:'KeyF',bubbles:true}));
 dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));update(1/120);
 insist(MovaGame.active==='Ação Espaço'&&Player.state!=='dodge','Espaço não substituiu a cambalhota');
 dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));
 insist(maxBoneError<1e-6,'Ossos externos mudaram de comprimento');insist(maxFootClamp<1e-5,'Pés externos fora do alcance: '+maxFootClamp);
 Input.clear();for(let i=0;i<120;i++)update(1/120);render();
 return {actualGame:true,modes:[...modes],directions:8,keyF:true,spaceReplacement:true,maxBoneError,maxFootClamp};
})()
