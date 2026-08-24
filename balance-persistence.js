/* LootRush account balance persistence: server is authoritative per user. */
(function(){
  const API=String(window.LOOTRUSH_API_URL || "https://lootrush-2.onrender.com").replace(/\/$/, "");
  let lastSaved="";
  let saveTimer=0;
  let saving=false;

  function token(){return localStorage.getItem("lootRushToken")||""}
  function values(){return {coins:Math.max(0,Math.floor(Number(localStorage.getItem("coins"))||0)),diamonds:Math.max(0,Math.floor(Number(localStorage.getItem("diamonds"))||0)),points:Math.max(0,Math.floor(Number(localStorage.getItem("points"))||0))}}
  function key(v){return `${v.coins}:${v.diamonds}:${v.points}`}

  async function save(force=false){
    const t=token(); if(!t||saving)return;
    const v=values(); if(!force&&key(v)===lastSaved)return;
    saving=true;
    try{
      const r=await fetch(`${API}/sync-progress`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${t}`},body:JSON.stringify(v),keepalive:true,cache:"no-store"});
      if(!r.ok)return;
      const d=await r.json().catch(()=>({}));
      if(d.success&&d.user){
        localStorage.setItem("coins",String(d.user.coins));
        localStorage.setItem("diamonds",String(d.user.diamonds));
        localStorage.setItem("points",String(d.user.points));
        localStorage.setItem("lootRushUser",JSON.stringify(d.user));
        lastSaved=key(d.user);
        if(typeof updateAllUI==="function")updateAllUI();
      }
    }catch(e){console.warn("Balance save failed",e)}finally{saving=false}
  }

  async function restore(){
    const t=token(); if(!t)return;
    try{
      const r=await fetch(`${API}/me`,{headers:{Authorization:`Bearer ${t}`},cache:"no-store"});
      if(!r.ok)return;
      const d=await r.json().catch(()=>({}));
      if(!d.success||!d.user)return;
      localStorage.setItem("coins",String(d.user.coins));
      localStorage.setItem("diamonds",String(d.user.diamonds));
      localStorage.setItem("points",String(d.user.points));
      localStorage.setItem("lootRushUser",JSON.stringify(d.user));
      lastSaved=key(d.user);
      if(typeof coins!=="undefined")coins=Number(d.user.coins)||0;
      if(typeof diamonds!=="undefined")diamonds=Number(d.user.diamonds)||0;
      if(typeof points!=="undefined")points=Number(d.user.points)||0;
      if(typeof updateAllUI==="function")updateAllUI();
    }catch(e){console.warn("Balance restore failed",e)}
  }

  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>save(false),1500);
  }

  window.lootRushSaveBalance=save;
  window.lootRushRestoreBalance=restore;
  window.lootRushScheduleBalanceSave=scheduleSave;

  window.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>restore(),900);
    setInterval(()=>save(false),5000);
  });
  window.addEventListener("beforeunload",()=>save(true));
  document.addEventListener("visibilitychange",()=>document.visibilityState==="hidden"?save(true):restore());
})();
