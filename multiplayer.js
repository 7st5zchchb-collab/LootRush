/* LootRush Multiplayer - local room UI foundation */
(function(){
  let roomCode = '';
  let started = false;
  const $ = id => document.getElementById(id);

  function showOffer(){
    const offer = $('multiplayerOffer');
    if(offer) offer.classList.add('show');
  }

  window.createMultiplayerRoom = function(){
    roomCode = String(Math.floor(1000 + Math.random() * 9000));
    started = false;
    const room = $('mpRoom');
    const code = $('mpRoomCode');
    const list = $('mpPlayerList');
    if(room) room.classList.remove('hidden');
    if(code) code.textContent = roomCode;
    if(list) list.innerHTML = '<div class="mp-player-card">👤 You <span>HOST</span></div>';
    const status = $('mpPlayers');
    if(status) status.textContent = '1 Player';
  };

  window.joinMultiplayerRoom = function(){
    const code = prompt('Enter Room Code');
    if(!code || !/^\d{4}$/.test(code)) return;
    roomCode = code;
    started = false;
    const room = $('mpRoom');
    const codeEl = $('mpRoomCode');
    const list = $('mpPlayerList');
    if(room) room.classList.remove('hidden');
    if(codeEl) codeEl.textContent = roomCode;
    if(list) list.innerHTML = '<div class="mp-player-card">👤 You <span>PLAYER</span></div>';
    const status = $('mpPlayers');
    if(status) status.textContent = '1 Player';
  };

  window.startMultiplayerGame = function(){
    if(!roomCode){
      window.createMultiplayerRoom();
      return;
    }
    started = true;
    const list = $('mpPlayerList');
    if(list) list.innerHTML += '<div class="mp-game-state">🟢 GAME STARTED</div>';
    showOffer();
  };

  window.skipGameOffer = function(type){
    const id = type === 'multiplayer' ? 'multiplayerOffer' : 'bomberOffer';
    const offer = $(id);
    if(offer) offer.classList.remove('show');
  };

  document.addEventListener('DOMContentLoaded', function(){
    const nav = document.querySelector('nav');
    if(nav && !Array.from(nav.querySelectorAll('button')).some(b => /Multiplayer/.test(b.textContent))){
      const button = document.createElement('button');
      button.textContent = '👥 Multiplayer';
      button.onclick = () => typeof showPage === 'function' && showPage('multiplayer');
      nav.appendChild(button);
    }
  });
})();
