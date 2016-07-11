/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/


var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

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
    if (!gp && isChrome) {
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
        
        if (!isChrome) {
            var Y = applyDeadzone(gp.axes[0], 0.12);
            var X = applyDeadzone(gp.axes[1], 0.12);
            var Yaw = applyDeadzone(gp.axes[3], 0.12);
            var Alt = applyDeadzone(gp.axes[4], 0.12);
        } else{
            var Y = applyDeadzone(gp.axes[0], 0.12);
            var X = applyDeadzone(gp.axes[1], 0.12);
            var Yaw = applyDeadzone(gp.axes[2], 0.12);
            var Alt = applyDeadzone(gp.axes[3], 0.12);
         }
         sendCMDVel(-X*velocidad,Y*velocidad);// Change variables and send the command to the drone
         sendAltYaw(-Alt*velocidad, Yaw*velocidad);
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
    //console.log("Compruebo mando");
    if (gp){
        clearInterval(chromeInterval);
        connecthandler();
    }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
if (isChrome) { // detect the gamepad in chrome
    chromeInterval = setInterval(scangamepad, 1000);
}
