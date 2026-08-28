/* LootRush Multiplayer - simple Start -> offer flow */
(function(){
  const $ = id => document.getElementById(id);

  function showOffer(){
    const offer = $('multiplayerOffer');
    if(offer) offer.classList.add('show');
  }

  window.startMultiplayerGame = function(){
    showOffer();
  };

  window.skipGameOffer = function(type){
    const id = type === 'multiplayer' ? 'multiplayerOffer' : 'bomberOffer';
    const offer = $(id);
    if(offer) offer.classList.remove('show');
  };
})();
