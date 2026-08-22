/* Bomber reliability + instant replay fix. */
(function(){
function setup(){
 const page=document.getElementById('bomber'); if(!page)return;
 let replay=document.getElementById('bomberReplayButton');
 if(!replay){
  replay=document.createElement('button'); replay.id='bomberReplayButton'; replay.className='main-button bomber-replay-button'; replay.type='button'; replay.textContent='🔄 PLAY AGAIN'; replay.style.display='none';
  const cash=document.getElementById('bomberCashoutButton'); if(cash)cash.insertAdjacentElement('afterend',replay);else page.querySelector('.page-card')?.appendChild(replay);
  replay.addEventListener('click',()=>{replay.style.display='none';const start=document.getElementById('bomberStartButton');if(start){start.disabled=false;start.removeAttribute('disabled');}if(typeof window.startBomberGame==='function')window.startBomberGame();});
 }
 const status=document.getElementById('bomberStatus'); const text=(status?.textContent||'').trim().toUpperCase();
 const active=typeof window.bomberGameActive!=='undefined'?window.bomberGameActive:false;
 if(!active&&text!=='READY'&&/WIN|LOST|LOSE|BUST|CASH|GAME|SAFE|BOMB/.test(text))replay.style.display='block';
}
function watch(){setup();const s=document.getElementById('bomberStatus');if(s&&!s.__bw){s.__bw=true;new MutationObserver(setup).observe(s,{childList:true,subtree:true,characterData:true});}}
document.addEventListener('DOMContentLoaded',watch);window.addEventListener('load',watch);setInterval(watch,500);
})();
