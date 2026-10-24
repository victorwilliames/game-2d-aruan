'use strict';
// Rendering-only data. Never changes BODY, pose timing, grip, or the three-arrow quiver.
const Appearance=(()=>{
 const KEY='aruan.appearance.v1';
 const defaults={version:1,outfit:'wrap',hair:'classic',accessory:'none',palette:{cloth:'#bd3028',hair:'#30241f',wood:'#b47a40',feather:'#1479a7'}};
 const presets={original:defaults,mata:{version:1,outfit:'layered',hair:'cropped',accessory:'wrist-wrap',palette:{cloth:'#2e786b',hair:'#252320',wood:'#986b42',feather:'#246f91'}},terra:{version:1,outfit:'layered',hair:'classic',accessory:'wrist-wrap',palette:{cloth:'#a94f31',hair:'#38261e',wood:'#a48250',feather:'#1c668e'}}};
 const copy=o=>JSON.parse(JSON.stringify(o));
 const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
 function validate(value){
  if(!object(value)||Object.keys(value).some(k=>!['version','outfit','hair','accessory','palette'].includes(k)))throw Error('Arquivo de aparência com campos desconhecidos.');
  if(value.version!==1)throw Error('Versão de aparência não suportada.');
  if(!['wrap','layered'].includes(value.outfit)||!['classic','cropped'].includes(value.hair)||!['none','wrist-wrap'].includes(value.accessory))throw Error('Escolha de peça não reconhecida.');
  if(!object(value.palette)||Object.keys(value.palette).some(k=>!Object.keys(defaults.palette).includes(k)))throw Error('Paleta não reconhecida.');
  const palette={};for(const key of Object.keys(defaults.palette)){const color=value.palette[key];if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))throw Error('As cores precisam ter seis dígitos hexadecimais.');palette[key]=color.toLowerCase();}
  return {version:1,outfit:value.outfit,hair:value.hair,accessory:value.accessory,palette};
 }
 function parse(text){if(typeof text!=='string'||text.length>8192)throw Error('O arquivo de aparência excede o limite de 8 KB.');let value;try{value=JSON.parse(text);}catch{throw Error('JSON inválido.');}return validate(value);}
 function tint(hex,target,amount){const a=hex.slice(1).match(/../g).map(n=>parseInt(n,16)),b=target.slice(1).match(/../g).map(n=>parseInt(n,16));return '#'+a.map((n,i)=>Math.round(n+(b[i]-n)*amount).toString(16).padStart(2,'0')).join('');}
 function materials(p){
  const cloth=p.cloth===defaults.palette.cloth?{base:'#bd3028',shadow:'#75292b',light:'#e85838',stitch:'#e25638'}:{base:p.cloth,shadow:tint(p.cloth,'#18232a',.5),light:tint(p.cloth,'#ffe1aa',.4),stitch:tint(p.cloth,'#f4c691',.52)};
  const hair=p.hair===defaults.palette.hair?{base:'#30241f',shadow:'#171b1d',light:'#634132',capBase:'#30251f',capAlt:'#3c2a22',capLight:'#71482e',mark:'#a9693c',dark:'#101b1d',ink:'#211c1b'}:{base:p.hair,shadow:tint(p.hair,'#10191d',.65),light:tint(p.hair,'#9b6842',.35),capBase:p.hair,capAlt:tint(p.hair,'#8b5834',.18),capLight:tint(p.hair,'#a86a3b',.4),mark:tint(p.hair,'#c18a53',.5),dark:'#101b1d',ink:tint(p.hair,'#131b1d',.7)};
  const wood=p.wood===defaults.palette.wood?{base:'#b47a40',shadow:'#654029',light:'#e5b56d'}:{base:p.wood,shadow:tint(p.wood,'#261e1b',.5),light:tint(p.wood,'#ffdc9f',.35)};
  const bow=p.wood===defaults.palette.wood?{base:'#dfb275',shadow:'#a07141',light:'#f5d8a1'}:{base:tint(p.wood,'#ffe7bd',.4),shadow:tint(p.wood,'#4e2c20',.4),light:tint(p.wood,'#fff0c8',.65)};
  const feather=p.feather===defaults.palette.feather?{base:'#1479a7',shadow:'#12435e',light:'#389abb'}:{base:p.feather,shadow:tint(p.feather,'#102b3b',.5),light:tint(p.feather,'#b4dde0',.35)};
  return Object.freeze({cloth:Object.freeze(cloth),hair:Object.freeze(hair),wood:Object.freeze(wood),bow:Object.freeze(bow),feather:Object.freeze(feather)});
 }
 let current=validate(defaults),paint=materials(current.palette),initialError='',storageAvailable=false;const listeners=new Set();
 function set(value){const next=validate(value);Object.freeze(next.palette);current=Object.freeze(next);paint=materials(next.palette);for(const listener of listeners)listener(copy(current));return copy(current);}
 try{storageAvailable=typeof localStorage!=='undefined';if(storageAvailable){const stored=localStorage.getItem(KEY);if(stored)current=parse(stored);}}catch{initialError='A aparência salva não pôde ser lida. Usando o padrão.';current=validate(defaults);}
 set(current);
 if(typeof addEventListener==='function')addEventListener('storage',e=>{if(e.key===KEY){try{set(e.newValue?parse(e.newValue):defaults);}catch{}}});
 return Object.freeze({
  get current(){return current;},get initialError(){return initialError;},get storageKey(){return KEY;},materials:()=>paint,
  defaults:()=>copy(defaults),presets:()=>copy(presets),validate,serialize:()=>JSON.stringify(current,null,2),set,
  load:text=>set(parse(text)),reset:()=>set(defaults),preset:name=>{if(!presets[name])throw Error('Preset não reconhecido.');return set(presets[name]);},
  randomize:(random=Math.random)=>{const pick=values=>values[Math.min(values.length-1,Math.floor(random()*values.length))],value=copy(pick(Object.values(presets)));value.outfit=pick(['wrap','layered']);value.hair=pick(['classic','cropped']);value.accessory=pick(['none','wrist-wrap']);return set(value);},
  save:()=>{try{if(!storageAvailable)return false;localStorage.setItem(KEY,JSON.stringify(current));return true;}catch{return false;}},
  subscribe:listener=>{listeners.add(listener);return ()=>listeners.delete(listener);}
 });
})();
