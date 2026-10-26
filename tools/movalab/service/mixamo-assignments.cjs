'use strict';
// Draft intent only. Runtime publication/approval is a separate #83 operation.
function draftAssignment(input,motion,prepared,existing=[],bindings=[]){
 if(!input||!['idle','walk','run','action'].includes(input.slot))throw Error('Slot inválido');
 if(!motion||!prepared?.meta?.validation?.technicallyValidated)throw Error('Prepare e valide o clipe antes de atribuir');
 const action=input.slot==='action',key=action?input.key:null,pad=action?(input.pad||null):null;
 if(action&&!['KeyC','KeyZ','KeyX'].includes(key))throw Error('Tecla reservada ou inválida para Sprint8; use C, Z ou X');
 if(pad&&pad!=='PadY')throw Error('Botão reservado ou inválido para Sprint8; use PadY');
 if(!action&&(input.key||input.pad))throw Error('Locomoção não recebe tecla/botão');
 const conflicts=b=>b.slot===input.slot&&input.slot!=='action'||key&&b.key===key||pad&&b.pad===pad;
 if(bindings.some(conflicts))throw Object.assign(Error('Conflito com binding existente; mantenha-o até resolver na publicação'),{status:409});
 const remaining=existing.filter(b=>!(b.motionId===motion.id&&b.slot===input.slot&&b.key===key));
 if(remaining.some(conflicts))throw Object.assign(Error('Conflito com outra atribuição DEV'),{status:409});
 if(remaining.length>=20)throw Error('Limite de20 atribuições DEV');
 const assignment={motionId:motion.id,sourceSha256:motion.sha256,cacheKey:prepared.meta.key,name:motion.filename,slot:input.slot,key,pad,status:'draft',visuallyApproved:false,gameplayIntegrated:false};
 return {assignment,assignments:[...remaining,assignment],runtimeChanged:false};
}
module.exports={draftAssignment};
