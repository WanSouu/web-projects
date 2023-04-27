let rolling=false
let dice_roll;
let animation_time=1000 // in ms
let  anim_dice_rolls=5 // how many times to change the dice icon
let dice_rolls=0;
function rollDice() {
  if (rolling) { return; }
  dice_rolls++;
  rolling=true;
  dice_roll=(Math.floor(Math.random() * 6) + 1);
  document.getElementById("dice-roll").classList.add("roll-animation");

  for(var i = 0; i < anim_dice_rolls; i++) {
    setTimeout(() => {
      document.getElementById("dice-roll").innerHTML=`&#98${55+(Math.floor(Math.random() * 6) + 1)}`
    }, animation_time/((anim_dice_rolls+1)-i));
  }
  setTimeout(() => {
    rolling=false
    document.getElementById("dice-roll").classList.remove("roll-animation");
    document.getElementById("dice-roll").innerHTML=`&#98${55+dice_roll}`
    addDiceRoll(dice_roll)
  }, animation_time);
}
function addDiceRoll() {
  var newRoll = document.createElement("li")
  newRoll.innerHTML=`&#98${55+dice_roll}`
  newRoll.setAttribute("class", "dice-roll-history")
  document.getElementById("history-area").prepend(newRoll)
}