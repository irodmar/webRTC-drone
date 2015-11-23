var panelControl = function (){
    
    // Control Watches 
    var attitude = $.flightIndicator('#attitude', 'attitude', {roll:50, pitch:-20, size:200, showBox : false}); // Horizon
    var heading = $.flightIndicator('#heading', 'heading', {heading:150, showBox:false}); // Compass
    //var variometer = $.flightIndicator('#variometer', 'variometer', {vario:-5, showBox:true}); // vertical speed
    //var airspeed = $.flightIndicator('#airspeed', 'airspeed', {showBox: false}); // air speed
    var altimeter = $.flightIndicator('#altimeter', 'altimeter', { showBox:false});
    var turn_coordinator = $.flightIndicator('#turn_coordinator', 'turn_coordinator', {turn:0,  showBox:false}); // alas avion
  


    this.updatePanelControl =  function(yaw, pitch, roll, pose){
    
        // Attitude update
        attitude.setRoll(roll);
        attitude.setPitch(-pitch);

        // Altimeter update
        altimeter.setAltitude(pose.z*100);
        //altimeter.setPressure(1000+3*Math.sin(increment/50));
    
        // TC update
        turn_coordinator.setTurn(roll);
    
        // Heading update
        heading.setHeading(yaw);
    
        // Vario update
        //variometer.setVario(2*Math.sin(increment/10));    
    }
}