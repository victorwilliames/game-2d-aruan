// DOM-level multitouch scenarios; physical feel is explicitly outside this test.
(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);};setToggle('paused',false);resetPlayer();Input.activate('touch');resize();
 for(const id of ['touch-attack','touch-dodge','paused','reset']){const r=document.getElementById(id).getBoundingClientRect();check(r.width>=48&&r.height>=48,id+' target too small');check(r.left>=0&&r.top>=0&&r.right<=innerWidth+.1&&r.bottom<=innerHeight+.1,id+' outside viewport');}
 const zone=document.getElementById('touch-zone'),attack=document.getElementById('touch-attack'),dodge=document.getElementById('touch-dodge');
 const zr=zone.getBoundingClientRect(),ar=attack.getBoundingClientRect(),dr=dodge.getBoundingClientRect();
 const fire=(el,type,id,x,y)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,bubbles:true,cancelable:true}));
 const x=zr.left+Math.min(70,zr.width/2),y=zr.top+70,ax=ar.left+ar.width/2,ay=ar.top+ar.height/2;
 fire(zone,'pointerdown',11,x,y);fire(zone,'pointermove',11,x+44,y);check(Math.hypot(...Input.movement())>.99,'touch move');
 Player.pos=[0,100,0];const before=Player.pos.slice();for(let n=0;n<30;n++)update(1/120);check(vDist(before,Player.pos)>20,'touch-only travel');
 const target=WorldScene.props.find(o=>o.kind==='dummy');Player.pos=[target.x+90,target.y+90,0];Game.hits=0;
 for(let n=0;n<3;n++){fire(attack,'pointerdown',12,ax,ay);fire(attack,'pointermove',12,ax,ay-30);fire(attack,'pointerup',12,ax,ay-30);}
 update(1/120);check(Player.state==='attack'&&Math.hypot(...Input.movement())>.99,'move and attack multitouch');fire(zone,'pointerup',11,x+44,y);
 for(let n=0;n<260;n++)update(1/120);check(Game.hits===3&&Player.state==='move','touch-only combo');
 resetPlayer();fire(zone,'pointerdown',21,x,y);fire(zone,'pointermove',21,x+44,y);fire(attack,'pointerdown',22,ax,ay);fire(attack,'pointercancel',22,ax,ay);check(Input.clicks.length===0&&Math.hypot(...Input.movement())>.99,'cancel one thumb');
 fire(dodge,'pointerdown',23,dr.left+dr.width/2,dr.top+dr.height/2);check(Player.state==='dodge','touch dodge');fire(zone,'pointercancel',21,x+44,y);for(let n=0;n<120;n++)update(1/120);
 fire(zone,'pointerdown',31,x,y);fire(zone,'pointermove',31,x+44,y);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'}));check(Input.touch.joystick===null&&Input.keys.has('KeyD'),'touch to keyboard handoff');window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD'}));
 Input.activate('touch');window.dispatchEvent(new Event('blur'));check(Math.hypot(...Input.movement())===0&&Input.clicks.length===0,'touch blur');
 check(document.documentElement.scrollWidth<=innerWidth+.1&&scrollY===0,'page must not scroll');resetPlayer();setToggle('paused',true);Input.activate('touch');render();
 return {touch:'multitouch, combo, aim, dodge, cancel, handoff and layout passed',viewport:[innerWidth,innerHeight]};
})()
