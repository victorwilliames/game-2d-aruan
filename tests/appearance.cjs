const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/appearance.js'),'utf8');
const store=new Map(),events={};const context=vm.createContext({assert,console,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},addEventListener:(k,fn)=>events[k]=fn});
vm.runInContext(source+String.raw`
const original=Appearance.serialize(),bones=Appearance.current;
assert.ok(Object.isFrozen(bones)&&Object.isFrozen(bones.palette));
for(const preset of Object.keys(Appearance.presets())){Appearance.preset(preset);const text=Appearance.serialize();Appearance.reset();Appearance.load(text);assert.equal(Appearance.serialize(),text);}
Appearance.reset();assert.equal(Appearance.serialize(),original);
for(const bad of ['null','[]','{}','{',JSON.stringify({...Appearance.defaults(),version:2}),JSON.stringify({...Appearance.defaults(),outfit:'armor'}),JSON.stringify({...Appearance.defaults(),extra:true}),JSON.stringify({...Appearance.defaults(),palette:{...Appearance.defaults().palette,hair:'url(secret)'}}),'{"__proto__":{},"version":1}',' '.repeat(8193)]){assert.throws(()=>Appearance.load(bad));assert.equal(Appearance.serialize(),original,'invalid imports are atomic');}
for(let i=0;i<100;i++){Appearance.randomize();Appearance.validate(Appearance.current);}
Appearance.preset('mata');assert.ok(Appearance.save());
`,context);
assert.ok(store.size===1);const saved=store.values().next().value;
const restored=vm.createContext({localStorage:{getItem:()=>saved}});vm.runInContext(source,restored);assert.equal(vm.runInContext('Appearance.serialize()',restored),vm.runInContext('Appearance.serialize()',context));
events.storage({key:'aruan.appearance.v1',newValue:null});assert.equal(vm.runInContext('Appearance.current.outfit',context),'wrap');events.storage({key:'aruan.appearance.v1',newValue:'{bad'});assert.equal(vm.runInContext('Appearance.current.outfit',context),'wrap');
for(const localStorage of [{getItem(){throw Error('denied');},setItem(){throw Error('quota');}},{getItem:()=>'{bad',setItem(){throw Error('quota');}}]){const c=vm.createContext({localStorage});vm.runInContext(source,c);assert.equal(vm.runInContext('Appearance.current.outfit',c),'wrap');assert.equal(vm.runInContext('Appearance.save()',c),false);assert.ok(vm.runInContext('Appearance.initialError',c));}
const denied=vm.createContext({});Object.defineProperty(denied,'localStorage',{get(){throw Error('denied');}});vm.runInContext(source,denied);assert.equal(vm.runInContext('Appearance.save()',denied),false);
console.log('OK: schema, presets, random/reset, atomic imports, persistence, denied storage and storage events.');
