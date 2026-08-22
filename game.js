/* =====================================================
   LOOTRUSH GAME.JS
===================================================== */
const STRIPE_SERVER_URL = "https://lootrush-2.onrender.com";

let coins = Number(localStorage.getItem("coins")) || 200;
let diamonds = Number(localStorage.getItem("diamonds")) || 0;
let points = Number(localStorage.getItem("points")) || 0;
let totalRolls = Number(localStorage.getItem("totalRolls")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;
let bestStreak = Number(localStorage.getItem("bestStreak")) || 0;
let rareItems = Number(localStorage.getItem("rareItems")) || 0;
let playerName = localStorage.getItem("playerName") || "Guest";
let playerAvatar = localStorage.getItem("playerAvatar") || "default-avatar.png";
let currentSkin = localStorage.getItem("currentSkin") || "Default";
let inventory = [];
try { inventory = JSON.parse(localStorage.getItem("inventory")) || []; } catch { inventory = []; }

const loot = [
 {name:"Coin Bag",icon:"💰",rarity:"COMMON",description:"A small bag of coins.",reward:50,type:"coins",chance:45},
 {name:"Big Coin Bag",icon:"🪙",rarity:"UNCOMMON",description:"A bigger bag of coins.",reward:100,type:"coins",chance:25},
 {name:"Diamond",icon:"💎",rarity:"RARE",description:"A shiny diamond.",reward:1,type:"diamonds",chance:15},
 {name:"Diamond Pack",icon:"💎💎",rarity:"EPIC",description:"A pack of diamonds.",reward:3,type:"diamonds",chance:8},
 {name:"Golden Chest",icon:"🧰",rarity:"LEGENDARY",description:"A legendary golden chest.",reward:500,type:"coins",chance:5},
 {name:"Mystery Crown",icon:"👑",rarity:"MYTHIC",description:"An extremely rare item.",reward:10,type:"diamonds",chance:2}
];

const coinShop = [
 {name:"Shadow Skin",icon:"🌑",price:500,type:"coins",skin:"Shadow"},
 {name:"Fire Skin",icon:"🔥",price:1000,type:"coins",skin:"Fire"},
 {name:"Ice Skin",icon:"❄️",price:1500,type:"coins",skin:"Ice"}
];

const diamondShop = [
 {name:"1 Diamond",icon:"💎",diamonds:1,oldPrice:1,price:0.99,type:"dollarDiamonds",productId:"diamonds_1"},
 {name:"10 Diamonds",icon:"💎",diamonds:10,oldPrice:10,price:9,type:"dollarDiamonds",productId:"diamonds_10"},
 {name:"50 Diamonds",icon:"💎",diamonds:50,oldPrice:50,price:39.99,type:"dollarDiamonds",productId:"diamonds_50"},
 {name:"100 Diamonds",icon:"💎",diamonds:100,oldPrice:100,price:69.99,type:"dollarDiamonds",productId:"diamonds_100"},
 {name:"250 Diamonds",icon:"💎",diamonds:250,oldPrice:250,price:149.99,type:"dollarDiamonds",productId:"diamonds_250"},
 {name:"500 Diamonds",icon:"💎",diamonds:500,oldPrice:500,price:249.99,type:"dollarDiamonds",productId:"diamonds_500"},
 {name:"1000 Diamonds",icon:"💎",diamonds:1000,oldPrice:1000,price:399.99,type:"dollarDiamonds",productId:"diamonds_1000"}
];

let bomberBombs=3,bomberBoard=[],bomberGameActive=false,bomberMultiplier=1,bomberSafeCount=0,bomberBet=1;
let crashGameActive=false,crashBet=5,crashMultiplier=1,crashStep=0,crashMaxSteps=10,crashHistory=[];
let crashWins=Number(localStorage.getItem("crashWins"))||0,crashLosses=Number(localStorage.getItem("crashLosses"))||0,crashTotalGames=Number(localStorage.getItem("crashTotalGames"))||0,crashBestMultiplier=Number(localStorage.getItem("crashBestMultiplier"))||0,crashTotalWon=Number(localStorage.getItem("crashTotalWon"))||0;

document.addEventListener("DOMContentLoaded",()=>{updateAllUI();initShop();renderInventory();initBomber();initCrashGame();checkAuth();startRewardTimer();checkStripePayment();renderCrashHistory();setInterval(saveGame,3000);});
function saveGame(){localStorage.setItem("coins",coins);localStorage.setItem("diamonds",diamonds);localStorage.setItem("points",points);localStorage.setItem("totalRolls",totalRolls);localStorage.setItem("streak",streak);localStorage.setItem("bestStreak",bestStreak);localStorage.setItem("rareItems",rareItems);localStorage.setItem("inventory",JSON.stringify(inventory));localStorage.setItem("playerName",playerName);localStorage.setItem("playerAvatar",playerAvatar);localStorage.setItem("currentSkin",currentSkin);localStorage.setItem("crashWins",crashWins);localStorage.setItem("crashLosses",crashLosses);localStorage.setItem("crashTotalGames",crashTotalGames);localStorage.setItem("crashBestMultiplier",crashBestMultiplier);localStorage.setItem("crashTotalWon",crashTotalWon);}
function updateAllUI(){updateCurrency();updateStats();updateProfile();updateSkin();updateWallet();updateBomberUI();updateCrashUI();}
function updateCurrency(){const c=document.getElementById("coins"),d=document.getElementById("diamonds"),p=document.getElementById("points");if(c)c.textContent=Math.floor(coins);if(d)d.textContent=Math.floor(diamonds);if(p)p.textContent=Math.floor(points);}
function updateStats(){const r=document.getElementById("rolls"),s=document.getElementById("streak"),x=document.getElementById("rareItems");if(r)r.textContent=totalRolls;if(s)s.textContent=bestStreak;if(x)x.textContent=rareItems;}
function updateProfile(){const n=document.getElementById("playerNameTop"),a=document.getElementById("playerAvatar");if(n)n.textContent=playerName;if(a)a.src=playerAvatar;}
function updateSkin(){document.body.classList.remove("skin-shadow","skin-fire","skin-ice");if(currentSkin&&currentSkin!=="Default")document.body.classList.add("skin-"+currentSkin.toLowerCase());}
function showPage(pageId){document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));const page=document.getElementById(pageId);if(!page)return;page.classList.remove("hidden");if(pageId==="inventory")renderInventory();if(pageId==="wallet")updateWallet();if(pageId==="bomber")initBomber();if(pageId==="crash")initCrashGame();}
let messageTimer;function showMessage(text){const m=document.getElementById("message");if(!m){console.log(text);return;}m.textContent=text;m.classList.add("show");clearTimeout(messageTimer);messageTimer=setTimeout(()=>m.classList.remove("show"),2500);}
function getRandomLoot(){const random=Math.random()*100;let current=0;for(const item of loot){current+=item.chance;if(random<=current)return item;}return loot[0];}
function rollLoot(){const cost=100;if(coins<cost){showMessage("❌ Not enough coins!");return;}coins-=cost;totalRolls++;const item=getRandomLoot();if(["RARE","EPIC","LEGENDARY","MYTHIC"].includes(item.rarity)){rareItems++;streak++;if(streak>bestStreak)bestStreak=streak;}else streak=0;if(item.type==="coins")coins+=item.reward;if(item.type==="diamonds")diamonds+=item.reward;addInventoryItem(item);const r=document.getElementById("rarity"),i=document.getElementById("lootIcon"),n=document.getElementById("lootName"),d=document.getElementById("lootDescription"),w=document.getElementById("reward");if(r)r.textContent=item.rarity;if(i)i.textContent=item.icon;if(n)n.textContent=item.name;if(d)d.textContent=item.description;if(w)w.textContent=item.type==="coins"?`+${item.reward} 💵`:`+${item.reward} 💎`;updateAllUI();renderInventory();saveGame();showMessage(`🎉 You won ${item.name}!`);}
function addInventoryItem(item){const existing=inventory.find(x=>x.name===item.name);if(existing)existing.amount=Number(existing.amount||0)+1;else inventory.push({name:item.name,icon:item.icon,rarity:item.rarity,amount:1});}
function renderInventory(){const c=document.getElementById("inventoryItems");if(!c)return;c.innerHTML="";if(!inventory.length){c.innerHTML=`<div class="empty-item"><div class="empty-icon">🎒</div><h2>Inventory is empty</h2><p>Play the game and collect rewards!</p></div>`;return;}inventory.forEach(item=>{const card=document.createElement("div");card.className="item inventory-card";card.innerHTML=`<div class="item-icon">${item.icon}</div><h2>${item.name}</h2><p>${item.rarity}</p><strong>×${item.amount}</strong>`;c.appendChild(card);});}
function initShop(){renderShop("coinShopItems",coinShop);renderShop("diamondShopItems",diamondShop);}
function renderShop(containerId,items){const c=document.getElementById(containerId);if(!c)return;c.innerHTML="";items.forEach(item=>{const card=document.createElement("div");card.className="item";let priceHTML="";if(item.type==="coins")priceHTML=`<strong>${item.price} 💵</strong>`;if(item.type==="dollarDiamonds"){const perDiamond=item.price/item.diamonds;const discount=item.oldPrice>item.price?Math.round((1-item.price/item.oldPrice)*100):0;priceHTML=`<div class="diamond-price"><span class="old-price">$${item.oldPrice.toFixed(2)}</span><span class="new-price">$${item.price.toFixed(2)}</span></div><p>Get ${item.diamonds} 💎</p><div class="diamond-unit-price">1 💎 = $${perDiamond.toFixed(2)}</div>${discount?`<div class="diamond-discount">-${discount}% OFF</div>`:""}`;}card.innerHTML=`<div class="item-icon">${item.icon}</div><h2>${item.name}</h2>${priceHTML}<button class="buy-button">Buy</button>`;card.querySelector(".buy-button").addEventListener("click",()=>buySkin(item));c.appendChild(card);});}
async function buySkin(item){if(item.type==="coins"){if(coins<item.price){showMessage("❌ Not enough coins!");return;}coins-=item.price;addInventoryItem({name:item.name,icon:item.icon,rarity:"SHOP"});if(item.skin)currentSkin=item.skin;updateAllUI();renderInventory();saveGame();showMessage(`✅ ${item.name} purchased!`);return;}if(item.type==="dollarDiamonds"){await buyWithStripe(item);return;}showMessage("❌ Unknown product.");}
async function buyWithStripe(item){try{showMessage("⏳ Opening Stripe Checkout...");if(!item.productId){showMessage("❌ Product ID is missing.");return;}const response=await fetch(`${STRIPE_SERVER_URL}/create-checkout-session`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:item.productId})});const data=await response.json();if(data.url)window.location.href=data.url;else showMessage("❌ Payment session could not be created.");}catch(error){console.error(error);showMessage("❌ Payment server is unavailable.");}}
