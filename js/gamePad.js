

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
        // axes[0] = Y
        // axes[1] = X
        // axes[3] = Yaw
        // axes[4] = Alt
        
        var Y = applyDeadzone(gp.axes[0], 0.12);
        var X = applyDeadzone(gp.axes[1], 0.12);
        var Yaw = applyDeadzone(gp.axes[3], 0.12);
        var Alt = applyDeadzone(gp.axes[4], 0.12);
    
        sendCMDVel(-X,-Y);// Change variables and send the command to the drone
        //console.log("SendCMDVel " + -X);
        sendAltYaw(-Alt, Yaw);
        console.log("sendAltYaw");
    } 
}

// Connected gamePad device
function connecthandler() {
    var gp = navigator.getGamepads()[0];
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", gp.index, gp.id, gp.buttons.length, gp.axes.length);
    updateGPInterval = setInterval(updateGamePad, 100);
    
    // ****** Borrar los joysicks
}

// Disconnectec gamePad Device 
function disconnecthandler(){
    console.log("Gamepad disconnected.");
    clearInterval(updateGPInterval);
    
    // Dibujar los joysticks
}


function scangamepad() {
    var gp = navigator.getGamepads()[0];
    if (gp){
        clearInterval(chromeInterval);
        connecthandler();
    }
}
// detect the gamepad in chrome
if (haveEvents) {
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
} else {
    chromeInterval = setInterval(scangamepad, 1000);
}