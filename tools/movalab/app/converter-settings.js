export const defaultCorrections=Object.freeze({hipHeight:0,armSwing:1,stride:1,footLift:1,footLock:true,headYaw:0,intensity:1,rootScale:1});
export const correctionRanges=Object.freeze({hipHeight:[-10,10],armSwing:[.2,1.5],stride:[.2,1.5],footLift:[0,2],headYaw:[-90,90],intensity:[0,2],rootScale:[0,2]});
export function validateCorrections(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!Object.hasOwn(defaultCorrections,k)))throw Error('Ajustes de conversão não reconhecidos');
 const result={...defaultCorrections,...value};
 for(const [k,[min,max]]of Object.entries(correctionRanges))if(typeof result[k]!=='number'||!Number.isFinite(result[k])||result[k]<min||result[k]>max)throw Error('Ajuste fora do limite: '+k);
 if(typeof result.footLock!=='boolean')throw Error('Ajuste de apoio inválido');return result;
}
