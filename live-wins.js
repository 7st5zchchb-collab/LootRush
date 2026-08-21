/* =====================================================
   LOOTRUSH - LIVE WINS FEED
   Demo feed: rotating simulated wins, not real player data.
===================================================== */
(function(){
  const wins=[
    {u:'Arman',a:'👤',g:'💣 Bomber',r:'+24 💎'},
    {u:'Narek',a:'🧑',g:'📈 Multiplier',r:'+12 💎'},
    {u:'David',a:'🎮',g:'🎲 Roll',r:'+500 🪙'},
    {u:'Mika',a:'😎',g:'💣 Bomber',r:'+8 💎'},
    {u:'Leo',a:'👑',g:'📈 Multiplier',r:'+35 💎'},
    {u:'Saro',a:'🧑',g:'🎲 Roll',r:'+100 🪙'},
    {u:'Alex',a:'🔥',g:'💣 Bomber',r:'+18 💎'},
    {u:'Tigran',a:'⚡',g:'📈 Multiplier',r:'+20 💎'}
  ];
  let cursor=4;
  function render(){
    const list=document.getElementById('liveWinsList');
    if(!list)return;
    list.innerHTML=wins.slice(0,4).map((x,i)=>`<div class="live-win${i===0?' live-win-new':''}"><div class="live-win-avatar">${x.a}</div><div class="live-win-main"><span class="live-win-user">${x.u}</span><span class="live-win-game">${x.g}</span></div><span class="live-win-reward">${x.r}</span></div>`).join('');
  }
  function addWin(){
    const list=document.getElementById('liveWinsList');
    if(!list)return;
    const x=wins[cursor%wins.length]; cursor++;
    wins.unshift(x); wins.pop(); render();
  }
  function init(){
    if(document.getElementById('liveWinsFeed')){render();setInterval(addWin,4200);return;}
    const game=document.getElementById('game');
    if(!game)return;
    const card=game.querySelector('.page-card');
    if(!card)return;
    const feed=document.createElement('aside');
    feed.id='liveWinsFeed';
    feed.innerHTML='<div class="live-wins-head"><span class="live-wins-title"><span class="live-dot"></span>RECENT WINS</span><span class="live-wins-badge">LIVE</span></div><div id="liveWinsList"></div>';
    game.style.position='relative';
    game.insertBefore(feed,card);
    render();
    setInterval(addWin,4200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();