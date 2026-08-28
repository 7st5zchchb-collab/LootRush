/* LootRush Multiplayer - direct Start -> offer flow */
(function(){
  const $ = id => document.getElementById(id);

  function showOffer(){
    const offer = $('multiplayerOffer');
    if(offer) offer.classList.add('show');
  }

  function setupMultiplayer(){
    const actions = document.querySelector('.mp-actions');
    const room = $('mpRoom');
    if(actions) actions.style.display = 'none';
    if(room) room.style.display = 'none';

    const card = document.querySelector('.multiplayer-card');
    if(!card || $('mpDirectStart')) return;

    const start = document.createElement('button');
    start.id = 'mpDirectStart';
    start.className = 'main-button';
    start.type = 'button';
    start.textContent = '▶ START';
    start.addEventListener('click', window.startMultiplayerGame);

    const offer = $('multiplayerOffer');
    if(offer) card.insertBefore(start, offer);
    else card.appendChild(start);
  }

  window.startMultiplayerGame = function(){
    showOffer();
  };

  window.skipGameOffer = function(type){
    const id = type === 'multiplayer' ? 'multiplayerOffer' : 'bomberOffer';
    const offer = $(id);
    if(offer) offer.classList.remove('show');
  };

  document.addEventListener('DOMContentLoaded', setupMultiplayer);
})();
