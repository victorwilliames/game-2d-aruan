#!/usr/bin/env node
'use strict';
/* Comando oficial: npm run movalab. Instala Three.js apenas se ainda não estiver presente. */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const app=path.join(root,'app');
const vendor=path.join(app,'node_modules','three','build','three.module.js');
if(!fs.existsSync(vendor)){
  console.log('[MovaLab] Preparando visualizador 3D na pasta tools/movalab/app ...');
  const exe=process.platform==='win32'?'npm.cmd':'npm';
  const result=spawnSync(exe,['install','--prefix',app,'--no-audit','--no-fund'],{
    cwd:root,stdio:'inherit',shell:process.platform==='win32'
  });
  if(result.status!==0){
    console.error('[MovaLab] Não foi possível instalar Three.js. Confirme acesso ao npm e tente: npm install --prefix tools/movalab/app');
    process.exit(result.status||1);
  }
}
const {server}=require('../service/server.cjs');
const port=Number(process.env.MOVALAB_PORT||5320);
server.listen(port,'127.0.0.1',()=>console.log('[MovaLab] http://127.0.0.1:'+port+' · Catálogo de animações 3D'));
