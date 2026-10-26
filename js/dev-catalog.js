(function(){
 'use strict';
 // No catalogue requests or UI outside the explicit local development session.
 const query=new URLSearchParams(location.search);
 if(query.get('dev')!=='1'||!['127.0.0.1','localhost','[::1]'].includes(location.hostname))return;
 let service;
 try{service=new URL(query.get('movalab')||'http://127.0.0.1:5320');if(service.protocol!=='http:'||!['127.0.0.1','localhost'].includes(service.hostname)||service.username||service.password||service.pathname!=='/'||service.search||service.hash)return;}catch{return;}
 const button=document.createElement('button');button.id='dev-catalog-open';button.textContent='DEV · Animações';
 const dialog=document.createElement('dialog');dialog.id='dev-catalog-dialog';dialog.setAttribute('aria-label','Catálogo DEV de animações');
 dialog.style.cssText='width:min(1100px,94vw);height:85vh;padding:12px;border:1px solid #688573;background:#17211f;color:#edf3df';
 const close=document.createElement('button');close.textContent='Fechar e restaurar jogo';close.id='dev-catalog-close';
 const frame=document.createElement('iframe');frame.title='Prévia Canvas isolada do combate';frame.style.cssText='display:block;width:100%;height:calc(100% - 42px);border:0;margin-top:8px';
 dialog.append(close,frame);document.body.append(dialog);(document.querySelector('.bottom-bar nav')||document.body).append(button);
 let priorPause=false,priorFocus=null;
 button.onclick=()=>{if(dialog.open)return;priorPause=Pilot.Game.paused;priorFocus=document.activeElement;Input.modalActive=true;setToggle('paused',true);dialog.showModal();frame.src=service.origin+'/dev-catalog.html';};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{frame.src='about:blank';Input.modalActive=false;setToggle('paused',priorPause);const focus=priorFocus===button||priorFocus===document.body?document.querySelector('#game'):priorFocus;focus?.focus();});
})();
