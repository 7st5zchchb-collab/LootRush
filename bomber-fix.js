/* LootRush Bomber: clean balance-gated START flow. */
(function(){
  let board=[],bombs=3,active=false,multiplier=1,safeCount=0;
  const START_COST=1, MULTIPLIERS=[1.14,1.28,1.56];
  const $=id=>document.getElementById(id);

  function getMultiplier(n){if(n<=0)return 1;if(n<=3)return MULTIPLIERS[n-1];return MULTIPLIERS[2]*Math.pow(2,n-3)}
  function balance(){return typeof diamonds==='number'&&Number.isFinite(diamonds)?diamonds:0}
  function saveBalance(){if(typeof saveGame==='function')saveGame();else localStorage.setItem('diamonds',String(diamonds))}

  function removeOldOffer(){
    const old=$('bomberOffer');
    if(old){old.classList.remove('show');old.style.display='none';}
    const oldModal=$('lrPurchaseOffer');
    if(oldModal){oldModal.classList.remove('show');oldModal.style.display='none';}
  }

  function ensureModal(){
    let modal=$('bomberInsufficientModal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='bomberInsufficientModal';
    modal.innerHTML=`<div class="bomber-offer-backdrop"></div><div class="bomber-offer-modal" role="dialog" aria-modal="true"><div class="bomber-insufficient">⚠️ Բավարար Diamonds չկա<div class="bomber-balance-line">Պետք է՝ <b class="required">1</b> 💎 &nbsp; | &nbsp; Balance՝ <b class="current">0</b> 💎</div></div><div class="bomber-offer-content"><div class="bomber-ad-box">Advertisement</div><div class="bomber-diamond-box"><div class="bomber-diamond-icon">💎</div><b>Need more Diamonds?</b><span>Get Diamonds instantly</span><button type="button" class="bomber-buy-diamonds">GET DIAMONDS</button></div></div><button type="button" class="bomber-skip">Skip</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.bomber-buy-diamonds').addEventListener('click',()=>{closeModal();if(typeof showPage==='function')showPage('shop')});
    modal.querySelector('.bomber-skip').addEventListener('click',closeModal);
    modal.querySelector('.bomber-offer-backdrop').addEventListener('click',closeModal);
    return modal;
  }

  function showModal(){
    removeOldOffer();
    const modal=ensureModal();
    modal.querySelector('.required').textContent=START_COST;
    modal.querySelector('.current').textContent=Math.floor(balance());
    modal.classList.add('show');
  }
  function closeModal(){const modal=$('bomberInsufficientModal');if(modal)modal.classList.remove('show')}

  function updateUI(){
    if($('bombCount'))$('bombCount').textContent=bombs;
    if($('safeCount'))$('safeCount').textContent=safeCount;
    if($('bomberMultiplier'))$('bomberMultiplier').textContent=multiplier.toFixed(2)+'x';
    if($('bomberDiamondBalance'))$('bomberDiamondBalance').textContent=Math.floor(balance());
    if($('bomberStartButton')){$('bomberStartButton').disabled=false;$('bomberStartButton').textContent='▶ START'}
    if($('bomberCashoutButton'))$('bomberCashoutButton').disabled=!active||safeCount===0;
  }

  function createBoard(){
    const c=$('bomberBoard');if(!c)return;c.innerHTML='';board=[];
    const positions=new Set();while(positions.size<bombs)positions.add(Math.floor(Math.random()*25));
    for(let i=0;i<25;i++){
      const cell=document.createElement('button');cell.type='button';cell.className='bomber-cell';cell.textContent='?';cell.dataset.bomb=positions.has(i)?'1':'0';
      cell.addEventListener('click',()=>openCell(cell));c.appendChild(cell);board.push(cell);
    }
  }

  function resetBoard(){active=false;safeCount=0;multiplier=1;closeModal();createBoard();updateUI()}

  function startBomberGame(){
    if(active)return;
    closeModal();
    if(balance()<START_COST){
      if($('bomberStatus'))$('bomberStatus').textContent='⚠️ NOT ENOUGH DIAMONDS';
      showModal();updateUI();return;
    }
    diamonds-=START_COST;saveBalance();safeCount=0;multiplier=1;active=true;createBoard();updateUI();
    if($('bomberStatus'))$('bomberStatus').textContent='READY';
  }

  function openCell(cell){
    if(!active||cell.disabled)return;cell.disabled=true;
    if(cell.dataset.bomb==='1'){
      cell.textContent='💣';cell.classList.add('bomb');active=false;
      board.forEach(c=>{c.disabled=true;if(c.dataset.bomb==='1')c.textContent='💣'});
      if($('bomberStatus'))$('bomberStatus').textContent='💥 BOMB!';updateUI();return;
    }
    safeCount++;multiplier=getMultiplier(safeCount);cell.textContent='💎';cell.classList.add('safe');updateUI();
    if(safeCount>=25-bombs)cashOutBomber();
  }

  function cashOutBomber(){if(!active||safeCount<1)return;active=false;if($('bomberStatus'))$('bomberStatus').textContent='CASH OUT '+multiplier.toFixed(2)+'x';board.forEach(c=>{c.disabled=true;if(c.dataset.bomb==='1')c.textContent='💣'});updateUI()}

  function changeBomberBombs(){if(active)return;let v=Number($('bomberBombSelector')?.value||3);if(!Number.isInteger(v)||v<3||v>24)v=3;bombs=v;if($('bomberBombSelector'))$('bomberBombSelector').value=String(v);resetBoard()}

  window.startBomberGame=startBomberGame;window.cashOutBomber=cashOutBomber;window.changeBomberBombs=changeBomberBombs;window.updateBomberBetUI=function(){};window.initBomber=resetBoard;
  window.skipGameOffer=function(game){if(game==='bomber')closeModal()};

  document.addEventListener('DOMContentLoaded',()=>{
    const s=$('bomberBombSelector');if(s){s.innerHTML='';for(let i=3;i<=24;i++){const o=document.createElement('option');o.value=String(i);o.textContent=i+' Bombs';s.appendChild(o)}s.value='3'}
    removeOldOffer();ensureModal();closeModal();resetBoard();
  });
})();
