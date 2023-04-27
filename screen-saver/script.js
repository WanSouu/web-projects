let screen_saver =
[
  "none",
  "dvd",
  "line",
  "gradient",
  "pixels"
]
let cur_screen=0;
let screen_saver_speed=500;
let screen_saver_type=0;
let screen_saver_types=0;
document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    cur_screen=cur_screen+1>screen_saver.length-1 ? 0 : cur_screen+1;
    document.getElementById("info-box").style.opacity="1";
    document.getElementById("info-box").style.transitionDuration="0ms";
    document.getElementById("cur-screensaver-text").innerHTML=screen_saver[cur_screen];
    switch(screen_saver[cur_screen]) {
      case "none":
        document.getElementById("screensaver-item").innerHTML="";
        screen_saver_types=0;
        break;
      case "dvd":
        document.getElementById("screensaver-item").innerHTML="<img id=dvd-id src=\'dvd.png\'>";
        
        screen_saver_types=0;
        size.w=document.getElementById("dvd-id").width;
        size.h=document.getElementById("dvd-id").height;
        pos.x=0.5;
        pos.y=0.5;
        speed.h=(Math.random()-0.5)*0.00075
        speed.v=(Math.random()-0.5)*0.00100
        speed.h+=0.00125*Math.sign(speed.h)
        speed.v+=0.0003*Math.sign(speed.v)

        
        // scrapped types due to rotatehue having really shitty results in colour
        // type 0 = "white dvd"
        // type 1 = "rgb changing dvd"
        // type 2 = "rgb gradient fading dvd"
        break;
      case "line":
        document.getElementById("screensaver-item").innerHTML="";
        screen_saver_types=0;
        break;
      case "gradient":
        document.getElementById("screensaver-item").innerHTML="";
        screen_saver_types=0;
        break;
      case "pixels":
        document.getElementById("screensaver-item").innerHTML="";
        screen_saver_types=0;
        break;
    }
    setTimeout(() => {
      document.getElementById("info-box").style.opacity="0";
      document.getElementById("info-box").style.transitionDuration="1000ms";
    }, "250");
  }
  if (event.code==='ArrowUp') { // up arrow
    screen_saver_type=screen_saver_type+1>screen_saver_types ? 0 : screen_saver_type+1;
    screen_saver_type_change=true;
  }
  if (event.code==='ArrowDown') { // down arrow
    screen_saver_type=screen_saver_type-1<0 ? screen_saver_types : screen_saver_type-1;
    screen_saver_type_change=true;
  }
  
})
let screen_saver_type_change=false;
let pos = { x : 0, y : 0 } // x, y
let screen_size = { w : 0, h : 0 } // width, height
let screen_size_change = { w : 0, h : 0 }
let speed = { h : 0.002, v : 0.001 } // horizontal, vertical
let size = { w : 0, h : 0 } // width, height
let center = { x : 0, y : 0 }
let cur_deg = 0;
function animate() {
  
  switch(screen_saver[cur_screen]) {
    case "none":
      break;
    case "dvd":
      if (screen_saver_type_change==true) {
        screen_saver_type_change=false;
        switch(screen_saver_type) {
          case 0:
            document.getElementById("screensaver-item").innerHTML="<img id=dvd-id src=\'dvd.png\'>";
            break
          case 1:
            document.getElementById("screensaver-item").innerHTML="<img id=dvd-id src=\'dvd-color.png\'>";
            break;
          case 2:
            document.getElementById("screensaver-item").innerHTML="<img id=dvd-id src=\'dvd-color.png\'>";
            break;
        }
        
      }
      center = {x : document.getElementById("screensaver-item").offsetWidth/2, y : document.getElementById("screensaver-item").offsetHeight/2}
      screen_size.w=document.getElementById("screensaver-item").offsetWidth;
      screen_size.h=document.getElementById("screensaver-item").offsetHeight;
      size.w=document.getElementById("dvd-id").width;
      size.h=document.getElementById("dvd-id").height;
      pos.x=pos.x+speed.h;
      pos.y=pos.y+speed.v;
      var change=false
      if (pos.x>=1 || pos.x<=0) {
        speed.h*=-1;
        change=true
      }
      if (pos.y>=1 || pos.y<=0) {
        speed.v*=-1;
        change=true
        
      }
      document.getElementById("dvd-id").style.left=`${(screen_size.w-size.w)*pos.x}px`;
      document.getElementById("dvd-id").style.top=`${(screen_size.h-size.h)*pos.y}px`;
      //document.getElementById("debug").innerHTML=`change: ${screen_size_change.w}, ${screen_size_change.h}<br>screen size: ${screen_size.w}, ${screen_size.h}<br>pos: ${pos.x}, ${pos.y}<br>speed: ${speed.h}, ${speed.v}<br>pos from center: ${pos.x-center.x}, ${pos.y-center.y}`;
      // type 0 = "white dvd"
      // type 1 = "rgb changing dvd"
      // type 2 = "rgb gradient fading dvd"
      break;
    case "line":
      break;
    case "gradient":
      break;
    case "pixels":
      break;
  }
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);