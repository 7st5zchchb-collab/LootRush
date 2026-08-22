/* LootRush Rewards: daily missions + weekly 1000 points + monthly skins through Dec 31, 2026 */
(function(){
const XP='lootRushXP',LV='lootRushLevel',MD='lootRushMissionData',DB='lootRushDailyBonus',SK='lootRushUnlockedSkins',CS='lootRushCurrentSkin';
const missions=[
{id:'rolls10',title:'Roll 10 times',icon:'🎲',target:10,reward:400,type:'rolls',cur:'🪙'},
{id:'wins3',title:'Win 3 rewards',icon:'🏆',target:3,reward:400,type:'wins',cur:'🪙'},
{id:'rare1',title:'Find 1 Rare+ item',icon:'💎',target:1,reward:400,type:'rare',cur:'🪙'},
{id:'follow',title:'Follow LootRush',icon:'❤️',target:1,reward:400,type:'follow',cur:'🪙'},
{id:'invite',title:'Invite 1 friend',icon:'👥',target:1,reward:400,type:'invite',cur:'🪙'}
];
/* Monthly cosmetic rewards: one new skin each month, Aug-Dec 2026. */
const monthlySkins=[
{month:7,name:'Neon Rush',icon:'💗',date:'2026-08',desc:'August limited skin'},
{month:8,name:'Cyber Blue',icon:'💙',date:'2026-09',desc:'September limited skin'},
{month:9,name:'Golden Flame',icon:'🔥',date:'2026-10',desc:'October limited skin'},
{month:10,name:'Emerald Storm',icon:'💚',date:'2026-11',desc:'November limited skin'},
{month:11,name:'Diamond Frost',icon:'❄️',date:'2026-12',desc:'December limited skin'}
];
const extraSkins=[
{name:'Crimson',icon:'❤️'},
{name:'Shadow',icon:'🖤'},
{name:'Electric',icon:'⚡'},
{name:'Galaxy',icon:'🌌'},
{name:'Royal',icon:'👑'},
{name:'Toxic',icon:'☢️'}
];
const num=k=>Number(localStorage.getItem(k))||0;
const today=()=>new Date().toISOString().slice(0,10);
function weekKey(){const d=new Date(),x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),n=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()-n+1);return x.toISOString().slice(0,10)}
let xp=num(XP),level=Math.max(1,num(LV)||1),data={};
try{data=JSON.parse(localStorage.getItem(MD))||{}}catch(e){}
function save(){localStorage.setItem(MD,JSON.stringify(data))}
function reset(){const d=today(),w=weekKey();if(data.date!==d){data={...data,date:d,rolls:0,wins:0,rare:0,follow:0,invite:0,claimed:{},weeklyClaimed:data.week===w?!!data.weeklyClaimed:false}}if(data.week!==w){data.week=w;data.weekRolls=0;data.weekWins=0;data.weekPoints=0;data.weeklyClaimed=false}save()}
function required(){return 100+(level-1)*50}
function rewardCoins(c){localStorage.setItem('coins',String(num('coins')+c));window.__lootrushAddCoins?.(c);window.dispatchEvent(new Event('progressReward'));window.updateAllUI?.()}
function rewardDiamonds(n){const d=num('diamonds')+n;localStorage.setItem('diamonds',String(d));window.__lootrushAddDiamonds?.(n);window.dispatchEvent(new Event('progressReward'));window.updateAllUI?.()}
function reward(c){rewardCoins(c)}
function getSkins(){try{return JSON.parse(localStorage.getItem(SK))||[]}catch(e){return[]}}
function saveSkins(a){localStorage.setItem(SK,JSON.stringify([...new Set(a)]))}
function unlockSkin(name){const a=getSkins();if(!a.includes(name)){a.push(name);saveSkins(a)}window.dispatchEvent(new CustomEvent('skinUnlocked',{detail:{name}}));window.updateAllUI?.()}
function currentMonthlySkin(){const d=new Date(),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');return monthlySkins.find(s=>s.date===key)||null}
function render(){const h=document.getElementById('progressionPanel');if(!h)return;const req=required(),pct=Math.min(100,Math.round(xp/req*100)),wr=Math.min(data.weekRolls||0,50),ww=Math.min(data.weekWins||0,15),wp=Math.round(((wr/50)+(ww/15))*50),ready=wr>=50&&ww>=15;const owned=getSkins();const active=currentMonthlySkin();h.innerHTML=`<div class="prog-head"><div><span class="prog-kicker">PLAYER PROGRESSION</span><h2>⚡ Level ${level}</h2></div><div class="prog-xp">${xp} / ${req} XP</div></div><div class="xp-track"><i style="width:${pct}%"></i></div><div class="prog-missions"><div class="missions-title">🎯 DAILY MISSIONS <span>resets daily</span></div>${missions.map(m=>{const v=Math.min(data[m.type]||0,m.target),done=v>=m.target,claimed=!!data.claimed?.[m.id];return `<div class="mission ${done?'done':''}"><div class="mission-icon">${m.icon}</div><div class="mission-main"><strong>${m.title}</strong><small>${v} / ${m.target}</small><div class="mission-track"><i style="width:${Math.min(100,v/m.target*100)}%"></i></div></div><button data-mission="${m.id}" ${!done||claimed?'disabled':''}>${claimed?'CLAIMED':`+${m.reward} ${m.cur}`}</button></div>`}).join('')}</div><div class="weekly-reward-card ${ready?'weekly-ready':''}"><div><span class="prog-kicker">WEEKLY REWARD</span><h3>🏆 Weekly Champion</h3><small>50 Rolls + 15 Wins · 1 reward per week</small><div class="weekly-track"><i style="width:${wp}%"></i></div><small>${wr}/50 Rolls · ${ww}/15 Wins · ${data.weekPoints||0}/1,000 Points</small></div><button id="claimWeekly" ${!ready||data.weeklyClaimed?'disabled':''}>${data.weeklyClaimed?'CLAIMED':'+1,000 POINTS'}</button></div><div class="reward-drops-card"><div class="reward-drops-title">💎 WEEKLY PRIZE DROP</div><small>Diamonds are rare. Most weekly drops are coins.</small><div class="reward-drop-grid"><span>💎 1 <b>Common</b></span><span>💎 2 <b>Rare</b></span><span>💎 5 <b>Legendary</b></span><span>🪙 Coins <b>Most likely</b></span></div></div><div class="monthly-skins-card"><div class="reward-drops-title">👑 MONTHLY SKINS</div><small>One new limited skin every month until December 31, 2026.</small><div class="skin-grid">${monthlySkins.map(s=>{const ownedSkin=owned.includes(s.name);return `<div class="reward-skin ${ownedSkin?'owned':''}"><span class="skin-icon">${s.icon}</span><strong>${s.name}</strong><small>${s.desc}</small><button data-skin="${s.name}" ${ownedSkin?'disabled':''}>${ownedSkin?'OWNED':s.date==='2026-08'?'UNLOCK':'COMING SOON'}</button></div>`}).join('')}${extraSkins.map(s=>{const o=owned.includes(s.name);return `<div class="reward-skin extra-skin ${o?'owned':''}"><span class="skin-icon">${s.icon}</span><strong>${s.name}</strong><small>Bonus skin</small><button data-extra-skin="${s.name}" ${o?'disabled':''}>${o?'OWNED':'LOCKED'}</button></div>`}).join('')}</div></div>`;h.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>claim(b.dataset.mission));h.querySelector('#claimWeekly')?.addEventListener('click',claimWeekly);h.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>claimMonthlySkin(b.dataset.skin));h.querySelectorAll('[data-extra-skin]').forEach(b=>b.onclick=()=>unlockSkin(b.dataset.extraSkin));}
function addXP(n){xp+=n;while(xp>=required()){xp-=required();level++;const t=document.createElement('div');t.className='levelup-toast';t.innerHTML=`<span>⚡ LEVEL UP!</span><strong>Level ${level}</strong>`;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}localStorage.setItem(XP,String(xp));localStorage.setItem(LV,String(level));render()}
function claim(id){reset();const m=missions.find(x=>x.id===id);if(!m||data.claimed?.[id]||(data[m.type]||0)<m.target)return;data.claimed[id]=true;reward(m.reward);addXP(50);save();render()}
function claimWeekly(){reset();if((data.weekRolls||0)<50||(data.weekWins||0)<15||data.weeklyClaimed)return;data.weeklyClaimed=true;data.weekPoints=1000;/* Rare diamond drop: 1 is common, 2 rare, 5 legendary; coins are most likely. */const r=Math.random(),diamond=r<0.005?5:r<0.035?2:r<0.18?1:0;if(diamond)rewardDiamonds(diamond);else rewardCoins(1000);addXP(250);save();render();alert(diamond?`🏆 Weekly Reward! +${diamond} 💎 +1,000 Points`:'🏆 Weekly Reward! +1,000 Points +1,000 🪙')}
function claimMonthlySkin(name){reset();const s=monthlySkins.find(x=>x.name===name);if(!s||s.date!==today().slice(0,7)||getSkins().includes(name))return;unlockSkin(name);alert(`👑 New monthly skin unlocked: ${name}!`);render()}
function trackRoll(){reset();data.rolls++;data.weekRolls=(data.weekRolls||0)+1;addXP(5);save()}
function trackWin(rare){reset();data.wins++;data.weekWins=(data.weekWins||0)+1;if(rare)data.rare++;addXP(15);save()}
function daily(){reset();if(localStorage.getItem(DB)===today()){alert('🎁 Daily Bonus already claimed today!');return}localStorage.setItem(DB,today());reward(400);addXP(25);alert('🎁 Daily Bonus claimed! +400 🪙 +25 XP')}
function markFollow(){reset();data.follow=1;save();render()}function invite(){navigator.clipboard?.writeText(location.href);reset();data.invite=1;save();render();alert('👥 Invite link copied!')}
function init(){reset();const game=document.getElementById('game');if(game&&!document.getElementById('progressionPanel')){const p=document.createElement('div');p.id='progressionPanel';game.appendChild(p)}render();const btn=document.querySelector('#rewards .reward-box .main-button');if(btn)btn.onclick=daily;const original=window.rollLoot;if(typeof original==='function'&&!window.__progressRoll){window.__progressRoll=true;window.rollLoot=function(){const before=num('totalRolls'),r=original.apply(this,arguments);if(num('totalRolls')>before)trackRoll();return r}}}
window.lootRushTrackWin=trackWin;window.lootRushTrackRare=()=>trackWin(true);window.lootRushProgress={get level(){return level},get xp(){return xp},markFollow,invite,unlockSkin};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();