



var arDrone = function(ip, baseextraPort, navdataProxyPort, cmdVelProxyPort, pose3DProxyPort){
        
        // Variables generales
        var ARDRONE1 = 0;
        var ARDRONE2 = 1;
        var ARDRONE_SIMULATED = 10;
        var virtualDrone = true;
        
        var isArDroneConnected = false; // public variable to control the conection
        this.isArDroneConnected = function () {
            return isArDroneConnected;
        }; 

        // Variable ICE para la conexion
        var id = new Ice.InitializationData();
        id.properties = Ice.createProperties();
        //id.properties.setProperty("Ice.Trace.Network", "3"); // Propiedad para tracear la conexion
        //sid.properties.setProperty("Ice.Trace.Protocol", "1"); // Propiedad para tracear la conexion
        var communicator = Ice.initialize(id);
        
        // Variables de control del Drone
        var navdataProxy;
        var extraProxy;
        var cmdVelProxy;
        var pose3DProxy;

        //********************************************************************************************
        //********************************************************************************************
        // Variable datos del drone
        var navdata = new jderobot.NavdataData; //nvdata
        var cmd = new jderobot.CMDVelData; //cmdVelData
        cmd.linearX=0.0;
        cmd.linearY=0.0;
        cmd.linearZ=0.0;
        cmd.angularZ=0.0;
        cmd.angularX=0.0;
        cmd.angularY=0.0;
        window.cmd = cmd;
        
        var pose = new jderobot.Pose3DData; //pose3DData
        
        // Varibale del panel de control de los intrumentos
        var PanelControl;
        var intervalo = null;


        
        // ICE Connect
        function startConnection(){
                return new Promise(function(resolve, reject) {
                        // base extra connection
                        var baseextra = communicator.stringToProxy("Extra:ws -h " + ip + " -p " + baseextraPort);
                        jderobot.ArDroneExtraPrx.checkedCast(baseextra).then(
                            function(ar){
                                extraProxy = ar;
                                console.log("extraProxy connected: " + ar);
                            },
                            function(ex, ar){
                                console.log("extraProxy NOT connected: " + ex);
                            }
                        );               
                        
                        // NavData
                        var basenavdata = communicator.stringToProxy("Navdata:ws -h " + ip + " -p " + navdataProxyPort);
                        jderobot.NavdataPrx.checkedCast(basenavdata).then(
                            function(ar){
                                console.log("navdataProxy connected: " + ar);
                                navdataProxy = ar;
                                navdataProxy.getNavdata().then(
                                function(navdata){
                                    if (navdata.vehicle == ARDRONE_SIMULATED) {
                                        virtualDrone = true;
                                        console.log("virtualDrone = true");
                                    } else {
                                        virtualDrone = false;
                                        console.log("virtualDrone = false");
                                    }
                                },
                                function (ex, ar){
                                    console.log("Fail getNavdata() function: " + ex);
                                }
                                );
                            },
                            function (ex, ar){
                                console.log("navdataProxy NOT connected: " + ex);
                            }        
                        );        
                      
                        // CMDVelPrx
                        var basecmdVel = communicator.stringToProxy("CMDVel:ws -h " + ip + " -p " + cmdVelProxyPort);
                        jderobot.CMDVelPrx.checkedCast(basecmdVel).then(
                            function(ar){
                                console.log("cmdVelProxy connected: " + ar);
                                cmdVelProxy = ar;
                            },
                            function(ex, ar){
                                console.log("cmdVelProxy NOT connected: " + ex);
                            }
                        );             
                      
                        // Pose3D
                       var basepose3D = communicator.stringToProxy("ImuPlugin:ws -h " + ip + " -p " + pose3DProxyPort);
                       jderobot.Pose3DPrx.checkedCast(basepose3D).then(
                           function(ar){
                               console.log("pose3DProxy connected: " + ar);
                               pose3DProxy = ar;
                                window.po = pose3DProxy;
                                resolve("Stuff worked!");
                               pose3DProxy.getPose3DData().then(
                                   function (ar){
                                       console.log("getPoseDData().");
                                       pose = ar;
                                   },
                                   function(ex, ar){
                                       console.log("Fail call getPoseDData().");
                                   });
                           },
                           function(ex, ar){
                               console.log("pose3DProxy NOT connected: " + ex)
                           }
                       );
                    });
                }
        
        // Functions return the value of fliying parameters
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
        //*********************************************************************************************
        //*********************************************************************************************
              
        
        // extraProxy functions  
        this.takeoff = function () {
            extraProxy.takeoff().then(
                function(ar){
                    console.log("Take Off.");
                },
                function(ex, ar){
                    console.log("Take Off failed.")
                }
                );
        }
            
        this.land = function() {
                extraProxy.land().then(
                function(ar){
                    console.log("Landing.");
                },
                function(ex, ar){
                    console.log("Landing failed: " + ex)
                }
                );
        }
        
        this.toogleCam = function(){
                extraProxy.toggleCam().then(
                function(ar){
                    console.log("toggleCam.");
                },
                function(ex, ar){
                    console.log("toggleCam failed: " + ex)
                }
            );
        }
        
        
        function updateNavData() {
            navdataProxy.getNavdata().then(
                function(ar){
                    navdata = ar;
                    //console.log("updateNavData()");
                },
                function (ex, ar){
                    console.log("Fail getNavdata() function." + ex)
                }        
            );    
        }
        
        
        function sendVelocities () {
            cmdVelProxy.setCMDVelData(cmd).then(
                function(ar){
                  //console.log("sendVelocities.");
                },
                function(ex, ar){
                  console.log("sendVelocities failed.")
                }
            );
        }
        
        this.sendCMDVel = function(vx,vy,vz,yaw,roll,pitch){
            cmd.linearX=vy
            cmd.linearY=vx
            cmd.linearZ=vz
            cmd.angularZ=yaw
            cmd.angularX=cmd.angularY=1.0
            sendVelocities();
        }
        
        

        
            
        function updatePose(){
            pose3DProxy.getPose3DData().then(
                    function (ar){
                        pose=ar;
                        //console.log("getPose3DData. ")
                    },
                    function(ex, ar){
                        console.log("Fail call getPoseDData(): " + ar2);
                    });   
        }
        
        function setPose3D (){    
            pose3DProxy.setPose3DData(pose).then(
                    function (ar){
                        console.log("setPose3DData.");
                    },
                    function(ex, ar){
                        console.log("Fail setPose3DData function: " + ar);
                    });   
        }

        function setXYValues(newX,newY){
                setVY(newY);
                setVX(newX);
                sendVelocities();
        }

        function rotationChange (newYaw){
                setYaw(newYaw);
                sendVelocities();
        }
        

        function setVX(vx){
                cmd.linearX=vx;
        } 
        function setVY(vy){
                cmd.linearY=vy;
        }  
        function setVZ(vz){
                cmd.linearZ=vz;
        }
        function setYaw(yaw){
                cmd.angularZ=yaw;
        }
        function setRoll(roll){
                cmd.angularX=roll; 
        }
        function setPitch(pitch){
                cmd.angularY=pitch;
        }
        
        
        
        //****************************************************************************************************************
        //****************************************************************************************************************

        
        function altitude(val) {
            setVZ(val);
            sendVelocities();
         }
         
        this.start = function(){
                startConnection().then(
                        function(ar){
                                isArDroneConnected = true;
                                console.log("Conexión establecida con el Drone: " + ar);
                        },
                        function(ex, ar){
                                isArDroneConnected = false;
                                console.log("Conexión con el Drone fallida: " + ex+ar);
                        }
                );      
        }
        
        
        function updateAndSend(){
                if (isChannelRunning) {                    
                        updatePose();
                        updateNavData();
                        sendNavigationData(pose, navdata);
                }
        }
        this.updateAndSend = function(){updateAndSend()}
        this.setXYValues = function(VX,VY){setXYValues(VX, VY)}
        this.setAltYaw = function (alt, yaw){
                rotationChange(yaw); //Giro del drone
                altitude(alt); //Altitud del drone
        }
}    