/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/

var panelControl = function (){
    
    var s = window.innerWidth*0.16;
    // Control Watches 
    var attitude = $.flightIndicator('#attitude', 'attitude', {roll:50, pitch:-20, size:s, showBox : false}); // Horizon
    var heading = $.flightIndicator('#heading', 'heading', {heading:150, showBox:false, size:s}); // Compass
    var altimeter = $.flightIndicator('#altimeter', 'altimeter', { showBox:false, size:s});
    var turn_coordinator = $.flightIndicator('#turn_coordinator', 'turn_coordinator', {turn:0,  showBox:false, size:s}); // alas avion
  
    var battery = document.getElementById("fill");
  
  
    function getYaw(qw,qx,qy,qz) {                     
            var rotateZa0=2.0*(qx*qy + qw*qz);
            var rotateZa1=qw*qw + qx*qx - qy*qy - qz*qz;
            var rotateZ=0.0;
            if(rotateZa0 != 0.0 && rotateZa1 != 0.0){
                rotateZ=Math.atan2(rotateZa0,rotateZa1);
            }
            return rotateZ*180/Math.PI ;
    }
    
    function getRoll(qw,qx,qy,qz){
            rotateXa0=2.0*(qy*qz + qw*qx);
            rotateXa1=qw*qw - qx*qx - qy*qy + qz*qz;
            rotateX=0.0;
            
            if(rotateXa0 != 0.0 && rotateXa1 !=0.0){
                rotateX=Math.atan2(rotateXa0, rotateXa1)
            }   
            return rotateX*180/Math.PI;
    }
    function getPitch(qw,qx,qy,qz){
            rotateYa0=-2.0*(qx*qz - qw*qy);
            rotateY=0.0;
            if(rotateYa0>=1.0){
                rotateY=math.PI/2.0;
            } else if(rotateYa0<=-1.0){
                rotateY=-Math.PI/2.0
            } else {
                rotateY=Math.asin(rotateYa0)
            }
            
            return rotateY*180/Math.PI;
    }


    this.updatePanelControl =  function(navdata, pose){
 
        // calculate yaw, pitch, and roll
        var yaw = getYaw(pose.q0, pose.q1, pose.q2, pose.q3);
        var pitch = getPitch(pose.q0, pose.q1, pose.q2, pose.q3);
        var roll = getRoll(pose.q0, pose.q1, pose.q2, pose.q3);
        
        attitude.setRoll(roll);
        attitude.setPitch(-pitch);

        // Altimeter update
        altimeter.setAltitude(pose.z*100);
        //altimeter.setPressure(1000+3*Math.sin(increment/50));
    
        // TC update
        turn_coordinator.setTurn(roll);
    
        // Heading update
        heading.setHeading(yaw);
        
        // Cambiamos el ancho en el estilo del relleno de la bateria según el nivel de bateria que nos manda el drone
        battery.style.width = String(navdata.batteryPercent) + "%";
        window.navdata = navdata;
        console.log(navdata.state);

    }
}