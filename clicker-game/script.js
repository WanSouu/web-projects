//#region[1] All event listeners are here.

addEventListener("mouseup", () => {
  // Check if we have pressed the button down.
  if (buttonPressed==true) {
    // Add money to the wallet.
    money+=money_per_click + money_per_click * money_per_click_passive;
    // Update the wallet.
    updateWallet();
    // We arent pressing the button anymore so we set this variable to false.
    buttonPressed=false;
  }
});

//#endregion

//#region[2] All classes are declared here.

// Class for a shop item.
class shop_item {
  constructor(name,description, price, price_increase, on_buy, lootbox="") {
    this.name=name;
    this.desc=description
    this.price=price;
    this.price_increase=price_increase
    this.on_buy=on_buy
    this.bought=0;
    this.id=0
    if (lootbox!="") {
      this.lootbox=getLootbox(lootbox)
    }else {
      this.lootbox="";
    }  
  }
}

// Class for a box.
class lootbox_class {
  constructor(name,loot_array) {
    this.name=name;
    this.loot_array=loot_array;
  }
  getLoot(seed=Math.random()) {
    // we pick a seed between 0 and 1.
    // then we loop through our loot_array and pick a chance that falls in that seed range.
    // if we get a seed of 0.7 and a chance for the most rare item in that lootbox is 0.01, then we move onto the next rarity
    // we add the next rarities chance to the previous one, and we check if that's in the seed range
    // we repeat that until we get a value that's more than the seed.
    // then we return a random item for an array which has all the possible items sorted by rarities.

    var cur_seed_range=0;
    for(var i = this.loot_array.length-1; i >= 0; i--) {
      cur_seed_range+=this.loot_array[i][1]*luck // [i][1] is the item's chance, so we add it to the cur seed range.
      
      
      
      // "i==0" is the worst rarity in the array
      // the "|| i == 0" acts as a fallback if we already looped through the whole array of rarities and the seed is still out of range due to some mistake.
      if(cur_seed_range>=seed || i==0) { 
        i=loot_info.item_rarities.get(this.loot_array[i][0].id)
        i=i[Math.floor(Math.random() * i.length)]
        return (i)
      }
    }
    return -1
  }
}

// Class for loot
class loot_class {
  constructor(rarity,name, desc, type, func) {
    this.name=name;
    this.desc=desc.replace(/\[/g, `<span class="loot-card-stats" style="--clr: ${rarity.color}">[`).replace(/]/g, ']</span>');
    this.rarity=rarity;
    this.item_use=func;
    this.type=type
    
    loot_info.item_rarities.get(rarity.id).push(this)
    loot_info.item_names.set(name,this)
    loot_info.inventory.set(name,0)
    
  }
  add_item() {
    // Adding the item to the inventory HTML element.
    addItemToInventory(this)

    // Adding 1 to the item in the inventory map.
    var amount=loot_info.inventory.get(this.name)
    loot_info.inventory.set(this.name,amount+1)
  }
}

//#endregion

//#region[3] All variables are declared here

let animation_timeout, unboxed_item, cur, elements, pos, stop_at, inventory_item, seed, cur_item, lootbox_item, shop_items;

let money=22220; // Starting money
let money_per_click=0.01; // Money gained per click
let money_per_second=0; // Money gained per second
let money_per_click_passive=0; // Passive money per click 
let money_per_second_passive=0; // Passive money gained per second

let buttonPressed=false; // Variable to keep track button being pressed down.

let luck=1;

let rarity={ // All rarities in the game (Sorted from least rare to most rare)
  common: {id: 0, chance: 1.00, color: "#C0C0C0"},
  uncommon: {id: 1, chance: 0.4, color: "#B9F18C"},
  rare: {id: 2, chance: 0.125, color: "#9EBDE6"},
  unique: {id: 3, chance: 0.033, color: "#ED6A5A"},
  extraordinary: {id: 4, chance: 0.01, color: "#9B7EDE"},
  rngesus: {id: 5, chance:0.005, color: "#FF2ECC"}
}
let rarity_names=["common","uncommon","rare","unique","extraordinary","rngesus"] // All rarity names 

let type={ // All type of items in the game
  onetime: 0, // Item that has to be used when unboxed
  consumable: 1, // Item that can be used or added to the inventory and used whenever
  passive: 2 // Item that can only be added to inventory and they work passively
}
let type_names=["one-time","consumable","passive"] // All type names

// Variables that aren't supposed to be changed
let animation_state=-1;
let maximum_duration, cur_padding, animation_duration, animation_dur_increase;
let lootbox_items=8 // How many items are in the spinner at all times (MAKE SURE THIS IS AN EVEN NUMBER)
let cur_lootbox_opening=-1;
let lootbox_opening=false;
let lootbox_direction=1 // The direction of the spinner (-1 = left, 1 = right)
let last_item = lootbox_direction==1 ? 0 : lootbox_items-1;
let middle_item= lootbox_items/2 - (lootbox_direction==1 ? 0 : 1)
let opened_items=[];
let loot_info={
  // Items grouped by rarity
  item_rarities: new Map(),
  // Items grouped by name
  item_names: new Map(),
  // Inventory of player
  inventory: new Map(),
  // All loot that can be acquired from boxes
  loot: [],
  // All boxes that can be opened
  boxes: []
};

// Setting all the possible item rarities to an empty array to avoid errors
for(var i = 0; i < Object.keys(rarity).length; i++) {
  loot_info.item_rarities.set(i,[]);
}

//#endregion

/*
= TO DO =
1. IF (SHOP ITEM == LOOTBOX) { ON HOVER = SHOW ODDS OF LOOTBOX }

*/

function addLuck(luck_amt) {
  luck+=luck_amt;
  updateInfo();
  updateShopItems()
}

// #region[4] Game initialization

window.onload=gameInit;
function gameInit() {
  // Storing all the DOM elements in the elements object for easy access
  elements = {
    wallet: document.getElementById("wallet"),
    money_button: document.getElementById("money-button"),
    overlay: document.getElementById("overlay-div"),
    shop_wrapper: document.getElementById("shop-wrapper"),
    shop: document.getElementById("shop-list"),
    spinner: document.getElementById("lootbox-spinner"),
    spinner_wrapper: document.getElementById("lootbox-wrapper"),
    inventory: document.getElementById("inventory-item-wrapper"),
    inventory_wrapper: document.getElementById("inventory-wrapper"),
    popup_card: document.getElementById("loot-card"),
    info_div: document.getElementById("info-div")
  }

  initLootbox();

  shop_items=[
    new shop_item("Better clicks","Get $0.01 more per click!", 0.15,1.33,() => {money_per_click+=0.01}),
    new shop_item("Auto clicks","Get $0.05 per second!", 0.5,1.33,() => {money_per_second+=0.05}),
    new shop_item("Luck enchancment","Get +5% luck!", 0.99,1.4,() => {luck+=0.05}),
    new shop_item("Trash bag","Open a Trash bag!", 0.99,1.1,() => {openLootbox("Trash bag")}, "Trash bag"),
    new shop_item("Starter box","Open a Starter box!", 4.99,1.1,() => {openLootbox("Starter box")}, "Starter box"),
    new shop_item("Pronto box","Open the Pronto box!", 9.99,1.1,() => {openLootbox("Pronto box")}, "Pronto box"),
    new shop_item("Greedy box","Open a Greedy box!", 19.99,1.1,() => {openLootbox("Greedy box")}, "Greedy box"),
    new shop_item("Mystery box","Open a Mystery box!", 49.99,1.1,() => {openLootbox("Mystery box")}, "Mystery box"),
    new shop_item("Loot bag","Open a Loot bag!", 99.99,1.1,() => {openLootbox("Loot bag")}, "Loot bag"),
  ]

  // Adding all the shop buttons
  for(var i = 0; i < shop_items.length; i++) {
    cur=document.createElement("div")
    shop_items[i].id=i;
    cur.innerHTML=getShopHTML(shop_items[i])
    cur.getElementsByTagName("button")[0].onclick=onBuy;
    cur.setAttribute("class","shop-item font-bold")
    elements.shop.append(cur)
  }

  updateInfo();
}

// Lootbox initilization
function initLootbox() {

  // Here is all the loot in the game
  // The format for adding new loot:
  // "new loot_class(rarity,      name,     description,    item type,     function that's run when the item is bought)"
  loot_info.loot = [
    new loot_class(rarity.common,       "W shard",       "A mysterious shard, I wonder what does it spell out? [+5% $ per click] [+1% Luck]",type.onetime,          () => {money_per_click*=1.05; luck+=0.01}),
    new loot_class(rarity.common,       "A shard",       "A mysterious shard, I wonder what does it spell out? [+5% $ per second] [+1% Luck]",type.onetime,          () => {money_per_second*=1.05; luck+=0.01}),
    new loot_class(rarity.common,       "N shard",       "A mysterious shard, I wonder what does it spell out? [+2.5% $ per click] [+1% Luck]",type.onetime,          () => {money_per_click*=1.025; luck+=0.01}),
    new loot_class(rarity.common,       "S shard",       "A mysterious shard, I wonder what does it spell out? [+2.5% $ per second] [+1% Luck]",type.onetime,          () => {money_per_second*=1.025; luck+=0.01}),
    new loot_class(rarity.common,       "O shard",       "A mysterious shard, I wonder what does it spell out? [+1% $ per click] [+1% Luck]",type.onetime,          () => {money_per_click*=1.01; luck+=0.01}),
    new loot_class(rarity.common,       "U shard",       "A mysterious shard, I wonder what does it spell out? [+1% $ per second] [+1% Luck]",type.onetime,          () => {money_per_second*=1.01; luck+=0.01}),
    
    new loot_class(rarity.common,       "Kid`s hat",  "It's one of those tall top hats,  [+0.01$ per click]",type.onetime,          () => {money_per_click+=0.01}),
    new loot_class(rarity.common,       "Blank badge",  "People collect those things I guess [+0.01$ per second]",type.onetime,          () => {money_per_second+=0.01}),
    
    
    new loot_class(rarity.uncommon,       "Snackbar",       "You aren't yourself when you're hungry, have a Snackbar. [+0.05$ per click]",type.onetime ,          () => {money_per_click+=0.05}),
    new loot_class(rarity.uncommon,       "Coffee",       "Makes your money production caffeinated! [+10% $ per second]",type.consumable,          () => {money_per_second*=1.15}),
    new loot_class(rarity.uncommon,       "Souvenir",       "It's a souvenir from that one time, it gains value every second because of how old it is. [+0.1$ per second] [+2.5% Luck]",type.onetime,          () => {money_per_second+=0.1; luck+=0.025}),
    new loot_class(rarity.uncommon,       "Vape",       "It decreases your life span by 25% but increases something I think. [+2.5% passive $ per second] [+2.5% Luck]",type.passive,          () => {money_per_second_passive+=0.05; luck+=0.025; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.uncommon,       "Warm blanket",       "Makes you all cozy! [+2.5% passive $ per click] [+2.5% Luck]",type.passive,          () => {money_per_click_passive+=0.05; luck+=0.025; addItemToInventory(unboxed_item)}),
    
    new loot_class(rarity.uncommon,       "Sprint Hat",  "This hat looks ready to sprint! [+0.1$ per click]",type.onetime,          () => {money_per_click+=0.1}),
    new loot_class(rarity.uncommon,       "Money badge",  "Supposedly makes you rich [+0.15$ per second]",type.onetime,          () => {money_per_second+=0.1}),
    

    new loot_class(rarity.rare,       "Sock",       "You know what you have to do... [+10% $ per click] [+5% Luck]",type.onetime,          () => {money_per_click*=1.1; luck+=0.05}),
    new loot_class(rarity.rare,       "Gun",       "We recommend at least 6 guns for self protection. [+5% passive $ per click] [+5% passive $ per second]",type.passive,          () => {money_per_click_passive+=0.05; money_per_second_passive+=0.05; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.rare,       "Compliment",       "You got your yearly compliment! [+10% $ per second] [+2.5% passive $ per second] [+5% Luck]",type.passive,          () => {money_per_second*=1.1; money_per_second_passive+=0.025; luck+=0.05; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.rare,       "Pen",       "Sell this pen to the right person and you'll make millions! [+$0.2 per click] [+5% Luck]",type.onetime,          () => {money_per_click+=0.2; luck+=0.05}),
    new loot_class(rarity.rare,       "Chicken nugget",       "It makes you want to make money. [+$0.15 per second] [+10% $ per second]",type.consumable,          () => {money_per_second+=0.15; money_per_second*=1.1}),
    
    new loot_class(rarity.rare,       "Brewing Hat",  "Cook up mad concoctions!  [+0.2$ per click]",type.onetime,          () => {money_per_click+=0.2}),
    new loot_class(rarity.rare,       "Tranquillity badge",  "It is neither wealth nor splendor, but tranquility and occupation which give you happiness. [+20% Luck]",type.onetime,          () => {luck+=0.2}),
    

    new loot_class(rarity.unique,       "Golden frying pan",       "Imbued with an ancient power. [+33% $ per click] [+15% Luck]",type.consumable,          () => {money_per_click*=1.33; luck+=0.15}),
    new loot_class(rarity.unique,       "Karambit | Fade",       "This isn't just a weapon, it's a conversation piece. [+15% passive $ per second] [+15% Luck]",type.passive,          () => {money_per_second_passive+=0.15; luck+=0.15; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.unique,       "Ice cream",       "It's your favourite flavour! [+0.75$ per click]",type.onetime,          () => {money_per_click+=0.75}),
    new loot_class(rarity.unique,       "Dictionary 2",       "It's the sequel to the Dictionary! [5% passive $ per click] [+7.5% passive $ per second]",type.passive,          () => {money_per_click_passive+=0.05; money_per_second_passive+=0.075; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.unique,       "Fanart of you",       "Wow it looks great, wish you could see it! [+10% passive $ per click]",type.passive,          () => {money_per_click_passive+=0.1; addItemToInventory(unboxed_item)}),
    
    new loot_class(rarity.unique,       "Ice Hat",  "It's so cold! [+1$ per click]",type.onetime,          () => {money_per_click+=1}),
    new loot_class(rarity.unique,       "Misprinted badge",  "It gains value because the manufacturers fucked up [+1.25$ per second]",type.onetime,          () => {money_per_second+=1.25}),
    

    new loot_class(rarity.extraordinary,       "Existential crisis",       "Jeez. [+3.33$ per second]",type.onetime,          () => {money_per_second+=3.33}),
    new loot_class(rarity.extraordinary,       "Autism",       "Well I don't think that's perticularly bad. [+100% $ per click]",type.onetime,          () => {money_per_click*=2}),
    new loot_class(rarity.extraordinary,       "Puppy Frank",       "He's the cutest pup I've ever seen, attracts loads of girls. [+50% passive $ per second]",type.passive,         () => {money_per_second_passive+=0.5; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.extraordinary,       "The license to WinRar",       "I forgot that existed. [+20% passive $ per click] [+30% passive $ per second]",type.passive,          () => {money_per_click_passive+=0.2; money_per_second_passive+=0.3; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.extraordinary,       "Probably not flour",       "It's probably just flour. [2$ per click] [+50% $ per click]",type.consumable,          () => {money_per_click+=2; money_per_click*=1.5;}),
    
    new loot_class(rarity.extraordinary,       "Dweller`s mask",  "See the world through a Dweller's eyes! [+3.33$ per click]",type.onetime,          () => {money_per_click+=3.33}),
    new loot_class(rarity.extraordinary,       "Hourglass",  "Does weird things with time [+5$ per second]",type.onetime,          () => {money_per_second+=5}),
    
    new loot_class(rarity.rngesus,       "Wan",       "The ying of yang [+100$ per click] [+100% passive $ per click]",type.passive,          () => {money_per_click+=100; money_per_click_passive+=1; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.rngesus,       "Sou",       "The yang of ying [+100$ per second] [+100% passive $ per second]",type.passive,          () => {money_per_second+=100; money_per_second_passive+=1; addItemToInventory(unboxed_item)}),
    new loot_class(rarity.rngesus,       "Time stop hat",  "Death is inevitable. Your time is valuable. [+1000$ per click]",type.onetime,          () => {money_per_click+=1000})
    
  ],
  // Here are all the boxes in the game
  // The format for adding a new box:
  // new lootbox_class(name,      [rarities sorted from lowest to highest])
  loot_info.boxes = [
    new lootbox_class("Trash bag", [
      [rarity.common, 0.75],
      [rarity.uncommon, 0.25]
    ]),

    new lootbox_class("Starter box",[
      [rarity.common, 0.6],
      [rarity.uncommon,0.3],
      [rarity.rare,0.1]
    ]),

    new lootbox_class("Greedy box",[
      [rarity.common,0.7],
      [rarity.rare,0.25],
      [rarity.unique,0.05]
    ]),

    new lootbox_class("Pronto box",[
      [rarity.common,0.5],
      [rarity.uncommon,0.35],
      [rarity.rare,0.125],
      [rarity.unique,0.025],
      
      
    ]),

    new lootbox_class("Mystery box",[
      [rarity.common,0.6],
      [rarity.uncommon,0.125],
      [rarity.rare,0.15],
      [rarity.unique,0.085],
      [rarity.extraordinary,0.03],
      [rarity.rngesus,0.01]
    ]),
    
    new lootbox_class("Loot bag",[
      [rarity.uncommon,0.4],
      [rarity.rare,0.33],
      [rarity.unique,0.16], 
      [rarity.extraordinary,0.1], 
      [rarity.rngesus,0.01]
    ])
    
  ]
}

// Adding money per second
setInterval(() => {
  money+=money_per_second + money_per_second * money_per_second_passive;
  updateWallet();
},1000)

// #endregion

//#region[5] Update functions

function shiftItems() {
  if (lootbox_direction==1) {
    for(var i = lootbox_items-1; i > 0; i--) {
      // Set the spinning item to be the same as the one left to it
      lootbox_item[i].innerHTML=lootbox_item[i-1].innerHTML;
    }
  }else {
    for(var i = 0; i < lootbox_items-1; i++) {
      // Set the spinning item to be the same as the one right to it
      lootbox_item[i].innerHTML=lootbox_item[i+1].innerHTML;
    }
  }
}

function updateSpinningItems() {
  // This function moves all the spinning items to the right, and it is called every animation iteration

  // Get all the spinning items
  lootbox_item=document.getElementsByClassName("lootbox-item")

  // Shift all the items
  shiftItems();
  
  // Get a random item for the last spinning item (since it doesnt have any items next to it)
  cur_item=cur_lootbox_opening.getLoot()
  // Set the last spinning item to be the random item
  lootbox_item[last_item].innerHTML=getItemHTML(cur_item)
}

function updateWallet() {
  // This function updates the wallet DOM element with the current money which is fixed to the 2nd decimal point
  elements.wallet.innerHTML = money.toFixed(2);
}

function updateShopItems() {
  // Loop through all the children of the shop wrapper
  for (var childEl of elements.shop.children) {
    // Set the inner HTML of that child element to the values specificed in the shop_items array
    childEl.innerHTML=getShopHTML(shop_items[childEl.getElementsByTagName("button")[0].style.getPropertyValue("--button-id")])

    // Set the button to have a click event
    childEl.getElementsByTagName("button")[0].onclick=onBuy;
  }
}

function updateInfo() {
  // This function updates the info-div with the relevant information
  // (like: current money per second, money per click etc.)
  elements.info_div.innerHTML=getInfoHTML();
}

//#endregion

// #region[6] Get HTML functions

function getInfoHTML() {
  return(
  `
  <div class="info">
    Money per click: $${(money_per_click + money_per_click * money_per_click_passive).toFixed(2)}
    <span class="test-info">Raw money per click: $${money_per_click.toFixed(3)}</span>
    <span class="test-info">${(money_per_click_passive*100).toFixed(2)}% Passive money per click: $${(money_per_click_passive*money_per_click).toFixed(3)}</span>
  </div>
  <div class="info">
    Money per second: $${(money_per_second + money_per_second * money_per_second_passive).toFixed(2)}
    <span class="test-info">Raw money per second: $${money_per_second.toFixed(3)}</span> 
    <span class="test-info">${(money_per_second_passive*100).toFixed(2)}% Passive money per second: $${(money_per_second_passive*money_per_second).toFixed(3)}</span> 
  </div>
  <div class="info">
    Luck: +${((luck-1)*100).toFixed(2)}%
  </div>
  `
  )
}

function getItemHTML(item) {
  // This function returns the innerHTML of a spinning item
  return (`<div class="item-name" style="--very-well-hidden-item-name:${item.name}; background-color: ${item.rarity.color}"}>${(opened_items.includes(item.name)==true) ? item.name : item.name.replaceAll(/[^ ]/g, "?")}</div>`)
}

function getShopHTML(item) {
  // This function returns the innerHTML for the specificed shop item
  return (`
    <span class="shop-item-title item-left">${item.bought} | ${item.name}</span>
    <span class="shop-item-price item-right">$${item.price.toFixed(2)}</span>
    <span class="shop-item-desc item-left">${item.desc}</span>
    <button class="shop-item-button item-right" style="--button-id:${item.id};">BUY</button>
    <div class="shop-hover">${getShopHoverHTML(item)}<div> 
  `)  
}
function getPieChartHTML(loot_array) {
  var _c = 0
  var _html=""
  for(var i = loot_array.length-1; i >= 0; i--) {
    _c+=loot_array[i][1]*100
    _html+=`${loot_array[i][0].color} 0,`
    _html+=`${loot_array[i][0].color} ${_c*luck}%,`
    
  }
  return(_html.slice(0, -1) )
}
function getShopHoverHTML(item) {
  // If the current shop item is not a lootbox, return ""
  if (item.lootbox=="") { return ""; }
  var html=`<div class="shop-hover-inner" `;
  html+=`style="background:
    radial-gradient(
      circle closest-side,
      transparent 66%,
      white 0
    ),
    conic-gradient(${getPieChartHTML(item.lootbox.loot_array)});"`
  html+=`>loot chance</div>`
  return(html);
}

function getPopupHTML(item) {
  // This function returns the innerHTML for the specificed popup

  // Getting which buttons to put in the popup
  var buttonsHTML=`<button class="loot-card-button font-bold" style="border-color: ${item.rarity.color}; color: ${item.rarity.color};" onclick="lootcardClose(1)">USE.</button>`
  if (item.type==type.consumable) {
    buttonsHTML+=`<button class="loot-card-button font-bold" style="border-color: ${item.rarity.color}; color: ${item.rarity.color};" onclick="lootcardClose(-1)">SAVE FOR LATER.</button>  `
  }
  if (item.type==type.passive) {
    buttonsHTML=`<button class="loot-card-button font-bold" style="border-color: ${item.rarity.color}; color: ${item.rarity.color};" onclick="lootcardClose(0)">OKAY</button>`
  }

  // Return the HTML code
  return(`
  <div class="loot-card-top">
      <div class="loot-card-title"><span class="loot-card-name">${item.name}</span>!</div>
      <div class="loot-card-rarity" style="color: ${item.rarity.color}">${rarity_names[item.rarity.id]} ${type_names[item.type]} item</div>
  </div>
  <div class="loot-card-description">
    ${item.desc}  
  </div><div class="loot-card-buttons">` + buttonsHTML + `</div>`)
}

//#endregion

//#region[7] Button functions

function onBuy() {
  // This function runs whenever a shop button is clicked
  // It checks if the money is enough to buy the item, and if we aren't currently opening a box
  
  var button_id=this.style.getPropertyValue("--button-id")
  if (money>=shop_items[button_id].price && lootbox_opening==false) {
    // We then run the item's on_buy function
    shop_items[button_id].on_buy();
    // Remove the price from the money
    money-=shop_items[button_id].price;
    // Update the wallet element
    updateWallet();
    // Add 1 to the bought amount of the item
    shop_items[button_id].bought++;
    // Increase the item's price by the price increase amount
    shop_items[button_id].price*=shop_items[button_id].price_increase;
    // Update the shop items to show up the new bought amount
    updateShopItems();
    // And lastly update the info HTML elements
    updateInfo();
  }
}

function buttonPress() {
  // This function runs onmousedown inside the Clicker button,
  // all it does is set the buttonPressed variable to true,
  // when that variable is true and the event listener for onmouseup is activated
  // we add money to the wallet; that way if the user:
  // presses the button, moves the mouse outside the button & releases the mouse button,
  // we will still add the money to the wallet.
  buttonPressed=true;
}

//#endregion

//#region[8] Lootbox functions

function openLootbox(lootbox_name) {
  // Scroll the window to the top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })

  // Getting the lootbox data
  lootbox=getLootbox(lootbox_name)

  // Exit the function if either of those are true: 
  // > A box is currently being open
  // > The lootbox with the specified name doesnt exist
  if (lootbox_opening==true || lootbox==-1) { return -1 } 
  lootbox_opening=true

  // Storing which lootbox we are currently opening
  cur_lootbox_opening=lootbox;

  // We close the shop and open the spinner
  elements.spinner_wrapper.classList.add("spinner-open");
  elements.shop_wrapper.classList.remove("shop-open");

  // Removing all the items in the spinner in case of any left overs from last spins
  while (elements.spinner.firstChild) {
    elements.spinner.removeChild(elements.spinner.lastChild);
  }

  // Looping through all the items in the spinner
  for(var i = 0; i < lootbox_items; i++) {
    // Creating a new div element
    lootbox_item = document.createElement("div");
    // Setting the class
    lootbox_item.className="lootbox-item"
    // Get a random item from the current lootbox
    cur_item=lootbox.getLoot()
    // Set the lootbox item's innerHTML to the coresponding HTML values
    lootbox_item.innerHTML=getItemHTML(cur_item);
    // Lastly put the lootbox item in the spinner
    elements.spinner.append(lootbox_item)
  }

  // Start the lootbox animation
  lootboxAnimation()
}

function lootboxDefaultVariables() {
  // This function isn't pretty
  // but it sets all the variables to the default values
  stop_at_time=-1;
  maximum_duration=setMaximumDuration()
  cur_padding={ left: 0, right: 0 }
  animation_state=1 // This state determines whether the left or right padding is transitioning
  animation_duration=0.2 // The duration of the spinner moving 1 cell forwards in seconds
  animation_dur_increase=0.0005 // The amount that the animation duration increases every cell (1 being a 100% increase)
  elements.spinner.style.transition="padding-left 0s linear, padding-right 0s linear";
  elements.spinner.style.paddingLeft="0%";
  elements.spinner.style.paddingRight="36.5%";
}
function setMaximumDuration() {
  // This is just to randomize the maximum duration
  // and to keep this in one place
  return(2+(Math.random()-0.275)*3)
}
function addItemToInventory(item) {

  // Create a new div element
  inventory_item=document.createElement("div")
  // Set the coresponding classes
  inventory_item.setAttribute("class","inventory-item font-bold")
  // Set the innerHTML to the item's name
  inventory_item.innerHTML=item.name
  // Set the background color to the item's rarity color
  inventory_item.style.backgroundColor=item.rarity.color
  // Set the onclick function to show the items description and ability to use it if available
  inventory_item.onclick=showInventoryItem
  // Add the item to the inventory
  elements.inventory.appendChild(inventory_item)
}
function showInventoryItem() {
  // This function runs whenever an inventory item is clicked

  // We exit the function if we are currently opening a box
  if (lootbox_opening==true) { return -1 }

  // Get the items data
  var item = loot_info.item_names.get(this.innerHTML)
  // We open the popup card
  elements.popup_card.classList.add("open-card");
  // Set the border color of the popup card to the item's rarity color
  elements.popup_card.style.border="10px solid " + item.rarity.color
  // Set the innerHTML of the popup card
  elements.popup_card.innerHTML=getPopupHTML(item,true);
}

// Function to get all the lootbox data by its name
function getLootbox(get_lootbox_name) {
  // Loop through all the boxes available
  for(var i = 0; i < loot_info.boxes.length; i++) {
    // if it matches the name, return it
    
    if(loot_info.boxes[i].name==get_lootbox_name) {
      return (loot_info.boxes[i])
    }
  }
  return -1;
}

function lootboxStop() {
  // We set the spinners transition to none so all changes to the padding is instant
  elements.spinner.style.transition="none";

  // animation_state==1 means that we are currently transitioning the right padding
  // whereas animation_state==0 means that we are transitioning the left padding
  
  // In this "if else" we figure out what percentage of the animation duration the animation is currently at
  // And we set it to that value
  if ((animation_state*lootbox_direction)==1) {
    elements.spinner.style.paddingRight=36.5*(lootbox_direction==1 ? 1-(stop_at_time/animation_duration) : (stop_at_time/animation_duration)) + "%"
  }else {
    elements.spinner.style.paddingLeft=36.5*(lootbox_direction==-1 ? 1-(stop_at_time/animation_duration) : (stop_at_time/animation_duration)) + "%"
  }

  // We add this class to make the pop up loot card show up
  elements.popup_card.classList.add("open-card");
  
  // We clear any timeouts remaining from the animateLootbox() function
  clearTimeout(animation_timeout)

  // Store the unboxed item in a variable
  unboxed_item=loot_info.item_names.get(lootboxGetItem());
  // Set the border color of the popup card to the item's rarity color
  elements.popup_card.style.border="10px solid " + unboxed_item.rarity.color
  // Set the innerHTML of the popup card
  elements.popup_card.innerHTML=getPopupHTML(unboxed_item);
}

function lootboxGetItem() {
  // This function goes in the spinner element and returns the innerHTML of the item thats the in the middle of the spinner
  return (elements.spinner.children[middle_item].children[0].style.getPropertyValue("--very-well-hidden-item-name"))
}

function lootcardClose(type) {
  
  // We get the popups card item's name
  var item=loot_info.item_names.get(elements.popup_card.
    getElementsByClassName("loot-card-top")[0].
    getElementsByClassName("loot-card-title")[0].
    getElementsByClassName("loot-card-name")[0].
    innerHTML)


  // type indicates which button the player clicked
  // type = 0 "OKAY" - Run function
  // type = 1 "USE" - Run function
  // type = -1 "SAVE FOR LATER" - Store to inventory

  // if we just unboxed this item
  if (lootbox_opening==true) {
    // if we clicked "SAVE FOR LATER"
    if (type==-1) {
      // Save the item to inventory
      addItemToInventory(item)
    }else { // if we clicked "OKAY" or "USE"
      // Use the item, if it's a passive, it will add to the inventory since addItemToInventory function is in the item_use function of every passive item
      item.item_use();
      // Update the info HTML elements
      updateInfo();
    }
  }else {
    // If we clicked "USE"
    if (type==1) {
      // We use the item
      item.item_use();
      // We remove item from inventory
      removeItemFromInventory(item);
      // Update the info HTML elements
      updateInfo();
    }
  }
  
  // Close the popup loot card
  elements.popup_card.classList.remove("open-card");
  
  // If we just unboxed this item
  if (lootbox_opening==true) {
    // If we haven't opened this item before
    if (opened_items.includes(item.name)==false) {
      // We save this item name to opened_items, so we can now show the name in the spinner animation
      opened_items.push(item.name);
    }
    // We close the spinner and open the shop
    elements.spinner_wrapper.classList.remove("spinner-open");
    elements.shop_wrapper.classList.add("shop-open");
    // Set the lootbox_opening variable to false so that another lootbox can be opened
    lootbox_opening=false;
  }
}

function removeItemFromInventory(item) {
  // Get all inventory elements
  var inventory=elements.inventory.getElementsByClassName("inventory-item");

  // Loop through all the inventory elements
  for(var i = 0; i < inventory.length; i++) {
    // If the inventory items name matches the items name we want to remove
    if (inventory[i].innerHTML==item.name) {
      // Remove the that HTML element
      inventory[i].remove();
      break;
    }
  }
}

//#endregion

//#region[9] Animation functions

function animateLootbox() {
  // This function does all the animations using padding-left and padding-right
  
  // EXPLANATION:
  // 1. The spinner starts off with padding-left 0% & padding-right 36.5%

  // (36.5% is a magic number that I found using trial and error,
  // whenever padding-left/right is set to that number, it moves the spinner all items 1 cell to the right/left)
  
  // 2. The spinner linearly transitions padding-left to 36.5% (moving all items to the right)
  // and we also set a timeout for the animation duration.
  
  // 3. After the timeout, the spinner sets padding-left to 0% (with no transition time)
  // and we linearly transition padding-right to 0% (since it was 36.5% before, it moves all items to the right) 
  // we also move all the items innerHTML values to the right using the updateSpinningItems() function
  // so when padding-left is set to from 36.5% (1 cell offset) to 0% instantly, it looks like nothing has changed
  // since the position has been reset but all the innerHTML values have been shifted.
  // and lastly we set a timeout for the animation duration.

  // 4. After the timeout, the spinner sets padding-right to 36.5% (with no transition time)
  // we then move all the items innerHTML values to the right using the updateSpinningItems() function
  // and then we loop back to point number 2
  
  // 5. When the animation duration of the spinner is above "maximum_duration"
  // that's when the spinner is too slow and will stop the animation and land on the item.
  // (?) Animation duration is how long the spinner takes to move 1 cell forward 

  // There is a few tiny things I haven't explained but you can figure them out by following the functions below
  lootboxAnimationToggle()
  animation_timeout=setTimeout(() => {
    lootboxAnimationToggle()
    updateSpinningItems();
    animation_timeout=setTimeout(() => {
      animateLootbox();
      updateSpinningItems();
    }, animation_duration*1000)
  },animation_duration*1000)
}

function lootboxAnimationToggle() {
  // Increase the animation duration
  animation_duration*=1+animation_dur_increase
  // Multiply the animation_dur_increase by a value between 1.275 and 1.525
  animation_dur_increase*=1.4+((Math.random()-0.5)*0.25)

  // Randomize the maximum duration every time we move 1 cell forward for less predictability
  maximum_duration=setMaximumDuration();

  // Change the animation state
  animation_state*=-1

  if (animation_state==1) {
    // Make padding left transition instantly whereas padding right will transition linearly
    toggleSpinnerTransition();

    cur_padding.left=0; // Set the left padding to 0% (instantly transitioning)
    cur_padding.right=0; // Set the right padding to 0% (linearly transitioning)
  }else {
    // Make padding left transition linearly whereas padding right will transition instantly
    toggleSpinnerTransition();

    cur_padding.left=36.5; // Set the left padding to 36.5% (linearly transitioning)
    cur_padding.right=36.5; // Set the right padding to 36.5% (instantly transitioning)
  }
  // Set the padding to the spinner element
  elements.spinner.style.paddingLeft=cur_padding.left+"%";
  elements.spinner.style.paddingRight=cur_padding.right+"%";
  
  // If our animation duration is above the maximum duration && we haven't stopped yet
  if (animation_duration>=maximum_duration && stop_at_time==-1) {
    // Pick a random time to stop at somewhere between 10% and 90% of the animation duration
    stop_at_time=(0.1+Math.random()*0.8)*animation_duration

    // If the stop time is longer than 3 seconds, we set it to 3, since 3 seconds is already too long
    if (stop_at_time>3) { stop_at_time=3 }
    
    // We set the timeout to run when the animation is supposed to stop
    setTimeout(() => {
      lootboxStop();
    },stop_at_time*1000)
  }
}

function toggleSpinnerTransition() {
  // This function toggles the spinner transition between padding-left and padding-right
  return(
    (animation_state*lootbox_direction==true) ? 
    elements.spinner.style.transition="padding-right "+animation_duration+"s linear" :
    elements.spinner.style.transition="padding-left "+animation_duration+"s linear"
  )
}

function lootboxAnimation() { 
  // We change the lootbox spinning direction every time we open the lootbox so it isn't as repetitive as fast
  lootboxSetDirection(lootbox_direction*-1)

  // Set all variables to the neccessary values
  lootboxDefaultVariables();

  // Animate the spinner
  animateLootbox();
}

function lootboxSetDirection(dir) {
  // This function is for setting the lootbox direction
  // -1 = left, 1 = right
  lootbox_direction=dir
  last_item = lootbox_direction==1 ? 0 : lootbox_items-1;
  middle_item= lootbox_items/2 - (lootbox_direction==1 ? 0 : 1)
}
//#endregion