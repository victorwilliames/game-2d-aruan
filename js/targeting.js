(function(root){
 'use strict';
 // Pure ground-plane targeting. All vectors are WORLD x/y, never screen/stick axes.
 const rad=d=>d*Math.PI/180, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
 const vector=v=>v&&Number.isFinite(v[0])&&Number.isFinite(v[1]);
 const unit=v=>{if(!vector(v))return null;const m=Math.hypot(v[0],v[1]);return m>1e-9?[v[0]/m,v[1]/m]:null;};
 const angle=(a,b)=>Math.acos(clamp(dot(a,b),-1,1));
 const defaults=Object.freeze({
  softRange:350,hardAcquireRange:450,hardReleaseRange:600,
  softAngle:rad(75),hardAcquireAngle:rad(100),aimDeadzone:.25,
  distanceWeight:1,facingWeight:.8,aimWeight:3,attackWeight:.9,recentWeight:.65,
  recentSeconds:2,persistenceBonus:.25,switchMargin:.15,minSuggestionSeconds:.18,
  assistStrength:.35,assistCone:rad(35),maxAssistAngle:rad(8),maxManualAssistAngle:rad(3),
  losGraceSeconds:.4,switchThreshold:.72,switchReleaseThreshold:.3,
  switchDebounceSeconds:.25,switchCone:rad(65),softManualSwitch:0
 });
 const adapters=Object.freeze({getId:t=>t.id,getPosition:t=>t.position,
  isAlive:t=>t.alive!==false,isValid:t=>t.valid!==false,hasLineOfSight:()=>true});
 function config(options){
  for(const k of Object.keys(options))if(!(k in defaults))throw Error('Targeting: unknown option '+k);
  const c={...defaults,...options};
  for(const [k,v]of Object.entries(c))if(!Number.isFinite(v)||v<0)throw Error('Targeting: invalid '+k);
  for(const k of ['softRange','hardAcquireRange','hardReleaseRange','recentSeconds'])if(c[k]<=0)throw Error('Targeting: invalid '+k);
  for(const k of ['softAngle','hardAcquireAngle','assistCone','maxAssistAngle','maxManualAssistAngle','switchCone'])if(c[k]>Math.PI)throw Error('Targeting: invalid '+k);
  if(c.hardAcquireRange>c.hardReleaseRange||c.assistStrength>1||c.aimDeadzone>=1||c.switchThreshold>1||c.switchReleaseThreshold>=c.switchThreshold||![0,1].includes(c.softManualSwitch))throw Error('Targeting: inconsistent limits');
  return Object.freeze(c);
 }
 function idKey(id){if(typeof id==='string'&&id.length)return 's:'+id;if(typeof id==='number'&&Number.isFinite(id))return 'n:'+id;throw Error('Targeting: stable string/number id required');}
 class Targeting{
  constructor(options={},world={}){
   this.config=config(options);this.world={...adapters,...world};
   for(const [k,v]of Object.entries(this.world))if(!(k in adapters)||typeof v!=='function')throw Error('Targeting: invalid adapter '+k);
   this.reset();
  }
  reset(){this.time=0;this.suggestedId=null;this.lockedId=null;this.manualId=null;this.suggestionSince=0;this.occludedSeconds=0;this.switchReady=false;this.lastSwitch=-Infinity;this.lossReason=null;this.recent=new Map();}
  recordCombat(id){idKey(id);this.recent.set(id,this.time);}
  _frame(frame){
   if(!frame||!vector(frame.origin)||!unit(frame.facing)||!Array.isArray(frame.targets))throw Error('Targeting: origin, facing and targets required');
   for(const k of ['aim','attackDirection'])if(frame[k]!=null&&!vector(frame[k]))throw Error('Targeting: invalid '+k);
   const facing=unit(frame.facing),aim=unit(frame.aim),manual=!!aim&&Math.hypot(frame.aim[0],frame.aim[1])>=this.config.aimDeadzone;
   const attack=unit(frame.attackDirection),origin=[frame.origin[0],frame.origin[1]],entries=[],ids=new Set();
   for(const target of frame.targets){
    if(!target)continue;const id=this.world.getId(target),key=idKey(id);if(ids.has(key))throw Error('Targeting: duplicate id '+key);ids.add(key);
    const p=this.world.getPosition(target);if(!vector(p))continue;
    const position=[p[0],p[1]],delta=[p[0]-origin[0],p[1]-origin[1]],distance=Math.hypot(...delta);
    const direction=unit(delta)||facing.slice();
    const valid=!!this.world.isValid(target,frame)&&!!this.world.isAlive(target,frame);
    const visible=valid&&this.world.hasLineOfSight(origin.slice(),position.slice(),target,frame)===true;
    entries.push({id,key,position,distance,direction,valid,visible});
   }
   return {entries,facing,aim:manual?aim:null,attack,manual,base:manual?aim:attack||facing};
  }
  _rank(f,hard=false){
   const c=this.config,range=hard?c.hardAcquireRange:c.softRange,cone=hard?c.hardAcquireAngle:c.softAngle;
   // Explicit aim owns eligibility; history and persistence cannot pull behind it.
   const axis=f.aim||f.facing;
   return f.entries.filter(e=>e.valid&&e.visible&&e.distance<=range&&angle(axis,e.direction)<=cone+1e-12).map(e=>{
    const age=this.time-(this.recent.get(e.id)??-Infinity);
    const score=c.distanceWeight*(1-e.distance/range)+c.facingWeight*dot(f.facing,e.direction)
     +(f.aim?c.aimWeight*dot(f.aim,e.direction):0)+(f.attack?c.attackWeight*dot(f.attack,e.direction):0)
     +c.recentWeight*clamp(1-age/c.recentSeconds,0,1)+(e.id===this.suggestedId?c.persistenceBonus:0);
    return {...e,score};
   }).sort((a,b)=>b.score-a.score||a.distance-b.distance||(a.key<b.key?-1:a.key>b.key?1:0));
  }
  acquire(frame){const e=this._rank(this._frame(frame))[0];return e?this._view(e):null;}
  _suggest(f){
   const ranked=this._rank(f),current=ranked.find(e=>e.id===this.suggestedId);let best=ranked[0];
   if(this.config.softManualSwitch&&this.manualId!==null){const manual=ranked.find(e=>e.id===this.manualId);if(manual)best=manual;else this.manualId=null;}
   if(current&&best&&best.id!==current.id){
    const manualOverride=f.manual&&dot(f.aim,best.direction)>dot(f.aim,current.direction)+.05;
    if(!manualOverride&&!(this.config.softManualSwitch&&this.manualId===best.id)&&(this.time-this.suggestionSince<this.config.minSuggestionSeconds||best.score<current.score+this.config.switchMargin))best=current;
   }
   const id=best?.id??null;if(id!==this.suggestedId)this.suggestionSince=this.time;this.suggestedId=id;
  }
  updateSuggestion(frame){const f=this._frame(frame);this._suggest(f);return this._snapshot(f);}
  unlock(reason='manual'){this.lockedId=null;this.occludedSeconds=0;this.switchReady=false;this.lossReason=reason;}
  _validate(f,dt){
   if(this.lockedId===null)return false;
   const e=f.entries.find(e=>e.id===this.lockedId);
   if(!e||!e.valid){this.unlock(e?'invalid-or-dead':'missing');return false;}
   if(e.distance>this.config.hardReleaseRange){this.unlock('range');return false;}
   this.occludedSeconds=e.visible?0:this.occludedSeconds+dt;
   if(!e.visible&&this.occludedSeconds+1e-12>=this.config.losGraceSeconds){this.unlock('visibility');return false;}
   return true;
  }
  _toggle(f){
   if(this.lockedId!==null){if(this.config.softManualSwitch){this.suggestedId=this.lockedId;this.manualId=this.lockedId;}this.unlock();return;}
   const ranked=this._rank(f,true),e=ranked.find(t=>t.id===this.suggestedId)||(this.config.softManualSwitch?null:ranked[0]);
   if(e){this.lockedId=e.id;this.occludedSeconds=0;this.switchReady=false;this.lossReason=null;this.lastSwitch=this.time;}
  }
  toggleHardLock(frame){const f=this._frame(frame);this._suggest(f);this._toggle(f);return this._snapshot(f);}
  validate(frame){const f=this._frame(frame);this._validate(f,0);return this._snapshot(f);}
  _switch(f,input){
   if(input!=null&&!vector(input))throw Error('Targeting: invalid switch vector');
   const m=input?Math.hypot(...input):0,c=this.config;
   if(m<=c.switchReleaseThreshold){this.switchReady=true;return false;}
   const currentId=this.lockedId??(c.softManualSwitch?this.suggestedId:null);
   if(currentId===null||!this.switchReady||m<c.switchThreshold)return false;
   // Consume every deliberate flick, including failed/cooldown attempts. Neutral re-arms.
   this.switchReady=false;
   if(this.time-this.lastSwitch+1e-12<c.switchDebounceSeconds)return false;
   const current=f.entries.find(e=>e.id===currentId);if(!current||!current.visible)return false;
   const intent=unit(input),ranked=[];
   for(const e of f.entries){
    if(e.id===current.id||!e.valid||!e.visible||e.distance>(this.lockedId===null?c.softRange:c.hardAcquireRange))continue;
    const delta=[e.position[0]-current.position[0],e.position[1]-current.position[1]],dir=unit(delta);
    if(!dir||angle(intent,dir)>c.switchCone)continue;
    ranked.push({...e,switchScore:dot(intent,dir)*2-Math.hypot(...delta)/c.hardAcquireRange});
   }
   ranked.sort((a,b)=>b.switchScore-a.switchScore||(a.key<b.key?-1:a.key>b.key?1:0));
   if(!ranked.length)return false;
   if(this.lockedId===null){this.suggestedId=ranked[0].id;this.manualId=ranked[0].id;this.suggestionSince=this.time;}
   else this.lockedId=ranked[0].id;
   this.occludedSeconds=0;this.lastSwitch=this.time;this.lossReason=null;return true;
  }
  switchTarget(frame,input){const f=this._frame(frame);this._validate(f,0);this._switch(f,input);return this._snapshot(f);}
  update(dt,frame,input={}){
   if(!Number.isFinite(dt)||dt<0)throw Error('Targeting: invalid dt');
   const f=this._frame(frame);if(input.switchVector!=null&&!vector(input.switchVector))throw Error('Targeting: invalid switch vector');
   this.time+=dt;for(const [id,t]of this.recent)if(this.time-t>this.config.recentSeconds)this.recent.delete(id);
   this._validate(f,dt);this._suggest(f);
   if(input.toggleLock===true)this._toggle(f);else this._switch(f,input.switchVector);
   return this._snapshot(f);
  }
  _view(e){return Object.freeze({id:e.id,position:Object.freeze(e.position.slice()),direction:Object.freeze(e.direction.slice()),distance:e.distance,visible:e.visible,score:e.score??null});}
  _snapshot(f){
   const suggested=this._rank(f).find(e=>e.id===this.suggestedId),locked=f.entries.find(e=>e.id===this.lockedId&&e.valid);
   const c=this.config;let correctionAngle=0;
   if(suggested){
    const d=suggested.direction,signed=Math.atan2(f.base[0]*d[1]-f.base[1]*d[0],dot(f.base,d));
    if(Math.abs(signed)<=c.assistCone)correctionAngle=clamp(signed*c.assistStrength,-(f.manual?c.maxManualAssistAngle:c.maxAssistAngle),f.manual?c.maxManualAssistAngle:c.maxAssistAngle);
   }
   const a=Math.atan2(f.base[1],f.base[0])+correctionAngle;
   const suggestedView=suggested?this._view(suggested):null,lockedView=locked?this._view(locked):null;
   return Object.freeze({mode:locked?'hard':suggested?'soft':'free',suggested:suggestedView,locked:lockedView,selected:lockedView||suggestedView,
    assist:Object.freeze({direction:Object.freeze([Math.cos(a),Math.sin(a)]),correctionAngle}),occludedSeconds:this.occludedSeconds,lossReason:this.lossReason,time:this.time});
  }
  snapshot(frame){return this._snapshot(this._frame(frame));}
  query(frame,id=this.lockedId??this.suggestedId){const e=this._frame(frame).entries.find(e=>e.id===id&&e.valid);return e?this._view(e):null;}
 }
 const api=Object.freeze({Targeting,create:(options,world)=>new Targeting(options,world),defaults});
 root.AruanTargeting=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
