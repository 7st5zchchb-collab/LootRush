/* LootRush Progression: XP, Levels, Missions, Daily Bonus */
(function(){
  const XP='lootRushXP', LV='lootRushLevel', MD='lootRushMissionData', DB='lootRushDailyBonus';
  const missions=[
    {id:'rolls10',title:'Roll 10 times',icon:'🎲',target:10,reward:150,type:'rolls',cur:'🪙'},
    {id:'wins3',title:'Win 3 rewards',icon:'🏆',target:3,reward:2,type:'wins',cur:'💎'},
    {id:'rare1',title:'Find 1 Rare+ item',icon:'💎',target:1,reward:1,type:'rare',cur:'💎'}
  ];
  const num=k=>Number(localStorage.getItem(k))||0;
  const today=()=>new Date().toISOString().slice(0,10);
  let xp=num(XP),level=Math.max(1,num(LV)||1),data={};
  try{data=JSON.parse(localStorage.getItem(MD))||{};}catch(e){data={};}
  function reset(){if(data.date!==today()){data={date:today(),rolls:0,wins:0,rare:0,claimed:{}};localStorage.setItem(MD,JSON.stringify(data));}}
  function required(){return 100+(level-1)*50;}
  function reward(coins,diamonds){if(coins){window.__lootrushAddCoins?.(coins);localStorage.setItem('coins',num('coins')+coins);}if(diamonds){window.__lootrushAddDiamonds?.(diamonds);localStorage.setItem('diamonds',num('diamonds')+diamonds);}window.dispatchEvent(new Event('progressReward'));}
  function render(){const h=document.getElementById('progressionPanel');if(!h)return;const req=required(),pct=Math.min(100,Math.round(xp/req*100));h.innerHTML=`<div class="prog-head"><div><span class="prog-kicker">PLAYER PROGRESSION</span><h2>⚡ Level ${level}</h2></div><div class="prog-xp">${xp} / ${req} XP</div></div><div class="xp-track"><i style="width:${pct}%"></i></div><div class="prog-missions"><div class="missions-title">🎯 DAILY MISSIONS <span>resets daily</span></div>${missions.map(m=>{const v=data[m.type]||0,done=v>=m.target,claimed=!!(data.claimed&&data.claimed[m.id]);return `<div class="mission ${done?'done':''}"><div class="mission-icon">${m.icon}</div><div class="mission-main"><strong>${m.title}</strong><small>${Math.min(v,m.target)} / ${m.target}</small><div class="mission-track"><i style="width:${Math.min(100,v/m.target*100)}%"></i></div></div><button data-mission="${m.id}" ${!done||claimed?'disabled':''}>${claimed?'CLAIMED':`+${m.reward} ${m.cur}`}</button></div>`}).join('')}</div>`;h.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>claim(b.dataset.mission));}
  function addXP(n){xp+=n;while(xp>=required()){xp-=required();level++;levelUp();}localStorage.setItem(XP,String(xp));localStorage.setItem(LV,String(level));render();}
  function levelUp(){const n=document.createElement('div');n.className='levelup-toast';n.innerHTML=`<span>⚡ LEVEL UP!</span><strong>Level ${level}</strong>`;document.body.appendChild(n);setTimeout(()=>n.remove(),2600);}
  function claim(id){const m=missions.find(x=>x.id===id);if(!m||!data.claimed||data.claimed[id]||(data[m.type]||0)<m.target)return;data.claimed[id]=true;reward(m.type==='rare'?0:m.reward,m.type==='rare'?m.reward:m.type==='wins'?m.reward:0);addXP(50);localStorage.setItem(MD,JSON.stringify(data));render();}
  function trackRoll(){reset();data.rolls++;addXP(5);localStorage.setItem(MD,JSON.stringify(data));}
  function trackWin(rare){reset();data.wins++;if(rare)data.rare++;addXP(15);localStorage.setItem(MD,JSON.stringify(data));}
  function daily(){reset();if(localStorage.getItem(DB)===today()){alert('🎁 Daily Bonus already claimed today!');return;}localStorage.setItem(DB,today());reward(250,0);addXP(25);alert('🎁 Daily Bonus claimed! +250 🪙 +25 XP');}
  function init(){reset();const game=document.getElementById('game');if(game&&!document.getElementById('progressionPanel')){const p=document.createElement('div');p.id='progressionPanel';game.appendChild(p);}render();const btn=document.querySelector('#rewards .reward-box .main-button');if(btn){btn.onclick=daily;}const original=window.rollLoot;if(typeof original==='function'&&!window.__progressRoll){window.__progressRoll=true;window.rollLoot=function(){const before=num('totalRolls'),r=original.apply(this,arguments);if(num('totalRolls')>before)trackRoll();return r;};}}
  window.lootRushTrackWin=trackWin;window.lootRushTrackRare=()=>trackWin(true);window.lootRushProgress={get level(){return level},get xp(){return xp}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
