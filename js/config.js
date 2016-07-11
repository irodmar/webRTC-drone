/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/


// Archivo que guarda las variables de configiracion y que podemos modificar desde la aplicacion

var Server_IP = "192.168.1.135"; //IP del servidor de señalizacion

var Drone_IP = "192.168.1.138"; // IP del drone -- ardroneserver

var BaseExtra_Port = 17000; // Puertos de conexion con el Drone
var CMDVel_Port = 11000;
var Pose3D_Port = 19000;
var Navdata_Port = 15000;

var velocidad = 0.3; // Variable con la que multiplico en el joystick y en el gamepad para modificar la velocidad del drone


// based on Todd Motto functions
// http://toddmotto.com/labs/reusable-js/

// hasClass
function hasClass(elem, className) {
	return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}
// addClass
function addClass(elem, className) {
    if (!hasClass(elem, className)) {
    	elem.className += ' ' + className;
    }
}
// removeClass
function removeClass(elem, className) {
	var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
	if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}
// toggleClass
function toggleClass(elem, className) {
	var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, " " ) + ' ';
    if (hasClass(elem, className)) {
        while (newClass.indexOf(" " + className + " ") >= 0 ) {
            newClass = newClass.replace( " " + className + " " , " " );
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
        elem.className += ' ' + className;
    }
}


// Actualiza la velocidad en la barra lateral con la que tenemos configurada
function loadVelMenu() {
    var theToggle = document.getElementById('toggle');
    
    theToggle.onclick = function() {
        toggleClass(this, 'on');
        return false;
    }
    
    // Update con velocidad predefinida en la variable
    document.getElementById("velocidad").value = velocidad;
    document.querySelector('#velocidad_out').value = velocidad;
}

// Funcion que modifica el valor numerico al lado del fader
function outputUpdate(vel) {
    velocidad = vel; // Actualizo la variable que cambiara la velocidad del drone
    document.querySelector('#velocidad_out').value = vel; // Actualizo el output del html
}

