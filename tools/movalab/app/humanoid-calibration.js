import {Vector3} from 'three';

// Tool-only, explicit repair of a loaded destination. It never rewrites FBXs or
// invents bones. Use before constructing the destination's HumanoidRetarget.
export function calibrateDestinationBind(root,{repair=false,tolerance=.001}={}){
  if(!Number.isFinite(tolerance)||tolerance<=0)throw Error('Tolerância de bind inválida');
  root.updateMatrixWorld(true);const meshes=[];root.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});
  function measure(mesh){mesh.skeleton.update();const position=mesh.geometry.getAttribute('position');let error=0;for(let i=0;i<position.count;i+=Math.max(1,Math.floor(position.count/256))){const rest=new Vector3().fromBufferAttribute(position,i),skin=mesh.getVertexPosition(i,new Vector3());if(!skin.toArray().every(Number.isFinite))throw Error('Bind contém posição não finita');error=Math.max(error,rest.distanceTo(skin));}return error;}
  const snapshots=meshes.map(mesh=>({mesh,matrix:mesh.bindMatrix.clone(),inverse:mesh.bindMatrixInverse.clone(),bones:mesh.skeleton.boneInverses.map(m=>m.clone()),before:measure(mesh)}));
  const requiresRepair=snapshots.some(e=>e.before>tolerance);
  if(repair&&requiresRepair){
    for(const entry of snapshots)entry.mesh.bind(entry.mesh.skeleton);
    root.updateMatrixWorld(true);
    if(snapshots.some(e=>measure(e.mesh)>tolerance)){
      for(const entry of snapshots){entry.mesh.bindMatrix.copy(entry.matrix);entry.mesh.bindMatrixInverse.copy(entry.inverse);entry.mesh.skeleton.boneInverses=entry.bones;entry.mesh.skeleton.update();}
      throw Error('Rebind rejeitado: não recuperou o repouso numérico; dados originais restaurados');
    }
  }
  return {schema:'humanoid-bind-calibration.v1',requiresRepair,repaired:repair&&requiresRepair,meshes:snapshots.map(e=>({name:e.mesh.name,before:e.before,after:measure(e.mesh)})),sourceModified:false,texturesDecoded:false};
}
