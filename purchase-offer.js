/* Purchase offer: hidden on load; opens only when explicitly requested. */
(function(){
  function renderOffer(){
    if(document.getElementById('lrPurchaseOffer')) return;
    const wrap=document.createElement('div');
    wrap.id='lrPurchaseOffer';
    wrap.className='lr-purchase-offer';
    wrap.innerHTML=`<div class="lr-offer-row"><div class="lr-ad-box">Advertisement</div><div class="lr-buy-box"><span class="lr-diamond">💎</span><div class="lr-buy-title">Need more Diamonds?</div><div class="lr-buy-price">Get Diamonds instantly from the Shop</div><button class="lr-buy-btn" type="button" id="lrBuyDiamonds">BUY DIAMONDS</button></div></div><button class="lr-skip" type="button" id="lrSkipOffer">Skip</button>`;
    document.body.appendChild(wrap);
    document.getElementById('lrBuyDiamonds')?.addEventListener('click',()=>{wrap.classList.remove('show');if(typeof showPage==='function')showPage('shop');setTimeout(()=>document.querySelector('.diamond-shop-section')?.scrollIntoView({behavior:'smooth',block:'start'}),50)});
    document.getElementById('lrSkipOffer')?.addEventListener('click',()=>wrap.classList.remove('show'));
  }
  window.showLootRushPurchaseOffer=function(){renderOffer();document.getElementById('lrPurchaseOffer')?.classList.add('show')};
  document.addEventListener('DOMContentLoaded',()=>{renderOffer();document.getElementById('lrPurchaseOffer')?.classList.remove('show')});
})();
