(function(root){
 'use strict';
 const reserved={Space:'Cambalhota',KeyB:'Esqueleto',KeyT:'Câmera lenta',KeyP:'Pausa',KeyR:'Reiniciar',KeyW:'Mover',KeyA:'Mover',KeyS:'Mover',KeyD:'Mover',ShiftLeft:'Correr'};
 const padReserved={PadB:'Cambalhota (B)',PadA:'Atacar (A)',PadView:'Esqueleto (VIEW)',PadMenu:'Pausa (MENU)'};
 const actionKeys=['Space','KeyF','KeyV','KeyC','KeyE','KeyQ','KeyZ','KeyX'];
 const padButtons=['PadX','PadY','PadB','PadLB','PadRB','PadLT','PadRT'];
 const padLabels={PadX:'Xbox X',PadY:'Xbox Y',PadB:'Xbox B',PadLB:'Xbox LB',PadRB:'Xbox RB',PadLT:'Xbox LT',PadRT:'Xbox RT'};
 function validate(c){
  if(!c||c.version!==1||!Array.isArray(c.bindings)||c.bindings.length>20)throw Error('Configuração de animações inválida');
  const slots=new Set(),keys=new Set(),pads=new Set();
  for(const b of c.bindings){
   if(!b||!['idle','walk','run','action','native-dodge'].includes(b.slot)||(b.slot!=='native-dodge'&&!/^[-a-zA-Z0-9]+\.aruan-clip\.v1\.json$/.test(b.filename))||typeof b.name!=='string'||b.name.length>120)throw Error('Gatilho inválido');
   if(b.slot==='action'||b.slot==='native-dodge'){
    if(!actionKeys.includes(b.key)||keys.has(b.key))throw Error('Tecla inválida ou repetida');keys.add(b.key);
    if(b.pad){if(!padButtons.includes(b.pad)||pads.has(b.pad))throw Error('Botão Xbox inválido ou repetido');pads.add(b.pad);}
   }else{if(slots.has(b.slot))throw Error('Movimento repetido');slots.add(b.slot);}
  }return c;
 }
 function suggest(name){const s=name.toLowerCase();return /idle|standing/.test(s)?{slot:'idle',key:'KeyF',pad:'PadX'}:/run|running|sprint/.test(s)?{slot:'run',key:'KeyF',pad:'PadX'}:/walk/.test(s)?{slot:'walk',key:'KeyF',pad:'PadX'}:{slot:'action',key:/jump|pulo|leap/.test(s)?'Space':/crouch|agach/.test(s)?'KeyC':'KeyF',pad:/jump|pulo|leap/.test(s)?'PadB':/crouch|agach/.test(s)?'PadY':'PadX'};}
 const api={validate,suggest,reserved,padReserved,actionKeys,padButtons,padLabels};root.MovaBindings=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
