import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';

// r180's BinaryParser continues past the NULL root record for some exporter footer
// alignments (e.g. 177 bytes left instead of its assumed 176). Only normalize the
// non-scene footer of an in-memory copy. Node offsets and every scene byte stay intact.
// Upstream implementation: mrdoob/three.js r180, BinaryParser.endOfContent().
export function normalizeBinaryFooter(buffer){
  const bytes=new Uint8Array(buffer),view=new DataView(buffer);
  const magic='Kaydara FBX Binary  \0\x1a\0';
  if(bytes.length<27||!Array.from(magic).every((c,i)=>bytes[i]===c.charCodeAt(0)))return buffer;
  const version=view.getUint32(23,true);
  if(version<7000||version>7900)return buffer;
  const header=version>=7500?25:13;
  let offset=27;
  for(let n=0;n<1024&&offset+header<=bytes.length;n++){
    const end=header===25?Number(view.getBigUint64(offset,true)):view.getUint32(offset,true);
    if(end===0){
      if(!bytes.subarray(offset,offset+header).every(x=>x===0))return buffer;
      const result=new Uint8Array(offset+header+176);
      result.set(bytes.subarray(0,offset+header));
      return result.buffer;
    }
    if(!Number.isSafeInteger(end)||end<=offset||end>bytes.length)return buffer;
    offset=end;
  }
  return buffer;
}
export class CompatibleFBXLoader extends FBXLoader {
  parse(buffer,path){return super.parse(normalizeBinaryFooter(buffer),path);}
}
