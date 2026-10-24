// Eight directions of one attack, including its actual temporal trail samples.
(()=>{
 const attack=Number('__ATTACK__'),sheet=document.createElement('canvas');sheet.width=1600;sheet.height=900;const c=sheet.getContext('2d');
 for(let direction=0;direction<8;direction++){
  const trail=new SwordTrail(),end=ATTACKS[attack].hitTime+.015;let rig;
  for(let t=0;t<end+1/120;t+=1/120){const s=sampleAttack(attack,t);rig=solveRig(s.pose,[0,0,0],Math.PI/4+direction*Math.PI/4);trail.add(rig,1/120,s.trail);}
  const x=direction%4*400,y=Math.floor(direction/4)*450;c.save();c.beginPath();c.rect(x,y,400,450);c.clip();c.translate(x,y);c.fillStyle='#d8d8cb';c.fillRect(0,0,400,450);c.translate(200,360);c.scale(1.7,1.7);Cam.px=1.7;trail.draw(c,rig,false);drawCharacter(c,rig);trail.draw(c,rig,true);c.restore();c.fillStyle='#263d3d';c.font='14px system-ui';c.fillText('Golpe '+(attack+1)+' · '+names[direction],x+14,y+24);
 }
 return sheet.toDataURL('image/jpeg',.92);
})()
