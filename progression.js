/* LootRush Progression: daily tasks, 400 coin rewards, XP and level */
(()=>{
const XP='lootRushXP',LV='lootRushLevel',MD='lootRushMissionData',DB='lootRushDailyBonus';
const tasks=[
{id:'roll10',title:'Roll 10 times',icon:'🎲',target:10,reward:400,type:'rolls'},
{id:'win3',title:'Win 3 rewards',icon:'🏆',target:3,reward:400,type:'wins'},
{id:'rare1',title:'Find 1 Rare+ item',icon:'💎',target:1,reward:400,type:'rare'},
{id:'follow',title:'Follow LootRush',icon:'❤️',target:1,reward:400,type:'follow'},
{id:'invite',title:'Invite 1 friend',icon:'👥',target:1,reward:400,type:'invite'}];
const num=k=>Number(localStorage.getItem(k))||0,today=()=>new Date().toISOString().slice(0,10);
let xp=num(XP),level=Math.max(1,num(LV)||1),data={};try{data=JSON.parse(localStorage.getItem(MD))||{};}catch(e){data={};}
function save(){localStorage.setItem(MD,JSON.stringify(data));}function reset(){if(data.date!==today()){data={date:today(),rolls:0,wins:0,rare:0,follow:0,invite:0,claimed:{}};save();}}
function need(){return 100+(level-1)*50;}
function reward(c){let x=num('coins')+c;localStorage.setItem('coins',x);window.__lootrushAddCoins?.(c);window.dispatchEvent(new Event('progressReward'));window.updateAllUI?.();}
function render(){const h=document.getElementById('progressionPanel');if(!h)return;const req=need(),pct=Math.min(100,Math.round(xp/req*100));h.innerHTML=`<div class="prog-head"><div><span class="prog-kicker">PLAYER PROGRESSION</span><h2>⚡ Level ${level}</h2></div><div class="prog-xp">${xp} / ${req} XP</div></div><div class="xp-track"><i style="width:${pct}%"></i></div><div class="missions-title">🎯 DAILY TASKS <span>resets daily</span></div><div class="missions-list">${tasks.map(t=>{let v=Math.min(data[t.type]||0,t.target),done=v>=t.target,claimed=!!data.claimed?.[t.id];return `<div class="mission ${done?'done':''}"><div class="mission-icon">${t.icon}</div><div class="mission-main"><strong>${t.title}</strong><small>${v} / ${t.target}</small><div class="mission-track"><i style="width:${Math.min(100,v/t.target*100)}%"></i></div></div><button data-task="${t.id}" ${!done||claimed?'disabled':''}>${claimed?'CLAIMED':`+${t.reward} 🪙`}</button></div>`}).join('')}</div>`;h.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>claim(b.dataset.task));}
function addXP(a){xp+=a;while(xp>=need()){xp-=need();level++;const t=document.createElement('div');t.className='levelup-toast';t.innerHTML=`<span>⚡ LEVEL UP!</span><strong>Level ${level}</strong>`;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}localStorage.setItem(XP,String(xp));localStorage.setItem(LV,String(level));render();}
function claim(id){reset();const t=tasks.find(x=>x.id===id);if(!t||data.claimed?.[id]||(data[t.type]||0)<t.target)return;data.claimed[id]=true;reward(t.reward);addXP(50);save();render();}
function track(type){reset();data[type]=(data[type]||0)+1;save();addXP(5);}
function daily(){reset();if(localStorage.getItem(DB)===today()){alert('🎁 Daily Bonus already claimed today!');return;}localStorage.setItem(DB,today());reward(400);addXP(25);alert('🎁 Daily Bonus claimed! +400 🪙 +25 XP');}
function markFollow(){reset();data.follow=1;save();render();}
function invite(){navigator.clipboard?.writeText(location.href);reset();data.invite=1;save();render();alert('👥 Invite link copied!');}
function init(){reset();const game=document.getElementById('game');if(game&&!document.getElementById('progressionPanel')){const p=document.createElement('div');p.id='progressionPanel';game.appendChild(p);}render();const b=document.querySelector('#rewards .reward-box .main-button');if(b){b.onclick=daily;}window.lootRushProgress={track,markFollow,invite};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();
