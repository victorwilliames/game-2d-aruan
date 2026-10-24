const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),handlers={},nodes=new Map();
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),measureText:t=>({width:t.length*7})},{get:(o,k)=>k in o?o[k]:noop});
function node(){return {width:1280,height:720,textContent:'',classList:{toggle:noop},setAttribute:noop,focus:noop,matches:()=>false,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720}),addEventListener:(k,f)=>handlers['canvas:'+k]=f};}
const document={hidden:false,addEventListener:(k,f)=>handlers["document:"+k]=f,createElement:node,querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll:()=>[]};
const files=['math','paint','rig','character','head','world','effects','controls','main'];
const code=files.map(f=>fs.readFileSync(path.join(root,'js',f+'.js'),'utf8')).join('\n');
const scope={assert,console,Math,performance,document,window:{},devicePixelRatio:1,requestAnimationFrame:noop,addEventListener:(k,f)=>handlers[k]=f,handlers};
vm.runInNewContext(code+String.raw`
const dt=1/120,step=n=>{for(let i=0;i<n;i++)update(dt);};
const key=(code,down=true)=>handlers[down?'keydown':'keyup']({code,repeat:false,target:{matches:()=>false},preventDefault(){}});
// Synthetic events may target window/document (no .matches); the handler must not throw.
assert.doesNotThrow(()=>handlers['keydown']({code:'F24',repeat:false,target:{},preventDefault(){}}));key('F24',false);

// Eight normalized screen directions, focus loss, and pause are input invariants.
for(const codes of [['KeyW'],['KeyW','KeyD'],['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW']]){
 Input.clear();codes.forEach(c=>key(c));assert.ok(Math.abs(Math.hypot(...Input.movement())-1)<1e-12);
}
Input.clear();key('KeyW');key('KeyS');assert.deepEqual(Input.movement(),[0,0]);
Input.clear();handlers.keydown({code:'KeyD',target:{isContentEditable:true},repeat:false,preventDefault(){}});assert.equal(Input.keys.size,0);
key('KeyD');Input.clicks.push([10,20]);Player.queued=true;handlers.blur();assert.equal(Input.keys.size,0);assert.equal(Input.clicks.length,0);assert.equal(Player.queued,false);
key('KeyW');document.hidden=true;handlers['document:visibilitychange']();assert.equal(Input.keys.size,0);document.hidden=false;
for(let i=0;i<40;i++)Input.enqueue([10,20]);assert.equal(Input.clicks.length,16);handlers['canvas:pointercancel']();assert.equal(Input.clicks.length,0);
setToggle('paused',true);key('KeyD');key('Space');handlers['canvas:pointerdown']({button:0,clientX:30,clientY:30});assert.equal(Player.state,'move');assert.equal(Input.clicks.length,0);assert.equal(Input.keys.size,0);setToggle('paused',false);
function travel(run){resetPlayer();Player.pos=[0,100,0];key('KeyD');if(run)key('ShiftLeft');const start=Player.pos.slice();step(72);key('KeyD',false);key('ShiftLeft',false);return vDist(start,Player.pos);}

// Actual solved stance feet remain fixed through run, reverse, stop and collisions.
let maxLiveSlip=0,maxLiveClamp=0;
const directions=[['KeyW'],['KeyW','KeyD'],['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW']];
for(const codes of directions){
 Input.clear();resetPlayer();Player.pos=[0,100,0];codes.forEach(c=>key(c));key('ShiftLeft');let previous={};
 for(let n=0;n<360;n++){
  if(n===120){Input.clear();const opposites={KeyW:'KeyS',KeyS:'KeyW',KeyD:'KeyA',KeyA:'KeyD'};codes.forEach(c=>key(opposites[c]));key('ShiftLeft');}
  if(n===240)Input.clear();step(1);
  for(const side of ['L','R']){
   const leg=Player.rig['leg'+side],foot=Player.feet.feet[side];
   maxLiveClamp=Math.max(maxLiveClamp,vDist(leg.c,leg.target));
   if(foot.p[2]===0&&previous[side]?.p[2]===0&&vDist(foot.p,previous[side].p)<1e-8)maxLiveSlip=Math.max(maxLiveSlip,vDist(leg.c,previous[side].c));
   previous[side]={p:foot.p.slice(),c:leg.c.slice()};
  }
 }
 assert.ok(Math.hypot(...Player.vel)<1,'stops after release');
 codes.forEach(c=>key(c));key('Space');Input.clear();step(110);assert.equal(Player.state,'move');assert.equal(Player.anim.dodge,null);
 assert.ok(Player.rig.legL.c[2]<BODY.ankleH+.01&&Player.rig.legR.c[2]<BODY.ankleH+.01,'dodge lands');
}
assert.ok(maxLiveSlip<1e-6,'live stance foot skates');assert.ok(maxLiveClamp<1e-6,'live stance target unreachable');
for(let dir=0;dir<8;dir++){
 Input.clear();resetPlayer();const a=dir*TAU/8,r=edgeR(a)-39;Player.pos=[Math.cos(a)*r,Math.sin(a)*r,0];
 const screen=[Math.sin(a)-Math.cos(a),Math.sin(a)+Math.cos(a)];if(screen[0]>.1)key('KeyD');if(screen[0]<-.1)key('KeyA');if(screen[1]>.1)key('KeyS');if(screen[1]<-.1)key('KeyW');key('ShiftLeft');step(240);Input.clear();step(180);
 assert.ok(Math.hypot(...Player.vel)<1,'border does not run in place');assert.ok(Player.pos.every(Number.isFinite));assert.ok(Math.hypot(Player.pos[0],Player.pos[1])<edgeR(Math.atan2(Player.pos[1],Player.pos[0]))-36,'border clamp');
}

Input.clear();resetPlayer();Player.pos=[0,100,0];key('KeyD');key('ShiftLeft');step(60);
key('KeyD',false);key('KeyA');const desired=Input.movement();step(1);assert.ok(Player.vel[0]*desired[0]+Player.vel[1]*desired[1]>0,'reversal responds next step');
step(60);Input.clear();step(18);const stopSpeed=Math.hypot(...Player.vel);assert.ok(stopSpeed<5,'brakes within 150ms');step(60);assert.equal(Math.hypot(...Player.vel),0,'idle converges exactly');
console.log({maxLiveSlip,maxLiveClamp,stopSpeed});

// Camera stays finite and keeps the entire hero in frame at eight edges/DPRs.
for(const [w,h]of [[1600,900],[360,740]])for(const dpr of [1,2]){
 Cam.cssW=w;Cam.cssH=h;Cam.W=w*dpr;Cam.H=h*dpr;Cam.dpr=dpr;Cam.px=Math.max(.55,Math.min(w/1320,h/850))*dpr;
 for(let i=0;i<8;i++){
  Input.clear();resetPlayer();const a=i*TAU/8,r=edgeR(a)-40;Player.pos=[Math.cos(a)*r,Math.sin(a)*r,0];step(360);
  const p=pj2(Player.pos),head=pj2(Player.rig.head.o),x=(p[0]*Cam.px+Cam.offX)/dpr,y=(p[1]*Cam.px+Cam.offY)/dpr,hy=(head[1]*Cam.px+Cam.offY)/dpr;
  assert.ok(x>40&&x<w-40&&y<h-60&&hy>60,'hero stays in camera safe frame');
  assert.ok([Cam.cx,Cam.cy,...CameraRig.look].every(Number.isFinite));
 }
 resetPlayer();const center=[Cam.cx,Cam.cy];step(1);assert.ok(Math.hypot(Cam.cx-center[0],Cam.cy-center[1])<1e-8,'reset camera is settled');
}
resize();

const savedProps=WorldScene.props,template=savedProps.find(o=>o.kind==='dummy');
for(let dir=0;dir<8;dir++)for(let attack=0;attack<3;attack++){
 Input.clear();resetPlayer();Player.pos=[0,0,0];const a=dir*TAU/8;
 const target={...template,x:Math.cos(a)*120,y:Math.sin(a)*120,hits:0};WorldScene.props=[target];
 beginAttack(attack,a);step(Math.ceil(ATTACKS[attack].total*120)+4);
 assert.equal(target.hits,1,'each directional strike hits exactly once');assert.equal(Player.state,'move');assert.equal(Player.anim.pose.equip,0);
}
Input.clear();resetPlayer();Player.pos=[0,0,0];Player.facing=0;const rear={...template,x:-20,y:0,hits:0};WorldScene.props=[rear];hit(2);assert.equal(rear.hits,0,'slam must not hit behind hero');WorldScene.props=savedProps;Game.hits=0;
const walk=travel(false),run=travel(true);assert.ok(walk>50);assert.ok(run>walk*1.8);
resetPlayer();key('Space');assert.equal(Player.state,'dodge');step(120);assert.equal(Player.state,'move');assert.equal(Player.anim.dodge,null);
resetPlayer();const target=WorldScene.props.find(p=>p.kind==='dummy');Player.pos=[target.x+90,target.y+90,0];
function click(){const q=pj2([target.x,target.y,0]);handlers['canvas:pointerdown']({button:0,clientX:(q[0]*Cam.px+Cam.offX)/Cam.dpr,clientY:(q[1]*Cam.px+Cam.offY)/Cam.dpr});}
click();step(1);assert.equal(Player.combo,0);click();step(53);assert.equal(Player.combo,1);click();step(44);assert.equal(Player.combo,2);step(150);assert.equal(Player.state,'move');assert.equal(Player.anim.pose.equip,0);assert.ok(Game.hits>=3,'all three strikes hit');

// Rapid clicks retain distinct intentions instead of collapsing into a boolean.
resetPlayer();Game.hits=0;Player.pos=[target.x+90,target.y+90,0];click();click();click();step(260);assert.equal(Game.hits,3,'three rapid clicks produce three contacts');assert.equal(Player.state,'move');assert.equal(Player.pending.length,0);
resetPlayer();Game.hits=0;Player.pos=[target.x+90,target.y+90,0];for(let n=0;n<40;n++)click();step(300);assert.equal(Game.hits,3,'spam cannot create a fourth queued strike');
for(let attack=0;attack<3;attack++){
 resetPlayer();beginAttack(attack,0);step(8);const facing=Player.facing;beginDodge();assert.equal(Player.state,'attack','cannot dodge-cancel anticipation');
 Input.enqueue([0,0]);step(1);assert.equal(Player.facing,facing,'aim is locked during active strike');
 Input.clicks.length=0;Player.pending.length=0;
 while(Player.anim.atk.t<Math.max(ATTACKS[attack].cancel,ATTACKS[attack].activeEnd)+.01)step(1);
 beginDodge();assert.equal(Player.state,'dodge','dodge cancels recovery');assert.equal(Player.pending.length,0);step(120);assert.equal(Player.state,'move');
}
assert.equal(WorldScene.cacheBuilds,1);assert.ok([...Player.pos,...Player.rig.head.o].every(Number.isFinite));
console.log(JSON.stringify({walkDistance:walk,runDistance:run,comboHits:Game.hits,cacheBuilds:WorldScene.cacheBuilds}));
console.log('OK: teclas, corrida, cambalhota, combo por cliques e retorno ao idle.');
`,scope,{filename:'game-integration.js'});
