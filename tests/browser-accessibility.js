(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);};Input.activate('keyboard');
 check(canvas.tabIndex===0&&canvas.getAttribute('aria-label').length>40,'canvas keyboard instructions');
 for(const el of document.querySelectorAll('.bottom-bar button,.bottom-bar nav a')){const r=el.getBoundingClientRect();check(r.width>=32&&r.height>=32,'desktop target');check((el.getAttribute('aria-label')||el.textContent||el.title).trim().length>0,'accessible tool name');}
 for(const id of ['debug','slow','paused'])check(['true','false'].includes(document.getElementById(id).getAttribute('aria-pressed')),'toggle state');
 document.body.tabIndex=-1;document.body.focus();return 'Accessible names, toggle states and desktop targets passed';
})()
