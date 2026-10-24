// Trace the actual painter stroke opacity across a full turn; no copied visibility formula.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..'),code=['math','paint','rig','appearance','character','head'].map(f=>fs.readFileSync(root+'/js/'+f+'.js','utf8')).join('\n');
vm.runInNewContext(code+String.raw`
let ink=0;const stack=[],noop=()=>{},ctx=new Proxy({globalAlpha:1,strokeStyle:'',lineWidth:1,save(){stack.push({globalAlpha:this.globalAlpha,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth});},restore(){Object.assign(this,stack.pop());},stroke(){if(this.strokeStyle==='#99543a')ink+=this.globalAlpha;}},{get:(o,k)=>k in o?o[k]:noop});
let previous,maxJump=0,at=0,min=Infinity,max=0;
for(let step=0;step<=360;step++){ink=0;drawCharacter(ctx,solveRig(IDLE_A,[0,0,0],step*Math.PI/180));if(previous!==undefined&&Math.abs(ink-previous)>maxJump){maxJump=Math.abs(ink-previous);at=step;}previous=ink;min=Math.min(min,ink);max=Math.max(max,ink);}
assert.ok(maxJump<.65,'crease ink must fade instead of appearing in one frame');assert.ok(max>10&&min<.01,'details remain visible from the front and hidden behind');console.log({markerOpacityJumpPerDegree:maxJump,at,min,max});
let maxSway=0,maxEffort=0;const a=new Animator();let prev={...a.pose};
for(let step=0;step<1200;step++){if(step===180)a.startAttack(0);if(step===245)a.startDodge();if(step===347)a.endDodge();if(step===540)a.startAttack(2);if(step===720)a.endAttack();const pose=a.update(1/120,step<180?290:step>800&&step<1000?125:0).pose;maxSway=Math.max(maxSway,Math.abs(pose.secondary-prev.secondary));maxEffort=Math.max(maxEffort,Math.abs(pose.effort-prev.effort));prev={...pose};}
assert.ok(maxSway<.06&&maxEffort<.06,'secondary/expression transition bounded at 1/120s');assert.ok(a.pose.effort<1e-4,'expression settles after combat');console.log({secondaryMaxStep:maxSway,effortMaxStep:maxEffort,settledEffort:a.pose.effort});
`,{console,Math,performance,assert});
