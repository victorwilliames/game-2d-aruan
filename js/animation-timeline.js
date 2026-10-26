(function(root){
 'use strict';
 // Read-only bridge: native controller clocks own gameplay. Clips only provide
 // visual samples. No input, stamina, damage, hitbox or world-root writes here.
 const loops=new Set(['idle','walk','run','sprint','block_loop']);
 const attacks=new Set(['bow_club_attack_01','bow_club_attack_02','bow_club_attack_03','bow_club_charge','bow_club_running','bow_club_dodge_atk','riposte','rune_slam']);
 const roles=new Set([...loops,...attacks,'quickstep','roll','pivot','hurt','guard_break','parry']);
 const finite=(n,label)=>{if(!Number.isFinite(n)||n<0)throw Error('Timeline: '+label+' inválido');return n;};
 function resolve(player,feel){
  if(!player||!feel)throw Error('Timeline: controlador ausente');
  const anim=player.anim||{};let role,clock=0,duration=null,hitStart=null,hitEnd=null,cancelAt=null,phase=player.phase;
  if(player.state==='attack'&&anim.atk){
   const a=anim.atk,d=a.def;role=player.attackSpec?.clip||['bow_club_attack_01','bow_club_attack_02','bow_club_attack_03'][player.combo];
   clock=a.t;duration=d.total;hitStart=d.hitTime*.82;hitEnd=d.activeEnd;cancelAt=Math.max(d.cancel,d.activeEnd);
  }else if(player.state==='dodge'&&anim.dodge){
   role=player.dodgeKind||anim.dodge.kind||'roll';const d=feel.dodge[role];if(!d)throw Error('Timeline: esquiva desconhecida');clock=anim.dodge.t;duration=d.duration;cancelAt=d.recoveryCancelAt;
  }else if(player.state==='guard'&&anim.guard){role='block_loop';clock=anim.guard.t;}
  else if(player.state==='parry'&&anim.parry){role='parry';clock=anim.parry.t;duration=feel.parry.startupSec+feel.parry.activeSec+feel.parry.whiffRecoverySec;}
  else if(player.state==='stagger'&&anim.stagger){role=phase==='guard_break'?'guard_break':'hurt';clock=anim.stagger.t;duration=player.staggerDuration;}
  else if(player.state==='move'){
   if(player.pivot){role='pivot';clock=player.pivot.t;duration=player.pivot.duration;}
   else{const speed=Math.hypot(...(player.vel||[0,0]));role=player.sprint?'sprint':speed>170?'run':speed>1?'walk':'idle';clock=role==='idle'?anim.t:anim.phase;}
  }else return null;
  if(!roles.has(role))return null;finite(clock,'clock');if(duration!==null&&!(Number.isFinite(duration)&&duration>0))throw Error('Timeline: duração nativa inválida');
  if(attacks.has(role)&&!(0<hitStart&&hitStart<hitEnd&&hitEnd<duration&&cancelAt>=hitEnd&&cancelAt<=duration))throw Error('Timeline: janelas nativas inválidas');
  return Object.freeze({role,clock,duration,hitStart,hitEnd,cancelAt,phase,instanceId:player.actionInstanceId||0,loop:loops.has(role),phaseDriven:['walk','run','sprint'].includes(role),invulnerable:Boolean(player.invulnerable),parryActive:Boolean(player.parryActive)});
 }
 function binding(input,clip){
  if(!input||!roles.has(input.role)||!clip||!(Number.isFinite(clip.duration)&&clip.duration>0))throw Error('Timeline: vínculo ou clipe inválido');
  const range=input.range||[0,clip.duration];if(!Array.isArray(range)||range.length!==2||!range.every(Number.isFinite)||range[0]<0||range[0]>=range[1]||range[1]>clip.duration)throw Error('Timeline: recorte inválido');
  if(loops.has(input.role)&&(!clip.loop||range[0]!==0||range[1]!==clip.duration))throw Error('Timeline: loop requer artefato completo já preparado como loop');
  let markers=null;
  if(attacks.has(input.role)){
   const m=input.markers;if(!m||!(range[0]<m.activeStart&&m.activeStart<m.activeEnd&&m.activeEnd<range[1])||![m.activeStart,m.activeEnd].every(Number.isFinite))throw Error('Timeline: marque explicitamente início/fim ativo do clipe');
   markers=Object.freeze({activeStart:m.activeStart,activeEnd:m.activeEnd});
  }else if(input.markers)throw Error('Timeline: marcas de ataque incompatíveis com papel');
  return Object.freeze({role:input.role,range:Object.freeze(range.slice()),markers,loop:loops.has(input.role)});
 }
 function sourceTime(frame,target){
  if(!frame||!target||frame.role!==target.role)throw Error('Timeline: papel divergente');
  const [start,end]=target.range,span=end-start;
  if(target.loop){const cycles=frame.phaseDriven?frame.clock:frame.clock/span;return start+((cycles%1+1)%1)*span;}
  if(!(Number.isFinite(frame.duration)&&frame.duration>0))throw Error('Timeline: duração nativa ausente');
  const t=Math.max(0,Math.min(frame.duration,finite(frame.clock,'clock')));
  const from=target.markers?[0,frame.hitStart,frame.hitEnd,frame.duration]:[0,frame.duration];
  const to=target.markers?[start,target.markers.activeStart,target.markers.activeEnd,end]:[start,end];
  for(let i=1;i<from.length;i++)if(t<=from[i])return to[i-1]+(to[i]-to[i-1])*(t-from[i-1])/(from[i]-from[i-1]);
  return end;
 }
 const api=Object.freeze({roles:Object.freeze([...roles]),resolve,binding,sourceTime});root.AruanAnimationTimeline=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
