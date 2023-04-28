let money=0;
let money_per_click=0.01;
let money_per_second=0;
let elements, pos;

class shop_item {
  constructor(name,description, price,on_buy) {
    this.name=name;
    this.desc=description
    this.price=price;
    this.on_buy=on_buy
    this.bought=0;
    this.id=0
  }
}
function onBuy() {
  if (money>=shop_items[this.style.getPropertyValue("--button-id")].price) {
    shop_items[this.style.getPropertyValue("--button-id")].on_buy();
    money-=shop_items[this.style.getPropertyValue("--button-id")].price;
    updateWallet();
    shop_items[this.style.getPropertyValue("--button-id")].bought++;
    updateShopItems();
  }
}
let shop_items=[
  new shop_item("Better clicks","Get $0.01 more per click!", 0.15,() => {money_per_click+=0.01}),
  new shop_item("Auto clicks","Get $0.01 per second!", 0.5,() => {money_per_second+=0.005}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")}),
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Starter")})
  
]
function updateWallet() {
  elements.wallet.innerHTML = money.toFixed(2);
}
let buttonPressed=false;
function buttonPress() {
  buttonPressed=true;
}
let cur;
function gameInit() {
  elements = {
    wallet: document.getElementById("wallet"),
    money_button: document.getElementById("money-button"),
    overlay: document.getElementById("overlay-div"),
    shop_wrapper: document.getElementById("shop-wrapper"),
    shop: document.getElementById("shop-list"),
    spinner: document.getElementById("lootbox-spinner"),
    spinner_wrapper: document.getElementById("lootbox-wrapper")
  }
  for(var i = 0; i < shop_items.length; i++) {
    cur=document.createElement("li")
    shop_items[i].id=i;
    cur.innerHTML=insertItemText(shop_items[i])
    cur.getElementsByTagName("button")[0].onclick=onBuy;
    cur.setAttribute("class","shop-item font-bold")
    elements.shop.append(cur)
  }

  initLootbox();
}
function updateShopItems() {
  for (const childEl of elements.shop.children) {
    childEl.innerHTML=insertItemText(shop_items[childEl.getElementsByTagName("button")[0].style.getPropertyValue("--button-id")])
    childEl.getElementsByTagName("button")[0].onclick=onBuy;
  }
}
function insertItemText(item) {
  return (`
    <span class="shop-item-title item-left">${item.bought} | ${item.name}</span>
    <span class="shop-item-price item-right">$${item.price.toFixed(2)}</span>
    <span class="shop-item-desc item-left">${item.desc}</span>
    <button class="shop-item-button item-right" style="--button-id:${item.id};">BUY</button>
    `)
}
function addMoney() {
  money+=money_per_click;
}
addEventListener("mouseup", (event) => {
  if (buttonPressed==true) {
    addMoney();
    updateWallet();
    buttonPressed=false;
  }
});
window.onload=gameInit;
setInterval(() => {
  money+=money_per_second;
  updateWallet();
},1000)

let rarity={
  common: {id: 1, chance: 1.00},
  uncommon: {id: 2, chance: 0.33},
  rare: {id: 3, chance: 0.1},
  unique: {id: 4, chance: 0.05},
  extraordinary: {id: 5, chance: 0.01},
  rngesus: {id: 6, chance:0.005}
}
class lootbox_class {
  constructor(name,loot_array) {
    this.name=name;
    this.loot_array=loot_array;
  }
}
class loot_class {
  constructor(rarity,name, desc, func) {
    this.name=name;
    this.desc=desc;
    this.rarity=rarity;
    this.func=func;
    loot_info.items.set(name,0)
  }
  add_item() {
    loot_info.items.set(this.name,loot_info.items.get(this.name)+1)
  }
}
let loot_info={
  items: new Map(),
  loot: [],
  boxes: []
};

function initLootbox() {
  loot_info.loot = [
    new loot_class(rarity.common,       "Clicky",       "Clicks for you every second!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mason",       "Mason make your click strong.",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Pup figure",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    
  ],
  loot_info.boxes [
    new lootbox_class("Starter",[rarity.common  ,rarity.uncommon]),
    new lootbox_class("Stash",[rarity.common,  rarity.uncommon,  rarity.rare]),
    new lootbox_class("Bag",[rarity.uncommon]),
    new lootbox_class("Trash Bag",[rarity.common]),
    new lootbox_class("Mailbox",[rarity.rare])
  ]
}

let lootbox_item;
function openLootbox(lootbox_name) {
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");
  for(var i = 0; i < 8; i++) {
    lootbox_item = document.createElement("div");
    lootbox_item.className="lootbox-item"
    elements.spinner.append(lootbox_item)
  }
}