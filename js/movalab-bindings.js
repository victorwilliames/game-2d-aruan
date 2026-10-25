(function(root){
 'use strict';
 const reserved={Space:'Cambalhota',KeyB:'Esqueleto',KeyT:'Câmera lenta',KeyP:'Pausa',KeyR:'Reiniciar',KeyW:'Mover',KeyA:'Mover',KeyS:'Mover',KeyD:'Mover',ShiftLeft:'Correr'};
 function validate(c){
  if(!c||c.version!==1||!Array.isArray(c.bindings)||c.bindings.length>20)throw Error('Configuração de animações inválida');
  const slots=new Set(),keys=new Set();
  for(const b of c.bindings){
   if(!b||!['idle','walk','run','action'].includes(b.slot)||!/^[-a-zA-Z0-9]+\.aruan-clip\.v1\.json$/.test(b.filename)||typeof b.name!=='string'||b.name.length>120)throw Error('Gatilho inválido');
   if(b.slot==='action'){
    if(!['Space','KeyF','KeyV','KeyC','KeyE','KeyQ'].includes(b.key)||keys.has(b.key))throw Error('Tecla inválida ou repetida');keys.add(b.key);
   }else{if(slots.has(b.slot))throw Error('Movimento repetido');slots.add(b.slot);}
  }return c;
 }
 function suggest(name){const s=name.toLowerCase();return /idle|standing/.test(s)?{slot:'idle',key:'KeyF'}:/run|running|sprint/.test(s)?{slot:'run',key:'KeyF'}:/walk/.test(s)?{slot:'walk',key:'KeyF'}:{slot:'action',key:/jump|pulo|leap/.test(s)?'Space':/crouch|agach/.test(s)?'KeyC':'KeyF'};}
 const api={validate,suggest,reserved};root.MovaBindings=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
