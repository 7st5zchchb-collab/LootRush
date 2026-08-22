/* LootRush - separate Daily Reward + Annual Package */
(function(){
  const DAILY_KEY='lootRushDaily100';
  const ANNUAL_KEY='lootRushAnnualPackage';
  const today=()=>new Date().toISOString().slice(0,10);
  const year=()=>String(new Date().getFullYear());
  const coins=()=>Number(localStorage.getItem('coins'))||0;
  const diamonds=()=>Number(localStorage.getItem('diamonds'))||0;
  function addCoins(n){localStorage.setItem('coins',String(coins()+n));window.updateAllUI?.();window.dispatchEvent(new Event('progressReward'));}
  function addDiamonds(n){localStorage.setItem('diamonds',String(diamonds()+n));window.updateAllUI?.();window.dispatchEvent(new Event('progressReward'));}
  function render(){
    const rewards=document.getElementById('rewards'); if(!rewards)return;
    let box=document.getElementById('separateRewardPackages');
    if(!box){box=document.createElement('div');box.id='separateRewardPackages';const card=rewards.querySelector('.page-card');card?.appendChild(box);}
    const dailyClaimed=localStorage.getItem(DAILY_KEY)===today();
    const annualClaimed=localStorage.getItem(ANNUAL_KEY)===year();
    box.innerHTML=`<div class="reward-package-title"><span>REWARD CENTER</span><h2>🎁 Rewards</h2><p>Choose your everyday reward or the once-a-year package.</p></div><div class="reward-package-grid"><div class="reward-package-card daily-package"><div class="package-icon">🎁</div><div class="package-copy"><span>EVERY DAY</span><h3>Daily Reward</h3><p>Claim once every day.</p><strong>+100 💵</strong></div><button id="daily100Btn" ${dailyClaimed?'disabled':''}>${dailyClaimed?'CLAIMED TODAY':'CLAIM +100 💵'}</button></div><div class="reward-package-card annual-package"><div class="package-icon">👑</div><div class="package-copy"><span>ONCE A YEAR</span><h3>Annual Package</h3><p>One package for the current year.</p><strong>12,000 💵 + 12 💎</strong></div><button id="annualPackageBtn" ${annualClaimed?'disabled':''}>${annualClaimed?'CLAIMED THIS YEAR':'CLAIM PACKAGE'}</button></div></div>`;
    document.getElementById('daily100Btn')?.addEventListener('click',claimDaily);
    document.getElementById('annualPackageBtn')?.addEventListener('click',claimAnnual);
  }
  function claimDaily(){if(localStorage.getItem(DAILY_KEY)===today())return;localStorage.setItem(DAILY_KEY,today());addCoins(100);render();}
  function claimAnnual(){if(localStorage.getItem(ANNUAL_KEY)===year())return;localStorage.setItem(ANNUAL_KEY,year());addCoins(12000);addDiamonds(12);alert('👑 Annual Package claimed! +12,000 💵 +12 💎');render();}
  function init(){render();const old=document.querySelector('#rewards .reward-box');if(old)old.style.display='none';}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
