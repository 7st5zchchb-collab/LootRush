/* Bomber reliability + instant replay + persistent balance loader. */
(function(){
function loadPersistence(){
 if(document.querySelector('script[data-lootrush-persistence]'))return;
 const s=document.createElement('script');s.src='progress-persistence.js';s.dataset.lootrushPersistence='1';document.head.appendChild(s);
}
function setup(){
 loadPersistence();
 const page=document.getElementById('bomber'); if(!page)return;
 const start=document.getElementById('bomberStartButton');
 const cash=document.getElementById('bomberCashoutButton');
 if(start) start.style.display='block';
 if(cash && typeof window.bomberGameActive!=='undefined' && !window.bomberGameActive){
   cash.disabled=true; cash.setAttribute('disabled','');
 }
}
function forceStartReady(){
 const start=document.getElementById('bomberStartButton');
 const cash=document.getElementById('bomberCashoutButton');
 if(start){start.disabled=false;start.removeAttribute('disabled');start.style.display='block';}
 if(cash){cash.disabled=true;cash.setAttribute('disabled','');}
}
function wrapCashOut(){
 if(typeof window.cashOutBomber!=='function' || window.cashOutBomber.__lootWrapped)return;
 const original=window.cashOutBomber;
 function wrappedCashOut(){
   const result=original.apply(this,arguments);
   setTimeout(forceStartReady,0);
   setTimeout(forceStartReady,100);
   return result;
 }
 wrappedCashOut.__lootWrapped=true;
 window.cashOutBomber=wrappedCashOut;
}
function watch(){setup();wrapCashOut();}
document.addEventListener('DOMContentLoaded',watch);
window.addEventListener('load',watch);
setInterval(watch,250);
})();
