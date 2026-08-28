/* LootRush account balance persistence: server is authoritative per user. */
(function(){
  const API=String(window.LOOTRUSH_API_URL || "https://lootrush.7st5zchchb.workers.dev").replace(/\/$/, "");
  let lastSaved="";
  let saveTimer=0;
  let saving=false;
  let restored=false;

  function token(){return localStorage.getItem("lootRushToken")||""}
  function values(){return {coins:Math.max(0,Math.floor(Number(localStorage.getItem("coins"))||0)),diamonds:Math.max(0,Math.floor(Number(localStorage.getItem("diamonds"))||0)),points:Math.max(0,Math.floor(Number(localStorage.getItem("points"))||0))}}
  function key(v){return `${v.coins}:${v.diamonds}:${v.points}`}

  function updateWallet(){
    const p=document.getElementById("walletPoints");
    const d=document.getElementById("walletDiamonds");
    const v=document.getElementById("walletDollarValue");
    const wd=document.getElementById("withdrawDiamonds");
    const wv=document.getElementById("withdrawDollarValue");
    const points=Math.max(0,Math.floor(Number(localStorage.getItem("points"))||0));
    const diamonds=Math.max(0,Math.floor(Number(localStorage.getItem("diamonds"))||0));
    if(p)p.textContent=points;
    if(d)d.textContent=diamonds;
    if(v)v.textContent=(diamonds*0.10).toFixed(2);
    if(wd&&document.activeElement!==wd)wd.value=wd.value||"";
    if(wv){const amount=Math.max(0,Number(wd?.value)||0);wv.textContent=(amount*0.10).toFixed(2)}
  }
  window.updateWallet=updateWallet;

  async function save(force=false){
    const t=token();
    if(!t||saving||!restored)return;
    const v=values();
    if(!force&&key(v)===lastSaved)return;
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
    const t=token();
    if(!t)return false;
    try{
      const r=await fetch(`${API}/me`,{headers:{Authorization:`Bearer ${t}`},cache:"no-store"});
      if(!r.ok)return false;
      const d=await r.json().catch(()=>({}));
      if(!d.success||!d.user)return false;

      // Server is authoritative. Restore BEFORE any periodic save can run.
      localStorage.setItem("coins",String(d.user.coins));
      localStorage.setItem("diamonds",String(d.user.diamonds));
      localStorage.setItem("points",String(d.user.points));
      localStorage.setItem("lootRushUser",JSON.stringify(d.user));
      lastSaved=key(d.user);
      if(typeof coins!=="undefined")coins=Number(d.user.coins)||0;
      if(typeof diamonds!=="undefined")diamonds=Number(d.user.diamonds)||0;
      if(typeof points!=="undefined")points=Number(d.user.points)||0;
      restored=true;
      if(typeof updateAllUI==="function")updateAllUI();
      return true;
    }catch(e){console.warn("Balance restore failed",e);return false}
  }

  function scheduleSave(){
    if(!restored)return;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>save(false),1500);
  }

  window.lootRushSaveBalance=save;
  window.lootRushRestoreBalance=restore;
  window.lootRushScheduleBalanceSave=scheduleSave;

  window.addEventListener("DOMContentLoaded",async()=>{
    // Restore first. Do not send the browser's starter/default balance to the server.
    await restore();
    setInterval(()=>save(false),5000);
    setTimeout(updateWallet,0);
  });

  window.addEventListener("beforeunload",()=>save(true));
  document.addEventListener("visibilitychange",()=>document.visibilityState==="hidden"?save(true):restore());
})();
