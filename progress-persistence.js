/* LootRush persistent balance sync. Prevents refresh/close from resetting balances. */
(function(){
  const API="https://lootrush-2.onrender.com";
  function token(){return localStorage.getItem("lootRushToken")||"";}
  function nums(){return {coins:Number(localStorage.getItem("coins"))||0,diamonds:Number(localStorage.getItem("diamonds"))||0,points:Number(localStorage.getItem("points"))||0};}
  async function sync(){
    const t=token(); if(!t)return;
    const b=nums();
    try{
      const r=await fetch(API+"/sync-progress",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify(b),cache:"no-store"});
      if(!r.ok)return;
      const d=await r.json();
      if(!d.success||!d.user)return;
      localStorage.setItem("coins",String(d.user.coins));
      localStorage.setItem("diamonds",String(d.user.diamonds));
      localStorage.setItem("points",String(d.user.points));
      if(typeof coins!=="undefined")coins=Number(d.user.coins)||0;
      if(typeof diamonds!=="undefined")diamonds=Number(d.user.diamonds)||0;
      if(typeof points!=="undefined")points=Number(d.user.points)||0;
      if(typeof updateAllUI==="function")updateAllUI();
    }catch(e){console.warn("LootRush progress sync unavailable",e);}
  }
  window.lootRushSyncProgress=sync;
  window.addEventListener("DOMContentLoaded",()=>{
    sync();
    setInterval(sync,3000);
  });
  window.addEventListener("pagehide",()=>{
    const t=token();if(!t)return;
    const b=nums();
    try{navigator.sendBeacon(API+"/sync-progress",new Blob([JSON.stringify(b)],{type:"application/json"}))}catch(e){}
  });
})();
