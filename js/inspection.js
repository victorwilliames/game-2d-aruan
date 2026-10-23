'use strict';
const sheet=document.querySelector('#inspection'),c=sheet.getContext('2d');
let time=0,paused=false,bones=false,slow=false,motion='idle',fraction=0;
const capes=Array.from({length:16},()=>new Cape());
for(const [id,fn]of [['bones',()=>bones=!bones],['slower',()=>slow=!slow],['freeze',()=>paused=!paused]])document.querySelector('#'+id).onclick=e=>e.currentTarget.setAttribute('aria-pressed',String(fn()));
document.querySelector('#motion').onchange=e=>{motion=e.target.value;time=0;for(let i=0;i<capes.length;i++)capes[i]=new Cape();};
document.querySelector('#scrub').oninput=e=>{fraction=Number(e.target.value)/1000;paused=true;document.querySelector('#freeze').setAttribute('aria-pressed','true');time=fraction*(motion==='idle'||motion==='run'?1:ATTACKS[Number(motion)].total);};
function inspectRender(dt){
  const w=Math.max(800,innerWidth),cols=w<1200?4:8,cw=w/cols,cellH=295,rows=8/cols,h=rows*cellH*2+88;
  const dpr=Math.min(devicePixelRatio||1,2);if(sheet.width!==Math.round(w*dpr)||sheet.height!==Math.round(h*dpr)){sheet.width=Math.round(w*dpr);sheet.height=Math.round(h*dpr);sheet.style.aspectRatio=`${w}/${h}`;}
  c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#17272f';c.fillRect(0,0,w,h);
  c.fillStyle='#d3b97b';c.font='11px system-ui';c.fillText('01  /  OITO DIREÇÕES',24,27);c.fillText('02  /  VOCABULÁRIO DE MOVIMENTO',24,rows*cellH+68);
  const views=['S · frente','SE · três quartos','L · perfil','NE','N · costas','NO','O · perfil','SO'];
  const poses=[['Corte · antecipação',0,.11],['Corte · golpe',0,.18],['Revés · antecipação',1,.09],['Revés · golpe',1,.16],['Ruptura · preparo',2,.16],['Ruptura · salto',2,.38],['Ruptura · impacto',2,.49],['Corrida · contato',-1,0]];
  for(let i=0;i<16;i++){
    const idx=i%8,x=(idx%cols)*cw,y=Math.floor(idx/cols)*cellH+(i<8?42:rows*cellH+84);
    c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle=idx%2?'#1c2d34':'#203139';c.fillRect(x+8,y+3,cw-16,cellH-12);c.strokeStyle='#c7ad7130';c.lineWidth=1;c.strokeRect(x+8,y+3,cw-16,cellH-12);
    c.font='10px system-ui';c.fillStyle='#c2b68f';c.fillText(i<8?views[idx]:poses[idx][0],x+20,y+24);
    let pose,facing=Math.PI/4-idx*Math.PI/4;
    if(i<8){pose=motion==='idle'?lerpPose(IDLE_A,IDLE_B,(Math.sin(time*2)+1)/2):motion==='run'?runPose(time):sampleAttack(Number(motion),time%ATTACKS[Number(motion)].total).pose;}
    else{const p=poses[idx];pose=p[1]<0?runPose(.15):sampleAttack(p[1],p[2]).pose;facing=Math.PI/4-(idx%2)*.35;}
    const scale=Math.min(cw/190,1.14);Cam.px=scale*dpr;Cam.dpr=dpr;
    c.translate(x+cw/2,y+cellH-36);c.scale(scale,scale);
    ellipse(c,0,3,29,10,'#0d1f26');line(c,[[-47,0],[47,0]],'#60736a',.5);
    const rig=solveRig(pose,[0,0,0],facing);capes[i].update(rig,dt||1/120,motion==='run'&&i<8?[Math.cos(facing)*240,Math.sin(facing)*240]:[0,0]);drawKnight(c,rig,capes[i],bones);
  }
  const total=motion==='idle'||motion==='run'?1:ATTACKS[Number(motion)].total;
  fraction=(time%total)/total;document.querySelector('#time-label').textContent=Math.round(fraction*100)+'%';if(!paused)document.querySelector('#scrub').value=Math.round(fraction*1000);
}
let last=performance.now();function loop(t){const dt=Math.min((t-last)/1000,.03)*(slow?.25:1);last=t;if(!paused)time+=dt;inspectRender(paused?0:dt);requestAnimationFrame(loop);}requestAnimationFrame(loop);
