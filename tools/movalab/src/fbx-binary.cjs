'use strict';
const fs=require('node:fs');
const zlib=require('node:zlib');
const FBX_MAGIC=Buffer.from('Kaydara FBX Binary  \x00\x1a\x00','binary');
const TICKS_PER_SECOND=46186158000;
function parseBinaryFbx(input){
 const b=Buffer.isBuffer(input)?input:fs.readFileSync(input);
 if(!b.subarray(0,23).equals(FBX_MAGIC))throw new Error('Unsupported FBX format (binary expected)');
 const version=b.readUInt32LE(23);
 if(version<7000||version>7900)throw new Error('FBX version '+version+' not supported');
 const wide=version>=7500,headerBytes=wide?25:13;
 const check=(p,size)=>{if(p<0||size<0||p+size>b.length)throw new Error('FBX data out of range at '+p)};
 function readArray(p,type){
  check(p,12);const count=b.readUInt32LE(p),encoding=b.readUInt32LE(p+4),length=b.readUInt32LE(p+8);p+=12;check(p,length);
  if(count>2500000)throw new Error('FBX array too large');
  const data=encoding===1?zlib.inflateSync(b.subarray(p,p+length)):encoding===0?b.subarray(p,p+length):null;
  if(!data)throw new Error('Unknown FBX array encoding '+encoding);
  const widths={d:8,f:4,l:8,i:4,b:1,c:1};const width=widths[type];
  if(data.length!==count*width)throw new Error('FBX array '+type+' size mismatch');
  const result=new Array(count);
  for(let i=0;i<count;i++){
   const q=i*width;
   result[i]=type==='d'?data.readDoubleLE(q):type==='f'?data.readFloatLE(q):type==='l'?Number(data.readBigInt64LE(q)):type==='i'?data.readInt32LE(q):data[q];
  }
  return {value:result,next:p+length};
 }
 function prop(p){check(p,1);const type=String.fromCharCode(b[p++]);let value;
  if('dflicb'.includes(type))return readArray(p,type);
  if(type==='Y'){check(p,2);value=b.readInt16LE(p);p+=2;}
  else if(type==='C'){check(p,1);value=b[p++]!==0;}
  else if(type==='I'){check(p,4);value=b.readInt32LE(p);p+=4;}
  else if(type==='F'){check(p,4);value=b.readFloatLE(p);p+=4;}
  else if(type==='D'){check(p,8);value=b.readDoubleLE(p);p+=8;}
  else if(type==='L'){check(p,8);value=Number(b.readBigInt64LE(p));p+=8;}
  else if(type==='S'||type==='R'){check(p,4);const len=b.readUInt32LE(p);p+=4;check(p,len);value=type==='S'?b.toString('utf8',p,p+len):b.subarray(p,p+len);p+=len;}
  else throw new Error('Unknown FBX property type '+JSON.stringify(type)+' at '+(p-1));
  return {value,next:p};
 }
 function node(pos,limit){
  check(pos,headerBytes);
  const end=wide?Number(b.readBigUInt64LE(pos)):b.readUInt32LE(pos);
  const num=wide?Number(b.readBigUInt64LE(pos+8)):b.readUInt32LE(pos+4);
  const plen=wide?Number(b.readBigUInt64LE(pos+16)):b.readUInt32LE(pos+8);
  const nameLen=b[pos+headerBytes-1];
  if(!end&&!num&&!plen&&!nameLen)return {node:null,next:pos+headerBytes};
  if(!Number.isSafeInteger(end)||end<=pos||end>limit||num>100000)throw new Error('Invalid FBX node at '+pos);
  let p=pos+headerBytes;check(p,nameLen);const name=b.toString('utf8',p,p+nameLen);p+=nameLen;
  const propsEnd=p+plen;const properties=[];
  for(let j=0;j<num;j++){const q=prop(p);properties.push(q.value);p=q.next;}
  if(p!==propsEnd)throw new Error('Unexpected FBX property size at '+name);
  const children=[];
  while(p<end){
   const child=node(p,end);p=child.next;
   if(child.node)children.push(child.node);
   else if(p!==end)throw new Error('Early sentinel in '+name);
  }
  if(p!==end)throw new Error('Unexpected FBX node length at '+name);
  return {node:{name,properties,children},next:end};
 }
 const children=[];let p=27;
 while(p+headerBytes<=b.length){
  const q=node(p,b.length);p=q.next;
  if(!q.node)break;
  children.push(q.node);
 }
 return {version,children};
}
const one=(n,key)=>n.children.find(x=>x.name===key);
const many=(n,key)=>n.children.filter(x=>x.name===key);
const nameOf=o=>String(o.properties[1]||'').split('\0')[0].replace(/^mixamorig:/,'');
const modelProperties=model=>{
 const properties={};const block=one(model,'Properties70');
 for(const p of block?many(block,'P'):[]){const [name,,, ,...values]=p.properties;if(['Lcl Translation','Lcl Rotation','Lcl Scaling','PreRotation','PostRotation','RotationOrder'].includes(name))properties[name]=values;}
 return properties;
};
function extractAnimation(scene){
 const objects=scene.children.find(x=>x.name==='Objects'),links=scene.children.find(x=>x.name==='Connections');
 if(!objects||!links)throw new Error('FBX Objects/Connections not found');
 const models=objects.children.filter(x=>x.name==='Model').map(o=>({id:o.properties[0],name:nameOf(o),kind:o.properties[2],properties:modelProperties(o),parent:null}));
 const modelById=new Map(models.map(x=>[x.id,x]));
 const animNodes=new Map(),curves=new Map();
 for(const o of objects.children){
  if(o.name==='AnimationCurveNode')animNodes.set(o.properties[0],{id:o.properties[0],targetId:null,property:null,channels:{}});
  if(o.name==='AnimationCurve'){
   const keyTime=one(o,'KeyTime')?.properties[0]||[];
   const keyValue=one(o,'KeyValueFloat')?.properties[0]||[];
   if(keyTime.length!==keyValue.length)throw new Error('Curve key count mismatch');
   curves.set(o.properties[0],{id:o.properties[0],times:keyTime,values:keyValue});
  }
 }
 for(const link of many(links,'C')){
  const [relation,from,to,prop]=link.properties;
  if(relation==='OO'&&modelById.has(from)&&modelById.has(to))modelById.get(from).parent=modelById.get(to).name;
  if(relation==='OP'){
   if(animNodes.has(from)&&modelById.has(to)){const n=animNodes.get(from);n.targetId=to;n.property=prop;}
   if(curves.has(from)&&animNodes.has(to))animNodes.get(to).channels[String(prop).replace('d|','')]=curves.get(from);
  }
 }
 const tracks=[];
 for(const n of animNodes.values()){
  if(!modelById.has(n.targetId)||!n.property)continue;
  tracks.push({bone:modelById.get(n.targetId).name,property:n.property,channels:n.channels});
 }
 const allTimes=new Set();for(const c of curves.values())for(const t of c.times)allTimes.add(t);
 return {version:scene.version,bones:models,tracks,curveCount:curves.size,curveNodeCount:animNodes.size,times:[...allTimes].sort((a,b)=>a-b),ticksPerSecond:TICKS_PER_SECOND};
}
function sampleCurve(curve,ticks){
 if(!curve?.times.length)return null;
 const ts=curve.times,vs=curve.values,n=ts.length;
 if(ticks<=ts[0])return vs[0];if(ticks>=ts[n-1])return vs[n-1];
 let lo=0,hi=n-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(ts[mid]<=ticks)lo=mid;else hi=mid;}
 const alpha=(ticks-ts[lo])/(ts[hi]-ts[lo]);return vs[lo]+(vs[hi]-vs[lo])*alpha;
}
function sampleBoneChannels(animation,seconds,boneName){
 const ticks=animation.times[0]+Math.round(seconds*TICKS_PER_SECOND),result={};
 for(const track of animation.tracks.filter(x=>x.bone===boneName)){
  const defaults={...(animation.bones.find(x=>x.name===boneName)?.properties||{})};
  const axes=['X','Y','Z'];
  result[track.property]=axes.map((axis,i)=>sampleCurve(track.channels[axis],ticks)??(defaults[track.property]?.[i]??(track.property==='Lcl Scaling'?1:0)));
 }
 return result;
}
module.exports={parseBinaryFbx,extractAnimation,sampleCurve,sampleBoneChannels,TICKS_PER_SECOND};
