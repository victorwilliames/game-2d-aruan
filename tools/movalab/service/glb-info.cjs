'use strict';
// Container metadata only. Rendering/skin/animation evaluation uses GLTFLoader.
function glbInfo(buffer){
 if(buffer.length<20||buffer.readUInt32LE(0)!==0x46546c67||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)throw Error('GLB2 inválido ou truncado');
 let json=null,binary=null,offset=12;
 while(offset+8<=buffer.length){const length=buffer.readUInt32LE(offset),kind=buffer.readUInt32LE(offset+4);offset+=8;
  if(offset+length>buffer.length||length%4)throw Error('Bloco GLB fora dos limites');
  if(kind===0x4e4f534a){if(length>8*1024*1024)throw Error('Metadados GLB excedem8MiB');json=JSON.parse(buffer.toString('utf8',offset,offset+length));}
  if(kind===0x004e4942)binary=buffer.subarray(offset,offset+length);offset+=length;
 }
 if(!json||json.asset?.version!=='2.0')throw Error('GLB sem descrição glTF2');
 const bones=new Set((json.skins||[]).flatMap(s=>s.joints||[])).size,animation=json.animations?.[0];
 let start=Infinity,end=-Infinity,samples=0;
 for(const sampler of animation?.samplers||[]){
  const accessor=json.accessors?.[sampler.input];if(!accessor||accessor.type!=='SCALAR'||accessor.componentType!==5126||!Number.isSafeInteger(accessor.count)||accessor.count>1000000)throw Error('Tempos de animação GLB inválidos');
  samples=Math.max(samples,accessor.count);
  if(Number.isFinite(accessor.min?.[0])&&Number.isFinite(accessor.max?.[0])){start=Math.min(start,accessor.min[0]);end=Math.max(end,accessor.max[0]);continue;}
  const view=json.bufferViews?.[accessor.bufferView];if(!view||!binary)throw Error('GLB sem tempos acessíveis');
  const stride=view.byteStride||4,base=(view.byteOffset||0)+(accessor.byteOffset||0);
  for(let i=0;i<accessor.count;i++){const at=base+i*stride;if(at<0||at+4>binary.length)throw Error('Tempo GLB fora do buffer');const time=binary.readFloatLE(at);if(!Number.isFinite(time))throw Error('Tempo GLB não finito');start=Math.min(start,time);end=Math.max(end,time);}
 }
 return {bones,curves:animation?.channels?.length||0,samples,duration:animation?end-start:0,animations:json.animations?.length||0,meshes:json.meshes?.length||0};
}
module.exports={glbInfo};
