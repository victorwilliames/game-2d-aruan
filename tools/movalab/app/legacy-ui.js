'use strict';
globalThis.MovaLabLegacy=(()=>{
 let available=false,busy=false;
 function render(){
  const list=$('legacy-files');list.replaceChildren();
  const assets=state.assets.filter(a=>a.legacy);
  for(const asset of assets){
   if(asset.derived){
    const detail=element('details'),summary=element('summary','',asset.name+' · convertido');
    const report=asset.derived.report,loss=Math.max(0,...(report.diagnostics?.meshes||[]).map(m=>m.maxDiscardedWeight||0));detail.append(summary,element('p','',
      report.counts.meshes+' malhas / '+report.counts.skins+' skins / '+(report.counts.images||0)+' imagens embutidas. Maior redução de pesos: '+(loss*100).toFixed(2)+'%. '+(report.diagnostics?.warnings||[]).join(' ')));
    list.append(detail);
   }else{
    const button=element('button','',asset.name+' · converter FBX'+asset.fbxVersion);button.type='button';button.disabled=!available||busy;
    button.addEventListener('click',()=>convert([asset]));list.append(button);
   }
  }
  $('legacy-all').disabled=!available||busy||!assets.some(a=>!a.derived);
 }
 async function check(){
  try{const status=await api('/api/legacy/status');available=status.installed;
   $('legacy-setup').hidden=available;$('legacy-status').textContent=available?'Conversor offline pronto. Originais preservados; derivados GLB separados.':'Conversão opcional requer Python3.12 e ufbx. A preparação instala somente na ferramenta.';
  }catch(e){$('legacy-status').textContent=e.message;}
  render();
 }
 async function convert(assets){
  if(busy||state.converting)return;busy=true;render();
  try{
   for(let i=0;i<assets.length;i++){
    $('legacy-status').textContent='Convertendo '+(i+1)+'/'+assets.length+': '+assets[i].name+'…';
    await api('/api/legacy/convert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:assets[i].path})});
   }
   await refreshCatalog();$('legacy-status').textContent='Conversão concluída. Selecione o personagem convertido e confira o relatório de perdas.';
  }catch(e){$('legacy-status').textContent='Falha na conversão: '+e.message;message(e.message,true);}
  finally{busy=false;render();}
 }
 $('legacy-all').addEventListener('click',()=>convert(state.assets.filter(a=>a.legacy&&!a.derived)));
 $('legacy-setup').addEventListener('click',async()=>{
  if(busy)return;busy=true;$('legacy-setup').disabled=true;
  $('legacy-status').textContent='Preparando biblioteca opcional. Internet necessária somente nesta instalação…';
  try{await api('/api/legacy/setup',{method:'POST'});await check();}catch(e){$('legacy-status').textContent=e.message;}
  finally{busy=false;$('legacy-setup').disabled=false;render();}
 });
 check();return Object.freeze({render,convert,check});
})();
