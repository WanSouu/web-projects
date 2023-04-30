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
  if (money>=shop_items[this.style.getPropertyValue("--button-id")].price && stopLootbox==true) {
    shop_items[this.style.getPropertyValue("--button-id")].on_buy();
    money-=shop_items[this.style.getPropertyValue("--button-id")].price;
    updateWallet();
    shop_items[this.style.getPropertyValue("--button-id")].bought++;
    updateShopItems();
  }
}
let shop_items=[
  new shop_item("Better clicks","Get $0.01 more per click!", 0.1,() => {money_per_click+=0.01}),
  new shop_item("Auto clicks","Get $0.1 per second!", 0.49,() => {money_per_second+=0.1}),
  new shop_item("Trashbag","Open a Trashbag!", 0.25,() => {openLootbox("Trashbag")}),
  new shop_item("Starter box","Open a Starter box!", 0.99,() => {openLootbox("Starter box")}),
  new shop_item("Lootbag","Open a Lootbag!", 3.99,() => {openLootbox("Lootbag")}),
  new shop_item("Snackbox","Open a Snackbox!", 9.99,() => {openLootbox("Snackbox")}),
  new shop_item("Gamma 2 Case","Open a Gamma 2 Case!", 49.99,() => {openLootbox("Gamma 2 Case")}),
  
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
    spinner_wrapper: document.getElementById("lootbox-wrapper"),
    inventory: document.getElementById("inventory-wrapper"),
    loot_card: document.getElementById("loot-card")
  }
  for(var i = 0; i < shop_items.length; i++) {
    cur=document.createElement("div")
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
  common: {id: 0, chance: 1.00, color: "#FFFFFF"},
  uncommon: {id: 1, chance: 0.4, color: "#B9F18C"},
  rare: {id: 2, chance: 0.125, color: "#9EBDE6"},
  unique: {id: 3, chance: 0.033, color: "#ED6A5A"},
  extraordinary: {id: 4, chance: 0.01, color: "#9B7EDE"},
  rngesus: {id: 5, chance:0.005, color: "#FF2ECC"}
}
let rarity_names=["common","uncommon","rare","unique","extraordinary","rngesus"]
class lootbox_class {
  constructor(name,loot_array) {
    this.name=name;
    this.loot_array=loot_array;
  }
  getLoot(seed=Math.random()) {
    //console.log("lootara");
    for(var i = this.loot_array.length-1; i >= 0; i--) {
      if(this.loot_array[i].chance>=seed || i==0) {
        i=loot_info.items.get(this.loot_array[i].id)
        i=i[Math.floor(Math.random() * i.length)]
        //console.log("seed: " + seed);
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
    loot_info.item_names.set(name,this)
    loot_info.inventory.set(name,0)
    
  }
  add_item() {
    loot_info.inventory.set(this.name,loot_info.inventory.get(this.name)+1)
  }
}
let loot_info={
  items: new Map(),
  item_names: new Map(),
  inventory: new Map(),
  loot: [],
  boxes: []
};
function updateInventory() {

}
function initLootbox() {
  for(var i = 0; i < 10; i++) {
    loot_info.items.set(i,[]);
  }

  
  loot_info.loot = [
    new loot_class(rarity.common,       "Sock",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mug",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Leaf",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Pipe",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mud",       "This is a description for a common item!",          () => {this.add_item()}),
    
    new loot_class(rarity.uncommon,       "MP3 Player",       "This is a description for a uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Coffee",       "This is a description for a uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Pug",       "This is a description for a uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Prawn",       "This is a description for a uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Cocktail",       "This is a description for a uncommon item!",          () => {this.add_item()}),
    
    new loot_class(rarity.rare,       "Radio",       "This is a description for a rare item!",          () => {this.add_item()}),
    new loot_class(rarity.rare,       "Gun",       "This is a description for a rare item!",          () => {this.add_item()}),
    new loot_class(rarity.rare,       "Silver pipe",       "This is a description for a rare item!",          () => {this.add_item()}),
    new loot_class(rarity.rare,       "MP4 Player",       "This is a description for a rare item!",          () => {this.add_item()}),
    new loot_class(rarity.rare,       "Chicken Nugget",       "This is a description for a rare item!",          () => {this.add_item()}),


    new loot_class(rarity.unique,       "Golden pipe",       "This is a description for a unique item!",          () => {this.add_item()}),
    new loot_class(rarity.unique,       "MP5 Player",       "This is a description for a unique item!",          () => {this.add_item()}),
    new loot_class(rarity.unique,       "Caviar",       "This is a description for a unique item!",          () => {this.add_item()}),
    new loot_class(rarity.unique,       "All of Politics",       "This is a description for a unique item!",          () => {this.add_item()}),
    new loot_class(rarity.unique,       "Book of wisdom",       "This is a description for a unique item!",          () => {this.add_item()}),
    
    new loot_class(rarity.extraordinary,       "Cure for cancer",       "This is a description for a extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Karambit",       "This is a description for a extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Tucan",       "This is a description for a extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Gum",       "This is a description for a extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Dev tools",       "This is a description for a extraordinary item!",          () => {this.add_item()}),
    
    new loot_class(rarity.rngesus,       "Holy sock",       "This is a description for a rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy mug",       "This is a description for a rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy leaf",       "This is a description for a rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy pipe",       "This is a description for a rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy mud",       "This is a description for a rngesus item!",          () => {this.add_item()})
    
    
    
  ],
  loot_info.boxes = [
    // remember to order rarities from lowest to highest
    new lootbox_class("Trashbag",[rarity.common  ,rarity.uncommon]),
    new lootbox_class("Starter box",[rarity.common,  rarity.uncommon,  rarity.rare]),
    new lootbox_class("Lootbag",[rarity.common, rarity.uncommon, rarity.rare, rarity.unique, rarity.extraordinary, rarity.rngesus]),
    new lootbox_class("Snackbox",[rarity.rare, rarity.unique, rarity.extraordinary, rarity.rngesus]),
    new lootbox_class("Gamma 2 Case",[rarity.unique, rarity.extraordinary, rarity.rngesus])
    
  ]
}
function updateSpinningItems() {
  lootbox_item=document.getElementsByClassName("lootbox-item")
  for(var i = lootbox_items-1; i > 0; i--) {
    lootbox_item[i].innerHTML=lootbox_item[i-1].innerHTML;
  }
  cur_item=cur_lootbox_opening.getLoot()
  //console.log("cur",cur_item);
  lootbox_item[0].innerHTML=
  `
  <div class="item-name" style="background-color: ${cur_item.rarity.color}"}>${cur_item.name}</div>
  `
}
let animation_duration=0.2;
let animation_dur_increase=0.0005
var cur_p=0;
let animation_state=-1
let animation_timeout;
function animateLootbox() {
  if (stopLootbox==true) { return; }
  animation_duration*=1+animation_dur_increase
  lootboxAnimationToggle()
  updateSpinningItems();
  animation_timeout=setTimeout(() => {
    if (stopLootbox==true) { return; }
    animation_duration*=1+animation_dur_increase
    lootboxAnimationToggle()
    
    updateSpinningItems();
    animation_timeout=setTimeout(() => {
      animateLootbox();
      if (stopLootbox==true) { return; }
      
    }, animation_duration*1000)
  },animation_duration*1000)
}
let minimum_duration=1;
let stop_at;
let cur_padding={ left: 0, right: 0, changing: 0}
let middle_item=5;
function lootboxAnimationToggle() {
  minimum_duration=2+(Math.random()-0.275)*3
  animation_state*=-1
  animation_dur_increase*=1.4+((Math.random()-0.5)*0.25)
  if (animation_state==1) {
    elements.spinner.style.transition="padding-left 0s linear, padding-right "+animation_duration+"s linear";
    cur_padding.left=0;
    cur_padding.right=0;
    cur_padding.changing=1;
  }else {
    elements.spinner.style.transition="padding-left "+animation_duration+"s linear, padding-right 0s linear";
    cur_padding.left=36.5;
    cur_padding.right=36.5;
    cur_padding.changing=0;
  }
  elements.spinner.style.paddingLeft=cur_padding.left+"%";
  elements.spinner.style.paddingRight=cur_padding.right+"%";
  if (animation_duration>=minimum_duration && stop_at_time==-1) {
    stop_at_time=(0.2+Math.random()*0.6)*animation_duration
    if (stop_at_time>4) { stop_at_time=4 }
    //console.log("!!! --------- STOPPING IN "+ stop_at_time +"s ---------- !!!")
    setTimeout(() => {
      lootboxStop();
    },stop_at_time*1000)
  }
}
function lootboxStop() {
  //console.log("!!! --------- STOPPING NOW ---------- !!!")
  
  elements.spinner.style.transition="none";
  if (cur_padding.changing==1) {
    //console.log("NEW RIGHT = " + 36.5*((stop_at_time/animation_duration)))
    elements.spinner.style.paddingRight=36.5*(1-(stop_at_time/animation_duration)) + "%"
  }else {
    //console.log("NEW LEFT = " + 36.5*(stop_at_time/animation_duration))
    elements.spinner.style.paddingLeft=36.5*((stop_at_time/animation_duration)) + "%"
  }
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");
  elements.loot_card.classList.toggle("show-loot");
  
  clearTimeout(animation_timeout)
  lootbox_item_got= loot_info.item_names.get(lootboxGetItem().replace(/\n|\r/g, ""))
  inventory_item=document.createElement("div")
  inventory_item.classList.add("inventory-item")
  inventory_item.innerHTML=lootbox_item_got.name
  inventory_item.style.backgroundColor=lootbox_item_got.rarity.color

  elements.loot_card.style.border="10px solid " + lootbox_item_got.rarity.color
  
  lootboxCardSet(lootbox_item_got);
  
  elements.inventory.appendChild(inventory_item)
  setTimeout(() => {
    stopLootbox=true;
  },1000)
}
function lootboxCardSet(item) {
  elements.loot_card.innerHTML=
  `
  <div class="loot-card-top">
        <div class="loot-card-title">${item.name}!</div>
        <div class="loot-card-rarity" style="color: ${item.rarity.color}">${rarity_names[item.rarity.id]}</div>
  </div>
  <div class="loot-card-description">
    ${item.desc}  
  </div>
  <button class="loot-card-button font-bold" style="border-color: ${item.rarity.color}; color: ${item.rarity.color};" onclick="lootcardClose()">OKAY.</button>
  `
}
function lootcardClose() {
  elements.loot_card.classList.toggle("show-loot");
}
let lootbox_item_got, inventory_item;
function lootboxGetItem() {
  return (elements.spinner.children[middle_item].children[0].innerHTML)
}
let lootbox_item, cur_item, seed;
let stopLootbox=true;
let lootbox_items=10
let cur_lootbox_opening=-1;

function lootboxAnimation() {
  stop_at_time=-1;
  minimum_duration=2+(Math.random()-0.275)*3
  cur_padding={ left: 0, right: 0, changing: 0}
  animation_state=-1
  animation_duration=0.2
  animation_dur_increase=0.0005
  elements.spinner.style.transition="padding-left 0s linear, padding-right 0s linear";
  elements.spinner.style.paddingLeft="0%";
  elements.spinner.style.paddingRight="0%";
  animateLootbox();
}
function openLootbox(lootbox_name) {
  lootbox=getLootbox(lootbox_name)
  if (stopLootbox==false || lootbox==-1) { return -1 }
  // so you cant open a lootbox while one is opening currently and you cant open an undefined lootbox
  
  stopLootbox=false
  cur_lootbox_opening=lootbox;
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");
  while (elements.spinner.firstChild) {
    elements.spinner.removeChild(elements.spinner.lastChild);
  }
  for(var i = 0; i < lootbox_items; i++) {
    lootbox_item = document.createElement("div");
    lootbox_item.className="lootbox-item"
    cur_item=lootbox.getLoot()
    //console.log("GOT: ", cur_item);
    lootbox_item.innerHTML=
    `
    <div class="item-name" style="background-color: ${cur_item.rarity.color}"}>${cur_item.name}</div>
    `
    elements.spinner.append(lootbox_item)
  }
  lootboxAnimation()
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