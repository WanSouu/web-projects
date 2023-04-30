//#region[1] All event listeners are here.

addEventListener("mouseup", (event) => {
  // Check if we have pressed the button down.
  if (buttonPressed==true) {
    // Add money to the wallet.
    money+=money_per_click;
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
  constructor(name,description, price,on_buy) {
    this.name=name;
    this.desc=description
    this.price=price;
    this.on_buy=on_buy
    this.bought=0;
    this.id=0
  }
}

// Class for a box.
class lootbox_class {
  constructor(name,loot_array) {
    this.name=name;
    this.loot_array=loot_array;
  }
  getLoot(seed=Math.random()) {
    for(var i = this.loot_array.length-1; i >= 0; i--) {
      if(this.loot_array[i].chance>=seed || i==0) {
        i=loot_info.item_rarities.get(this.loot_array[i].id)
        i=i[Math.floor(Math.random() * i.length)]
        return (i)
      }
    }
    return -1
  }
}

// Class for loot
class loot_class {
  constructor(rarity,name, desc, func) {
    this.name=name;
    this.desc=desc;
    this.rarity=rarity;
    this.func=func;
    
    loot_info.item_rarities.get(rarity.id).push(this)
    loot_info.item_names.set(name,this)
    loot_info.inventory.set(name,0)
    
  }
  add_item() {
    // Adding 1 to the item in the inventory map.
    var amount=loot_info.inventory.get(this.name)
    alert(amount);
    loot_info.inventory.set(this.name,amount+1)
  }
}

//#endregion

//#region[3] All variables are declared here

let animation_timeout, cur, elements, pos, stop_at, lootbox_item_got, inventory_item, seed, cur_item, lootbox_item;
let money=0; // Starting money
let money_per_click=0.01; // Money gained per click
let money_per_second=0; // Money gained per second
let buttonPressed=false; // Variable to keep track button being pressed down.

let rarity={ // All rarities in the game
  common: {id: 0, chance: 1.00, color: "#FFFFFF"},
  uncommon: {id: 1, chance: 0.4, color: "#B9F18C"},
  rare: {id: 2, chance: 0.125, color: "#9EBDE6"},
  unique: {id: 3, chance: 0.033, color: "#ED6A5A"},
  extraordinary: {id: 4, chance: 0.01, color: "#9B7EDE"},
  rngesus: {id: 5, chance:0.005, color: "#FF2ECC"}
}
let rarity_names=["common","uncommon","rare","unique","extraordinary","rngesus"] // All rarity names 

// Variables that aren't supposed to be changed
let animation_state=-1;
let maximum_duration, cur_padding, animation_duration, animation_dur_increase;
let lootbox_items=8 // How many items are in the spinner at all times (MAKE SURE THIS IS AN EVEN NUMBER)
let cur_lootbox_opening=-1;
let lootbox_opening=false;
let lootbox_direction=-1 // The direction of the spinner (-1 = left, 1 = right)
let last_item = lootbox_direction==1 ? 0 : lootbox_items-1;
let middle_item= lootbox_items/2 - (lootbox_direction==1 ? 0 : 1)
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

let shop_items=[
  new shop_item("Better clicks","Get $0.01 more per click!", 0.1,() => {money_per_click+=0.01}),
  new shop_item("Auto clicks","Get $0.1 per second!", 0.49,() => {money_per_second+=0.1}),
  new shop_item("Trashbag","Open a Trashbag!", 0,() => {openLootbox("Trashbag")}),
  new shop_item("Starter box","Open a Starter box!", 0,() => {openLootbox("Starter box")}),
  new shop_item("Lootbag","Open a Lootbag!", 0,() => {openLootbox("Lootbag")}),
  new shop_item("Snackbox","Open a Snackbox!", 0,() => {openLootbox("Snackbox")}),
  new shop_item("Gamma 2 Case","Open a Gamma 2 Case!", 0,() => {openLootbox("Gamma 2 Case")}),
]

//#endregion

/*
= TO DO =
1. ADD FUNCTIONALITY FOR LOOT ITEMS
2. ADD CUSTOMIZABLE ODDS FOR EVERY LOOT BOX
*/

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
    inventory: document.getElementById("inventory-wrapper"),
    popup_card: document.getElementById("loot-card")
  }

  // Adding all the shop buttons
  for(var i = 0; i < shop_items.length; i++) {
    cur=document.createElement("div")
    shop_items[i].id=i;
    cur.innerHTML=getShopHTML(shop_items[i])
    cur.getElementsByTagName("button")[0].onclick=onBuy;
    cur.setAttribute("class","shop-item font-bold")
    elements.shop.append(cur)
  }

  initLootbox();
}

// Lootbox initilization
function initLootbox() {

  // Here is all the loot in the game
  // The format for adding new loot:
  // "new loot_class(rarity,      name,     description,     function that's run when the item is bought)"
  loot_info.loot = [
    new loot_class(rarity.common,       "Sock",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mug",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Leaf",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Pipe",       "This is a description for a common item!",          () => {this.add_item()}),
    new loot_class(rarity.common,       "Mud",       "This is a description for a common item!",          () => {this.add_item()}),
    
    new loot_class(rarity.uncommon,       "MP3 Player",       "This is a description for an uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Coffee",       "This is a description for an uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Pug",       "This is a description for an uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Prawn",       "This is a description for an uncommon item!",          () => {this.add_item()}),
    new loot_class(rarity.uncommon,       "Cocktail",       "This is a description for an uncommon item!",          () => {this.add_item()}),
    
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
    
    new loot_class(rarity.extraordinary,       "Cure for cancer",       "This is a description for an extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Karambit",       "This is a description for an extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Tucan",       "This is a description for an extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Gum",       "This is a description for an extraordinary item!",          () => {this.add_item()}),
    new loot_class(rarity.extraordinary,       "Dev tools",       "This is a description for an extraordinary item!",          () => {this.add_item()}),
    
    new loot_class(rarity.rngesus,       "Holy sock",       "This is a description for an rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy mug",       "This is a description for an rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy leaf",       "This is a description for an rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy pipe",       "This is a description for an rngesus item!",          () => {this.add_item()}),
    new loot_class(rarity.rngesus,       "Holy mud",       "This is a description for an rngesus item!",          () => {this.add_item()})
  ],
  // Here are all the boxes in the game
  // The format for adding a new box:
  // new lootbox_class(name,      [rarities sorted from lowest to highest])
  loot_info.boxes = [
    new lootbox_class("Trashbag", [rarity.common  ,rarity.uncommon]),
    new lootbox_class("Starter box",[rarity.common,  rarity.uncommon,  rarity.rare]),
    new lootbox_class("Lootbag",[rarity.common, rarity.uncommon, rarity.rare, rarity.unique, rarity.extraordinary, rarity.rngesus]),
    new lootbox_class("Snackbox",[rarity.rare, rarity.unique, rarity.extraordinary, rarity.rngesus]),
    new lootbox_class("Gamma 2 Case",[rarity.unique, rarity.extraordinary, rarity.rngesus])
    
  ]
}

// Adding money per second
setInterval(() => {
  money+=money_per_second;
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

  lootbox_item[middle_item].classList.add("middle-item")
}

function updateWallet() {
  // This function updates the wallet DOM element with the current money which is fixed to the 2nd decimal point
  elements.wallet.innerHTML = money.toFixed(2);
}

function updateShopItems() {
  // Loop through all the children of the shop wrapper
  for (const childEl of elements.shop.children) {
    // Set the inner HTML of that child element to the values specificed in the shop_items array
    childEl.innerHTML=getShopHTML(shop_items[childEl.getElementsByTagName("button")[0].style.getPropertyValue("--button-id")])

    // Set the button to have a click event
    childEl.getElementsByTagName("button")[0].onclick=onBuy;
  }
}

//#endregion

// #region[6] Get HTML functions

function getItemHTML(item) {
  // This function returns the innerHTML of a spinning item
  return (`<div class="item-name" style="background-color: ${item.rarity.color}"}>${item.name}</div>`)
}

function getShopHTML(item) {
  // This function returns the innerHTML for the specificed shop item
  return (`
    <span class="shop-item-title item-left">${item.bought} | ${item.name}</span>
    <span class="shop-item-price item-right">$${item.price.toFixed(2)}</span>
    <span class="shop-item-desc item-left">${item.desc}</span>
    <button class="shop-item-button item-right" style="--button-id:${item.id};">BUY</button>
  `)
}

function getPopupHTML(item) {
  // This function returns the innerHTML for the specificed shop item
  return(`
  <div class="loot-card-top">
      <div class="loot-card-title">${item.name}!</div>
      <div class="loot-card-rarity" style="color: ${item.rarity.color}">${rarity_names[item.rarity.id]}</div>
  </div>
  <div class="loot-card-description">
    ${item.desc}  
  </div>
  <button class="loot-card-button font-bold" style="border-color: ${item.rarity.color}; color: ${item.rarity.color};" onclick="lootcardClose()">OKAY.</button>
  `)
}

//#endregion

//#region[7] Button functions

function onBuy() {
  // This function runs whenever a shop button is clicked
  // It checks if the money is enough to buy the item, and if we aren't currently opening a box
  if (money>=shop_items[this.style.getPropertyValue("--button-id")].price && lootbox_opening==false) {
    // We then run the item's on_buy function
    shop_items[this.style.getPropertyValue("--button-id")].on_buy();
    // Remove the price from the money
    money-=shop_items[this.style.getPropertyValue("--button-id")].price;
    // Update the wallet element
    updateWallet();
    // Add 1 to the bought amount of the item
    shop_items[this.style.getPropertyValue("--button-id")].bought++;
    // And lastly update the shop items to show up the new bought amount
    updateShopItems();
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
  // Getting the lootbox data
  lootbox=getLootbox(lootbox_name)

  // Exit the function if either of those are true: 
  // > A box is currently being open
  // > The lootbox with the specified name doesnt exist
  if (lootbox_opening==true || lootbox==-1) { return -1 } 
  lootbox_opening=true

  // Storing which lootbox we are currently opening
  cur_lootbox_opening=lootbox;

  // Toggle the spinner and shop, closing the shop and opening the spinner
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");

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
  maximum_duration=2+(Math.random()-0.275)*3
  cur_padding={ left: 0, right: 0 }
  animation_state=1 // This state determines whether the left or right padding is transitioning
  animation_duration=0.2 // The duration of the spinner moving 1 cell forwards in seconds
  animation_dur_increase=0.0005 // The amount that the animation duration increases every cell (1 being a 100% increase)
  elements.spinner.style.transition="padding-left 0s linear, padding-right 0s linear";
  elements.spinner.style.paddingLeft="0%";
  elements.spinner.style.paddingRight="36.5%";
}

function addItemToInventory(item) {
  // Get all the information about the item
  lootbox_item_got= loot_info.item_names.get(item)

  // Create a new div element
  inventory_item=document.createElement("div")
  // Set the coresponding class
  inventory_item.classList.add("inventory-item")
  // Set the innerHTML to the item's name
  inventory_item.innerHTML=lootbox_item_got.name
  // Set the background color to the item's rarity color
  inventory_item.style.backgroundColor=lootbox_item_got.rarity.color
  // Add the item to the inventory
  elements.inventory.appendChild(inventory_item)
  
  // Set the border color of the popup card to the item's rarity color
  elements.popup_card.style.border="10px solid " + lootbox_item_got.rarity.color
  // Set the innerHTML of the popup card
  elements.popup_card.innerHTML=getPopupHTML(lootbox_item_got);
}

// Function to get all the lootbox data by its name
function getLootbox(lootbox_name) {
  // Loop through all the boxes available
  for(var i = 0; i < loot_info.boxes.length; i++) {
    // if it matches the name, return it
    if(loot_info.boxes[i].name==lootbox_name) {
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

  // We toggle this class to make the pop up loot card show up
  elements.popup_card.classList.toggle("show-loot");
  
  // We clear any timeouts remaining from the animateLootbox() function
  clearTimeout(animation_timeout)

  // And lastly we add the item that we have stopped at to the players inventory
  addItemToInventory(lootboxGetItem())
}

function lootboxGetItem() {
  // This function goes in the spinner element and returns the innerHTML of the item thats the in the middle of the spinner
  return (elements.spinner.children[middle_item].children[0].innerHTML)
}

function lootcardClose() {
  // We toggle these classes making the spinner close and shop open again
  elements.spinner_wrapper.classList.toggle("spinner-open");
  elements.shop_wrapper.classList.toggle("shop-open");
  
  // Close the popup loot card
  elements.popup_card.classList.toggle("show-loot");
  // Set the lootbox_opening variable to false so that another lootbox can be opened
  lootbox_opening=false;
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
  maximum_duration=2+(Math.random()-0.275)*3

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