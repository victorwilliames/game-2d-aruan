'use strict';
// Deterministic bilingual hints. These labels never certify visual semantics.
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_-]/g,' ');
const groups=[
 ['Caminhada','walk walking andar caminhar caminhada strafe locomotion'],['Corrida','run running jog sprint correr corrida'],
 ['Idle','idle breath breathing repouso parado descanso'],['Ataques','attack attacking punch punching kick slash swing strike hit golpe ataque soco chute porretada'],
 ['Combate','combat fight fighting block parry riposte defesa bloquear aparar combate'],['Esquiva','dodge roll rolling evade evasive esquiva rolamento rolar'],
 ['Saltos','jump jumping leap land landing salto saltar pouso aterrissagem'],['Reações','reaction react death dying die hurt dor morte reacao'],
 ['Gestos','gesture wave clap point thumb thumbs agree talk gesto acenar aplauso apontar polegar'],['Dança','dance dancing samba rumba danca dancar'],
 ['Cinemática','cinematic cinema cinematicas'],['giro','turn turning spin spinning rotate rotation giro girar virada'],
 ['pouso','land landing aterrissar aterrissagem pouso'],['queda','fall falling stumble trip cair queda tropecar'],
 ['espada','sword slash espada'],['escudo','shield escudo'],['arco','bow archery arrow arco flecha'],
 ['arma longa','spear staff greatsword twohand 2hand lancar lanca bastao porrete'],['frente','forward front ahead frente frontal'],
 ['costas','back backward backwards rear costas tras traseiro'],['esquerda','left esquerda'],['direita','right direita'],
 ['em pé','standing stand pe ereto'],['agachado','crouch crouching duck agachar agachado'],['correndo','running correr'],
];
const words={standing:'em pé',walking:'caminhada',running:'corrida',idle:'repouso',falling:'queda',roll:'rolamento',rolling:'rolamento',hard:'forte',landing:'pouso',punching:'socos',turn:'giro',briefcase:'maleta',thumbs:'polegar',up:'para cima',melee:'corpo a corpo',attack:'ataque',horizontal:'horizontal',vertical:'vertical',left:'esquerda',right:'direita',forward:'para frente',backward:'para trás',sword:'espada',shield:'escudo',jump:'salto',dance:'dança',walk:'caminhar',run:'correr',crouch:'agachar',and:'e',to:'para',with:'com',w:'com'};
const ignored=new Set('a o os as de da do das dos em e com para por um uma the a an of and to with'.split(' '));
function tokens(value){return fold(value).split(/[^a-z0-9]+/).filter(t=>t&&!ignored.has(t));}
function hints(filename,description=''){
 const original=filename.replace(/\.fbx$/i,'').replaceAll('_',' '),text=fold(original+' '+description),present=new Set(tokens(text));
 const tags=groups.filter(([,synonyms])=>synonyms.split(' ').some(t=>present.has(t))).map(([label])=>label);
 const primary=new Set(tokens(original)),categoryOrder=['Ataques','Combate','Esquiva','Saltos','Reações','Gestos','Dança','Caminhada','Corrida','Idle','Cinemática'];
 const originalCategories=groups.slice(0,11).filter(([,s])=>s.split(' ').some(t=>primary.has(t))).map(([label])=>label);
 const category=categoryOrder.find(label=>originalCategories.includes(label))||categoryOrder.find(label=>tags.includes(label))||'Outros';
 const friendly={'Hard Landing':'Pouso forte','Standing Thumbs Up':'Gesto de polegar para cima em pé','Standing Melee Attack Horizontal':'Ataque horizontal corpo a corpo em pé','Great Sword High Spin Attack':'Ataque giratório alto com espada grande'};
 const namePt=friendly[original]||original.split(/\s+/).map(t=>words[t.toLowerCase()]||t).join(' ');
 const weapon=tags.find(t=>['espada','escudo','arco','arma longa'].includes(t))||null;
 return {nameOriginal:original,namePt,descriptionEn:description||original,
  descriptionPt:'Movimento: '+namePt+'. Categoria sugerida: '+category+'. '+(weapon?'Equipamento sugerido: '+weapon+'. ':'')+'Semântica e aplicação dependem de inspeção.',
  category,subcategory:tags.find(t=>t!==category)||null,tags,weapon,
  direction:tags.filter(t=>['frente','costas','esquerda','direita'].includes(t)),
  inferred:{namePt:true,descriptionPt:true,category:true,tags:true,weapon:true,direction:true,loop:null,rootMotion:null,preparation:null,footStability:null}};
}
function search(records,query='',{category,state,limit=100,offset=0,favorites=false}={}){
 const terms=tokens(query).map(t=>{const group=groups.find(([,s])=>s.split(' ').includes(t));return group?new Set([t,...tokens(group[0]),...group[1].split(' ')]):new Set([t]);});
 return records.filter(r=>(!category||category==='all'||r.category===category)&&(!state||state==='all'||r.pipeline?.state===state)&&(!favorites||r.favorite))
  .map(r=>{const bag=new Set(tokens([r.nameOriginal,r.namePt,r.descriptionEn,r.descriptionPt,r.filename,r.tags?.join(' ')].join(' ')));return {record:r,score:terms.reduce((s,alts)=>s+([...alts].some(t=>bag.has(t)||(t.length>=3&&[...bag].some(w=>w.startsWith(t))))?1:0),0)};})
  .filter(r=>!terms.length||r.score>0).sort((a,b)=>b.score-a.score||a.record.nameOriginal.localeCompare(b.record.nameOriginal))
  .slice(Math.max(0,offset),Math.max(0,offset)+Math.min(500,Math.max(1,limit))).map(r=>r.record);
}
module.exports={fold,tokens,hints,search};
