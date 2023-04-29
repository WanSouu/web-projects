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
  new shop_item("Starter","Open Starter lootbox!", 0.01,() => {openLootbox("Loot bag")}),
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

  elements.spinner.addEventListener("animationiteration", updateSpinningItems);
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
  common: {id: 1, chance: 1.00, color: "#99ff91"},
  uncommon: {id: 2, chance: 0.5, color: "#91aeff"},
  rare: {id: 3, chance: 0.3, color: "#91ffe5"},
  unique: {id: 4, chance: 0.1, color: "#cd91ff"},
  extraordinary: {id: 5, chance: 0.05, color: "#e2ff70"},
  rngesus: {id: 6, chance:0.025, color: "#f728c3"}
}
class lootbox_class {
  constructor(name,loot_array) {
    this.name=name;
    this.loot_array=loot_array;
  }
  getLoot(seed=Math.random()) {
    console.log("lootara");
    for(var i = this.loot_array.length-1; i >= 0; i--) {
      
      
      if(this.loot_array[i].chance>=seed || i==0) {
        i=loot_info.items.get(this.loot_array[i].id)
        i=i[Math.floor(Math.random() * i.length)]
        console.log("seed: " + seed);
        return (i)
      }
    }
    return -1
  }
}
class loot_class {
  constructor(rarity,name, desc, func) {
    this.name=name;
    this.desc=desc;
    this.rarity=rarity;
    this.func=func;
    loot_info.items.get(rarity.id).push(this)
    loot_info.inventory.set(name,0)
  }
  add_item() {
    loot_info.inventory.set(this.name,loot_info.inventory.get(this.name)+1)
  }
}
let loot_info={
  items: new Map(),
  inventory: new Map(),
  loot: [],
  boxes: []
};

function initLootbox() {
  for(var i = 0; i < 10; i++) {
    loot_info.items.set(i,[]);
  }

  
  loot_info.loot = [
    new loot_class(rarity.common,       "Clicky",       "Clicks for you every second!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mason",       "Mason make your click strong.",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Pup figure",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    new loot_class(rarity.rare,       "Potion",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    new loot_class(rarity.unique,       "Brew",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Karambit",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Vice gloves",       "It's kinda useless since you can't see it.",          () => {this.add_item()}),
    
    
  ],
  loot_info.boxes = [
    // remember to order rarities from lowest to highest
    new lootbox_class("Starter",[rarity.common  ,rarity.uncommon]),
    new lootbox_class("Stash",[rarity.common,  rarity.uncommon,  rarity.rare]),
    new lootbox_class("Bag",[rarity.uncommon]),
    new lootbox_class("Trash Bag",[rarity.common]),
    new lootbox_class("Mailbox",[rarity.rare]),
    new lootbox_class("Loot bag",[rarity.common, rarity.uncommon, rarity.rare, rarity.unique, rarity.extraordinary, rarity.rngesus]),
    
  ]
}
function updateSpinningItems() {
  lootbox_item=document.getElementsByClassName("lootbox-item")
  for(var i = 0; i < lootbox_items-1; i++) {
    lootbox_item[i].innerHTML=lootbox_item[i+1].innerHTML;
  }
  cur_item=cur_lootbox_opening.getLoot()
  console.log("cur",cur_item);
  lootbox_item[lootbox_items-1].innerHTML=
  `
  <div class="item-name" style="background-color: ${cur_item.rarity.color}"}>
  ${cur_item.name}
  </div>
  `
}
let animation_duration=2;
let p_left=36.5
var cur_p=36.5;
function animateLootbox() {
  //elements.spinner.style.transition="padding-left "+animation_duration+"s linear";
  setTimeout(() => {
    updateSpinningItems();
    animateLootbox();
  },animation_duration*1000)
}
let lootbox_item, cur_item, seed;
let lootbox_items=8
let cur_lootbox_opening=-1;
function openLootbox(lootbox_name) {
  lootbox=getLootbox(lootbox_name)
  console.log("lootbox", lootbox)
  if (cur_item==-1) { return -1 }
  cur_lootbox_opening=lootbox;
  animateLootbox();
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");
  while (elements.spinner.firstChild) {
    elements.spinner.removeChild(elements.spinner.lastChild);
  }
  for(var i = 0; i < lootbox_items; i++) {
    lootbox_item = document.createElement("div");
    lootbox_item.className="lootbox-item"
    cur_item=lootbox.getLoot()
    console.log("GOT: ", cur_item);
    lootbox_item.innerHTML=
    `
    <div class="item-name" style="background-color: ${cur_item.rarity.color}"}>
    ${cur_item.name}
    </div>
    `
    elements.spinner.append(lootbox_item)
  }
  
}
function getLootbox(lootbox_name) {
  for(var i = 0; i < loot_info.boxes.length; i++) {
    if(loot_info.boxes[i].name==lootbox_name) {
      return (loot_info.boxes[i])
    }
  }
  return -1;
}
function getLoot(loot_array) {
  seed=Math.random()
}