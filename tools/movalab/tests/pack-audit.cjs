'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {readFiles,identify,category}=require('../scripts/auditar-pack.cjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'movalab-pack-'));
function fixture(file,version=7700){
 const p=path.join(tmp,...file.split('/'));fs.mkdirSync(path.dirname(p),{recursive:true});
 const head=Buffer.alloc(32);Buffer.from('Kaydara FBX Binary  \x00\x1a\x00','binary').copy(head);
 head.writeUInt32LE(version,23);fs.writeFileSync(p,head);return p;
}
try {
 const current=fixture('Animations/Walking.fbx');
 const old=fixture('Characters3D/y-bot.fbx',6100);
 fixture('AnimationsWithSkin/WalkingWithSkin.fbx');
 fixture('Animations/WalkingCopy.fbx');
 const report=readFiles(tmp);
 assert.equal(report.summary.files,4);
 assert.equal(report.summary.currentReaderCompatible,3);
 assert.equal(report.summary.oldFbx,1);
 assert.equal(report.summary.animations,3);
 assert.equal(report.summary.characters,1);
 assert.equal(report.summary.duplicates,2);
 assert.equal(identify(old).readable,false);
 assert.equal(identify(current).fbxVersion,7700);
 assert.equal(category(old),'personagem');
 assert.match(report.files.find(f=>f.path.endsWith('y-bot.fbx')).reason,/conversão/);
 console.log('MovaLab auditoria de packs: versões FBX, categoria e duplicatas OK');
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
