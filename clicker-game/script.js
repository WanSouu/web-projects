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
  new shop_item("Auto clicks","Get $0.01 per second!", 0.5,() => {money_per_second+=0.005})
  
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
    shop: document.getElementById("shop-list")
  }
  for(var i = 0; i < shop_items.length; i++) {
    cur=document.createElement("li")
    shop_items[i].id=i;
    cur.innerHTML=insertItemText(shop_items[i])
    cur.getElementsByTagName("button")[0].onclick=onBuy;
    cur.setAttribute("class","shop-item font-bold")
    elements.shop.append(cur)
  }
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