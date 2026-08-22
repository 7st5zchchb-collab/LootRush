/* LootRush - single Roll Info card. No extra text below it. */
(function(){
  const info = [
    ['COMMON','💰','Coin Bag',45],
    ['UNCOMMON','🪙','Big Coin Bag',25],
    ['RARE','💎','Diamond',15],
    ['EPIC','💎💎','Diamond Pack',8],
    ['LEGENDARY','🧰','Golden Chest',5],
    ['MYTHIC','👑','Mystery Crown',2]
  ];

  function render(){
    const game=document.getElementById('game');
    if(!game || document.getElementById('rollInfoCard')) return;

    const card=document.createElement('div');
    card.id='rollInfoCard';
    card.className='roll-info-card';
    card.innerHTML=`
      <div class="roll-info-title">ℹ️ ROLL INFO</div>
      <div class="roll-info-list">
        ${info.map(x=>`
          <div class="roll-info-row">
            <span class="roll-info-icon">${x[1]}</span>
            <span class="roll-info-name"><b>${x[2]}</b><small>${x[0]}</small></span>
            <strong>${x[3]}%</strong>
          </div>`).join('')}
      </div>
    `;

    const pageCard=game.querySelector('.page-card');
    const button=game.querySelector('.main-button');
    if(pageCard && button){
      button.insertAdjacentElement('afterend',card);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render);
  else render();
})();
