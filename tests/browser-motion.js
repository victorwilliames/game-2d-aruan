// Capture six comparable close-ups from the actual gameplay rig and FootPlant.
(()=>{
 const mode='__MODE__',strip=document.createElement('canvas');strip.width=1600;strip.height=900;const c=strip.getContext('2d');
 setToggle('paused',false);resetPlayer();Player.pos=[0,100,0];Input.keys.add('KeyD');Input.keys.add('ShiftLeft');for(let n=0;n<100;n++)update(1/120);
 if(mode==='dodge'){beginDodge();Input.clear();}let frame=0;
 for(let n=0;n<=120;n++){
  if(mode==='reversal'&&n===0){Input.clear();Input.keys.add('KeyA');Input.keys.add('ShiftLeft');}if(mode==='reversal'&&n===48)Input.clear();
  update(1/120);
  if([0,20,40,60,100,120].includes(n)){
   render();const p=pj2(Player.pos),x=p[0]*Cam.px+Cam.offX,y=p[1]*Cam.px+Cam.offY;
   c.drawImage(canvas,x-180*Cam.dpr,y-260*Cam.dpr,360*Cam.dpr,310*Cam.dpr,(frame%3)*1600/3,Math.floor(frame/3)*450,1600/3,450);
   c.fillStyle='#fff1bc';c.font='16px system-ui';c.fillText(mode+' · '+(n/120).toFixed(2)+' s · '+Player.state,(frame%3)*1600/3+16,Math.floor(frame/3)*450+24);frame++;
  }
 }
 Input.clear();resetPlayer();setToggle('paused',true);return strip.toDataURL('image/jpeg',.9);
})()
