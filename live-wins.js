/* =====================================================
   LOOTRUSH - REAL LIVE WINNERS
   Authenticated SSE feed. No fake/demo winners.
===================================================== */
(function(){
  const SERVER='https://lootrush-2.onrender.com';
  let source=null;

  function token(){return localStorage.getItem('lootRushToken')||'';}
  function ensureFeed(){
    const game=document.getElementById('game'); if(!game)return null;
    let feed=document.getElementById('liveWinsFeed');
    if(!feed){
      const card=game.querySelector('.page-card'); if(!card)return null;
      feed=document.createElement('aside'); feed.id='liveWinsFeed';
      feed.innerHTML='<div class="live-wins-head"><span class="live-wins-title"><span class="live-dot"></span>RECENT WINS</span><span class="live-wins-badge">LIVE <span id="liveOnlineCount"></span></span></div><div id="liveWinsList"></div>';
      game.style.position='relative'; game.insertBefore(feed,card);
    }
    return feed;
  }
  function safe(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderWin(x,newItem){
    const list=document.getElementById('liveWinsList'); if(!list)return;
    const amount=Number(x.amount||0), formatted=Number.isInteger(amount)?String(amount):amount.toFixed(2);
    const row=document.createElement('div'); row.className='live-win'+(newItem?' live-win-new':'');
    row.innerHTML=`<div class="live-win-avatar">${safe(String(x.username||'?').charAt(0).toUpperCase())}</div><div class="live-win-main"><span class="live-win-user">${safe(x.username||'Player')}</span><span class="live-win-game">${safe(x.game||'Game')}</span></div><span class="live-win-reward">+${formatted} ${safe(x.currency||'💎')}</span>`;
    list.prepend(row); while(list.children.length>5)list.lastElementChild.remove();
  }
  function snapshot(wins){const list=document.getElementById('liveWinsList');if(!list)return;list.innerHTML='';(wins||[]).slice(0,5).reverse().forEach(x=>renderWin(x,false));}
  function setOnline(n){const el=document.getElementById('liveOnlineCount');if(el)el.textContent=n?` • ${n}`:'';}
  function connect(){
    ensureFeed(); if(source)source.close();
    source=new EventSource(`${SERVER}/api/wins/stream`);
    source.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.type==='snapshot'){snapshot(d.wins);setOnline(d.online)}else if(d.type==='online')setOnline(d.online);else if(d.username)renderWin(d,true)}catch(err){console.warn('Live Winners message error',err)}};
    source.onerror=()=>{source.close();setTimeout(connect,5000)};
  }
  async function publish(game,amount,currency='💎'){
    const t=token(), n=Number(amount); if(!t||!Number.isFinite(n)||n<=0)return;
    try{await fetch(`${SERVER}/api/wins`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${t}`},body:JSON.stringify({game,amount:n,currency})})}catch(err){console.warn('Live win publish failed',err)}
  }
  function coins(){return Number(localStorage.getItem('coins'))||0;}
  function diamonds(){return Number(localStorage.getItem('diamonds'))||0;}
  function wrapFunctions(){
    if(window.__liveWinsWrapped)return; window.__liveWinsWrapped=true;
    const originalRoll=window.rollLoot;
    if(typeof originalRoll==='function')window.rollLoot=function(){const beforeC=coins(),beforeD=diamonds(),beforeR=Number(localStorage.getItem('totalRolls'))||0;const result=originalRoll.apply(this,arguments);const afterR=Number(localStorage.getItem('totalRolls'))||0;if(afterR>beforeR){const dc=coins()-beforeC,dd=diamonds()-beforeD;if(dc>0)publish('🎲 Roll',dc,'💵');else if(dd>0)publish('🎲 Roll',dd,'💎')}return result};
    const originalBomber=window.cashOutBomber;
    if(typeof originalBomber==='function')window.cashOutBomber=function(){const before=diamonds(),result=originalBomber.apply(this,arguments),gain=diamonds()-before;if(gain>0)publish('💣 Bomber',gain,'💎');return result};
    const originalCrash=window.cashOutCrash;
    if(typeof originalCrash==='function')window.cashOutCrash=function(){const before=diamonds(),result=originalCrash.apply(this,arguments),gain=diamonds()-before;if(gain>0)publish('📈 Multiplier',gain,'💎');return result};
    const originalAuto=window.crashAutoWin;
    if(typeof originalAuto==='function')window.crashAutoWin=function(){const before=diamonds(),result=originalAuto.apply(this,arguments),gain=diamonds()-before;if(gain>0)publish('📈 Multiplier',gain,'💎');return result};
  }
  function init(){ensureFeed();connect();wrapFunctions();}
  window.publishLootRushWin=publish;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();