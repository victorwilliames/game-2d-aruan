'use strict';
(()=>{
 const el=id=>document.getElementById('appearance-'+id),status=el('status'),json=el('json');
 function message(text,error=false){status.textContent=text;status.dataset.error=String(error);}
 function sync(){const a=Appearance.current;for(const key of ['outfit','hair','accessory'])el(key).value=a[key];for(const key of Object.keys(a.palette))document.getElementById('color-'+key).value=a.palette[key];el('preset').value=Object.entries(Appearance.presets()).find(([,p])=>JSON.stringify(p)===JSON.stringify(a))?.[0]||'custom';json.value=Appearance.serialize();renderStudio();}
 function change(fn){try{fn();message('Preview atualizado. Use no campo para salvar.');}catch(e){message(e.message,true);}}
 for(const key of ['outfit','hair','accessory'])el(key).addEventListener('change',()=>change(()=>Appearance.set({...Appearance.current,[key]:el(key).value})));
 for(const key of Object.keys(Appearance.current.palette))document.getElementById('color-'+key).addEventListener('input',e=>change(()=>Appearance.set({...Appearance.current,palette:{...Appearance.current.palette,[key]:e.target.value}})));
 el('preset').addEventListener('change',e=>{if(e.target.value!=='custom')change(()=>Appearance.preset(e.target.value));});
 el('random').onclick=()=>change(()=>Appearance.randomize());el('reset').onclick=()=>change(()=>Appearance.reset());
 el('apply').onclick=()=>{const saved=Appearance.save();message(saved?'Aparência salva. Entre no campo para usar.':'Este navegador não permitiu salvar. Você pode baixar o JSON.',!saved);};
 el('import').onclick=()=>change(()=>Appearance.load(json.value));
 el('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>8192)throw Error('O arquivo de aparência excede o limite de 8 KB.');Appearance.load(await file.text());message('Arquivo carregado no preview. Use no campo para salvar.');}catch(error){message(error.message,true);}finally{e.target.value='';}};
 el('export').onclick=()=>{const url=URL.createObjectURL(new Blob([Appearance.serialize()+'\n'],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='aruan-aparencia.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('JSON preparado para download.');};
 Appearance.subscribe(sync);sync();if(Appearance.initialError)message(Appearance.initialError,true);
})();
