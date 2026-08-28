/* =====================================================
   LOOTRUSH - DAILY REWARDS FIX
   OPEN REWARDS shows the daily reward list and claims
   exactly the reward displayed for the current day.
===================================================== */
(function(){
  const KEY = 'lootRushDailyRewardState';
  const rewards = [
    { day: 1, icon: '💵', amount: 50, type: 'coins', label: '50 Coins' },
    { day: 2, icon: '💵', amount: 100, type: 'coins', label: '100 Coins' },
    { day: 3, icon: '💎', amount: 1, type: 'diamonds', label: '1 Diamond' },
    { day: 4, icon: '💵', amount: 250, type: 'coins', label: '250 Coins' },
    { day: 5, icon: '💎', amount: 2, type: 'diamonds', label: '2 Diamonds' },
    { day: 6, icon: '💵', amount: 500, type: 'coins', label: '500 Coins' },
    { day: 7, icon: '💎', amount: 5, type: 'diamonds', label: '5 Diamonds' }
  ];

  const today = () => new Date().toISOString().slice(0,10);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { return {}; } };
  const save = s => localStorage.setItem(KEY, JSON.stringify(s));

  function dayNumber(){
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    return (Math.floor((now - first) / 86400000) % 7) + 1;
  }

  function claimReward(reward, state){
    if(reward.type === 'coins'){
      const coins = Number(localStorage.getItem('coins')) || 0;
      localStorage.setItem('coins', String(coins + reward.amount));
      window.updateAllUI?.();
    } else {
      const diamonds = Number(localStorage.getItem('diamonds')) || 0;
      localStorage.setItem('diamonds', String(diamonds + reward.amount));
      window.updateAllUI?.();
    }
    state.claimedDate = today();
    state.claimedDay = reward.day;
    save(state);
  }

  function openRewards(){
    let state = load();
    const currentDay = dayNumber();
    const reward = rewards[currentDay - 1];
    const alreadyClaimed = state.claimedDate === today();

    let modal = document.getElementById('dailyRewardsModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'dailyRewardsModal';
      modal.innerHTML = `
        <div class="daily-rewards-backdrop">
          <div class="daily-rewards-modal">
            <button class="daily-rewards-close" aria-label="Close">×</button>
            <div class="daily-rewards-kicker">🎁 DAILY REWARDS</div>
            <h2>Claim your daily reward</h2>
            <p class="daily-rewards-subtitle">Come back every day for the next reward.</p>
            <div class="daily-rewards-grid"></div>
            <button class="daily-rewards-claim"></button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.daily-rewards-close').onclick = () => modal.remove();
      modal.querySelector('.daily-rewards-backdrop').onclick = e => {
        if(e.target.classList.contains('daily-rewards-backdrop')) modal.remove();
      };
    }

    const grid = modal.querySelector('.daily-rewards-grid');
    grid.innerHTML = rewards.map(r => `
      <div class="daily-reward-card ${r.day === currentDay ? 'today' : ''} ${r.day < currentDay ? 'past' : ''}">
        <small>DAY ${r.day}</small>
        <strong>${r.icon} ${r.label}</strong>
        ${r.day === currentDay ? '<span class="today-badge">TODAY</span>' : ''}
      </div>`).join('');

    const button = modal.querySelector('.daily-rewards-claim');
    button.disabled = alreadyClaimed;
    button.textContent = alreadyClaimed ? `✅ DAY ${currentDay} CLAIMED` : `🎁 CLAIM ${reward.label.toUpperCase()}`;
    button.onclick = () => {
      const fresh = load();
      if(fresh.claimedDate === today()) return;
      claimReward(reward, fresh);
      button.disabled = true;
      button.textContent = `✅ DAY ${currentDay} CLAIMED`;
      const msg = document.getElementById('message');
      if(msg){
        msg.textContent = `🎁 Daily Reward: +${reward.amount} ${reward.type === 'coins' ? '💵' : '💎'}`;
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 2500);
      }
    };

    modal.classList.add('show');
  }

  function injectStyle(){
    if(document.getElementById('dailyRewardsFixStyle')) return;
    const s=document.createElement('style');
    s.id='dailyRewardsFixStyle';
    s.textContent=`
      #dailyRewardsModal{position:fixed;inset:0;z-index:99999;display:none}
      #dailyRewardsModal.show{display:block}
      .daily-rewards-backdrop{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(10px)}
      .daily-rewards-modal{position:relative;width:min(620px,96vw);padding:30px;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:linear-gradient(145deg,#181820,#09090d);box-shadow:0 30px 100px rgba(0,0,0,.7)}
      .daily-rewards-close{position:absolute;right:16px;top:12px;border:0;background:transparent;color:#aaa;font-size:30px;cursor:pointer}
      .daily-rewards-kicker{color:#ff174f;font-weight:900;font-size:12px;letter-spacing:2px}
      .daily-rewards-modal h2{margin:8px 0;color:#fff;font-size:28px}
      .daily-rewards-subtitle{color:#999;margin-bottom:20px}
      .daily-rewards-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .daily-reward-card{min-height:82px;padding:12px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:7px;justify-content:center}
      .daily-reward-card.today{border-color:rgba(255,23,79,.65);box-shadow:0 0 20px rgba(255,23,79,.12)}
      .daily-reward-card.past{opacity:.55}
      .daily-reward-card small{color:#888;font-size:10px;font-weight:800}
      .daily-reward-card strong{font-size:13px;color:#fff}
      .today-badge{color:#ff5578;font-size:9px;font-weight:900}
      .daily-rewards-claim{width:100%;margin-top:18px;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#ff174f,#c5003b);color:#fff;font-weight:900;cursor:pointer}
      .daily-rewards-claim:disabled{opacity:.55;cursor:not-allowed}
      @media(max-width:600px){.daily-rewards-grid{grid-template-columns:repeat(2,1fr)}.daily-rewards-modal{padding:24px 18px}}
    `;
    document.head.appendChild(s);
  }

  function init(){
    injectStyle();
    const btn=document.querySelector('#rewards .reward-box .main-button');
    if(btn){
      btn.onclick=openRewards;
      btn.textContent='🎁 OPEN REWARDS';
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
