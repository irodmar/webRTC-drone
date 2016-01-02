

var haveEvents = 'ongamepadconnected' in window;
var chromeInterval = null;
var updateGPInterval = null;
var navegador = navigator.userAgent;



// Set a threshold 
var applyDeadzone = function(number, threshold){
   percentage = (Math.abs(number) - threshold) / (1 - threshold);

   if(percentage < 0)
      percentage = 0;

   return percentage * (number > 0 ? 1 : -1);
}


function updateGamePad() {
    var gp = navigator.getGamepads()[0];
    if (!gp && !haveEvents) {
        disconnecthandler();
        chromeInterval = setInterval(scangamepad, 1000);        
    } else {
        if (gp.buttons[0].pressed) {
            enviarOrden("takeoff");
            //console.log("Take Off");
        } else if (gp.buttons[1].pressed) {
            enviarOrden("land");
            //console.log("Landing");
        }
        
        // en Mozilla            En Chrome
        // axes[0] = Y           axes[0] = Y
        // axes[1] = X           axes[1] = X
        // axes[3] = Yaw         axes[3] = Yaw
        // axes[4] = Alt         axes[4] = Alt
        
        //if (haveEvents) {
            var Y = applyDeadzone(gp.axes[0], 0.12);
            var X = applyDeadzone(gp.axes[1], 0.12);
            var Yaw = applyDeadzone(gp.axes[3], 0.12);
            var Alt = applyDeadzone(gp.axes[4], 0.12);
        //} else{
            //console.log("axe 1 :" + gp.axes[1]*(-1));
            //var Y = applyDeadzone(gp.axes[0], 0.12);
            //var X = applyDeadzone(gp.axes[1], 0.12);
            //var Yaw = applyDeadzone(gp.axes[2], 0.12);
            //var Alt = applyDeadzone(gp.axes[3], 0.12);
         //}
         sendCMDVel(-X,Y);// Change variables and send the command to the drone
         sendAltYaw(-Alt, Yaw);
    }
}

// Connected gamePad device
function connecthandler() {
    var gp = navigator.getGamepads()[0];
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", gp.index, gp.id, gp.buttons.length, gp.axes.length);
    updateGPInterval = setInterval(updateGamePad, 100);
    $(".joystick").fadeOut(4000);
}

// Disconnectec gamePad Device 
function disconnecthandler(){
    console.log("Gamepad disconnected.");
    clearInterval(updateGPInterval);
    $(".joystick").fadeIn(4000);
}


function scangamepad() {
    var gp = navigator.getGamepads()[0];
    console.log("Compruebo mando");
    if (gp){
        clearInterval(chromeInterval);
        connecthandler();
    }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
//if (!haveEvents) { // detect the gamepad in chrome
    //chromeInterval = setInterval(scangamepad, 1000);
//}