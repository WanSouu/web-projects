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
  }
}
function onBuy() {
  if (money>=shop_items[this.style.getPropertyValue("--button-id")].price) {
    shop_items[this.style.getPropertyValue("--button-id")].on_buy();
    money-=shop_items[this.style.getPropertyValue("--button-id")].price;
    updateWallet();
  }
}
let shop_items=[
  new shop_item("Better clicks","Get $0.01 more per click!", 0.02,() => {money_per_click+=0.01}),
  new shop_item("Auto clicks","Get $0.005 per second!", 0.05,() => {money_per_second+=0.005})
  
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
    cur.innerHTML=
    `
    <span class="shop-item-title item-left">${shop_items[i].name}</span>
    <span class="shop-item-price item-right">$${shop_items[i].price.toFixed(2)}</span>
    <span class="shop-item-desc item-left">${shop_items[i].desc}</span>
    <button class="shop-item-button item-right">BUY</button>
    `
    cur.getElementsByTagName("button")[0].style.setProperty("--button-id",i)
    cur.getElementsByTagName("button")[0].onclick=onBuy;
    cur.setAttribute("class","shop-item font-bold")
    elements.shop.append(cur)
  }
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