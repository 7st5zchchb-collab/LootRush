/* =====================================================
   LOOTRUSH - SHOP SKINS ONLY
   Isolated from game loot/items and Rewards.
===================================================== */
(function () {
  const SKINS = [
    { name: "Crimson", icon: "❤️", price: 800, css: "skin-crimson", visual: "linear-gradient(145deg,#3a0d20,#ff315c)" },
    { name: "Shadow", icon: "🖤", price: 1200, css: "skin-shadow", visual: "linear-gradient(145deg,#090b12,#394052)" },
    { name: "Electric", icon: "⚡", price: 1600, css: "skin-electric", visual: "linear-gradient(145deg,#071b35,#20b7ff)" },
    { name: "Galaxy", icon: "🌌", price: 2200, css: "skin-galaxy", visual: "linear-gradient(145deg,#16072f,#8d4dff,#19c7ff)" },
    { name: "Royal", icon: "👑", price: 3000, css: "skin-royal", visual: "linear-gradient(145deg,#241100,#ffb52e)" },
    { name: "Toxic", icon: "☢️", price: 3500, css: "skin-toxic", visual: "linear-gradient(145deg,#071a0c,#7dff45)" },
    { name: "Frost", icon: "❄️", price: 4200, css: "skin-frost", visual: "linear-gradient(145deg,#082333,#7fe9ff)" },
    { name: "Inferno", icon: "🌋", price: 5000, css: "skin-inferno", visual: "linear-gradient(145deg,#250500,#ff6b21,#ffd34d)" },
    { name: "Ocean", icon: "🌊", price: 5800, css: "skin-ocean", visual: "linear-gradient(145deg,#041827,#08bde8)" },
    { name: "Solar", icon: "☀️", price: 6500, css: "skin-solar", visual: "linear-gradient(145deg,#291000,#ff8c00,#ffe45c)" },
    { name: "Void", icon: "🌀", price: 7500, css: "skin-void", visual: "linear-gradient(145deg,#05000e,#5c21b6,#c026d3)" },
    { name: "Diamond", icon: "💠", price: 9000, css: "skin-diamond", visual: "linear-gradient(145deg,#071a27,#49e5ff,#d8ffff)" }
  ];
  window.LootRushShopSkins = SKINS;
  function ownedSkins(){try{return JSON.parse(localStorage.getItem("lootRushShopSkins")||"[]")}catch(e){return[]}}
  function buyLootRushSkin(name){
    const s=SKINS.find(x=>x.name===name);if(!s)return false;
    let coins=Number(localStorage.getItem("coins"))||0,owned=ownedSkins();
    if(owned.includes(s.name)){localStorage.setItem("currentSkin",s.name);renderShopSkins();return true}
    if(coins<s.price){alert(`Not enough 🪙 Coins! You need ${s.price.toLocaleString()} coins.`);return false}
    coins-=s.price;owned.push(s.name);localStorage.setItem("coins",String(coins));localStorage.setItem("lootRushShopSkins",JSON.stringify(owned));localStorage.setItem("currentSkin",s.name);window.dispatchEvent(new CustomEvent("skinChanged",{detail:s}));window.updateAllUI?.();renderShopSkins();return true;
  }
  function renderShopSkins(){
    const box=document.getElementById("coinShopItems");if(!box)return;const owned=ownedSkins();
    box.innerHTML=SKINS.map(s=>`<div class="shop-item skin-shop-item"><div class="shop-item-visual" style="background:${s.visual}"><span class="skin-glow">${s.icon}</span></div><div class="skin-shop-body"><h3>${s.name}</h3><p>Limited player skin</p><strong>${s.price.toLocaleString()} 🪙</strong><button class="main-button skin-buy-btn" data-shop-skin="${s.name}">${owned.includes(s.name)?"EQUIP":"BUY"}</button></div></div>`).join("");
    box.querySelectorAll("[data-shop-skin]").forEach(b=>b.onclick=()=>buyLootRushSkin(b.dataset.shopSkin));
  }
  window.buyLootRushSkin=buyLootRushSkin;window.renderLootRushShopSkins=renderShopSkins;document.addEventListener("DOMContentLoaded",renderShopSkins);
})();
