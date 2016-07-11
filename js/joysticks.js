/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/


function oMousePos(canvas, evt) {
        // Detecta la posición del raton en un canvas
        var ClientRect = canvas.getBoundingClientRect();
        return { //objeto
                x: Math.round(evt.clientX - ClientRect.left),
                y: Math.round(evt.clientY - ClientRect.top)
        }
}

// Posicion si tocamos la pantalla
function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
                x: touchEvent.targetTouches[0].clientX - rect.left,
                y: touchEvent.targetTouches[0].clientY - rect.top
        };
}       
        
function rightJoystick(){

        var canvas = document.getElementById("rightJoystick");
        var ctx = canvas.getContext("2d");
        // opacidad 
        ctx.globalAlpha = 0.85;
        var cw = canvas.width;
        var ch = canvas.height;
        var X = cw / 2;
        var Y = ch / 2;
        var lineWidth = 7;
        ctx.lineWidth = lineWidth;
        var RHoop = X * 0.7; //Diametro de aro
        var RCircle = RHoop * 0.4; // Diametro del circulo
        var maxR = RHoop; // Distancia maxima a la que puede moverse
        
        var arrastrar = false;
        
        var p = {
          'X': X,
          'Y': Y,
          'R': RCircle
        }; // Circle
        var delta = new Object();
        
        var normalizaX = (X + maxR) - (X - maxR); 
        var normalizaY = (Y + maxR) - (Y - maxR);
        var VX = 0;
        var VY = 0;

        function dibujarAro(x, y, r) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI, true);
                //ctx.lineWidth = 7;
                ctx.strokeStyle = "rgb(87,125,25)";
                ctx.stroke();
        }

        function dibujarCirculo(x, y, r) {
                ctx.beginPath();
                ctx.fillStyle = "rgb(75, 144, 176)";
                ctx.arc(x, y, r, 0, 2 * Math.PI, true);
                ctx.fill();
        }

        // dibujamos los dos compoentes del joystick
        dibujarAro(X, Y, RHoop);
        dibujarCirculo(p.X, p.Y, RCircle);
        
        // EVENTOS 
        canvas.addEventListener('mousedown', function(evt) {
                var mousePos = oMousePos(canvas, evt);

                if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
                        arrastrar = true;
               }
        }, false);

        // mousemove 
        canvas.addEventListener('mousemove', function(evt) {
                var m = oMousePos(canvas, evt);
                //ctx.beginPath();
                //ctx.arc(X, Y, maxR, 0, 2 * Math.PI);
                if (arrastrar) {
                        delta.x = m.x - p.X;
                        delta.y = m.y - p.Y;
                        var deltaR = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                        var elR = Math.min(deltaR, maxR);
                        //console.log("DeltaR: " + deltaR + " elR: " + elR);
                        var angulo = Math.atan2(delta.y, delta.x);
                        //console.log(angulo); //
                        
                        x = X + elR * Math.cos(angulo);
                        y = Y + elR * Math.sin(angulo);

                        sendAltYaw(((y - Y)/maxR)*(-1)*velocidad, ((x - X)/maxR)*velocidad);
                        
                        ctx.clearRect(0, 0, cw, ch); // Clear and redraw the joystick
                        dibujarAro(X, Y, RHoop);
                        dibujarCirculo(x, y, RCircle);
                }
        }, false);
        
        // mouseup 
        canvas.addEventListener('mouseup', function() {
                
                sendAltYaw(0, 0);
                
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);

        // mouseout 
        canvas.addEventListener('mouseout', function() {
                sendAltYaw(0, 0);
                
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);
        
        
        
        canvas.addEventListener('touchstart', function(evt) {
                var mousePos = getTouchPos(canvas, evt);

                if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
                        arrastrar = true;
               }
        }, false);
        
        // mousemove 
        canvas.addEventListener('touchmove', function(evt) {
        var m = getTouchPos(canvas, evt);
        //ctx.beginPath();
        //ctx.arc(X, Y, maxR, 0, 2 * Math.PI);
        if (arrastrar) {
                delta.x = m.x - p.X;
                delta.y = m.y - p.Y;
                var deltaR = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                var elR = Math.min(deltaR, maxR);
                //console.log("DeltaR: " + deltaR + " elR: " + elR);
                var angulo = Math.atan2(delta.y, delta.x);
                //console.log(angulo); //
                
                x = X + elR * Math.cos(angulo);
                y = Y + elR * Math.sin(angulo);
                
                sendAltYaw(((y - Y)/maxR)*(-1)*velocidad, ((x - X)/maxR)*velocidad);
                
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(x, y, RCircle);
        }

        }, false);
        
        // mouseup 
        canvas.addEventListener('touchend', function() {
                sendAltYaw(0, 0);
                  
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);
        
        // mouseout 
        canvas.addEventListener('touchup', function() {
                sendAltYaw(0, 0);
                
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);

        
        // Prevent scrolling when touching the canvas
        document.body.addEventListener("touchstart", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
        
        document.body.addEventListener("touchend", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
        
        document.body.addEventListener("touchmove", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
}



function leftJoystick(){

        var canvas = document.getElementById("leftJoystick");
        var ctx = canvas.getContext("2d");
        // opacidad 
        ctx.globalAlpha = 0.85;
        var cw = canvas.width;
        var ch = canvas.height;
        var X = cw / 2;
        var Y = ch / 2;
        var lineWidth = 7;
        ctx.lineWidth = lineWidth;
        var RHoop = X * 0.7; //Diametro de aro
        var RCircle = RHoop * 0.4; // Diametro del circulo
        var maxR = RHoop; // Distancia maxima a la que puede moverse
        
        var arrastrar = false;
        
        var p = {
          'X': X,
          'Y': Y,
          'R': RCircle
        }; // Circle
        var delta = new Object();
        
        var normalizaX = (X + maxR) - (X - maxR); 
        var normalizaY = (Y + maxR) - (Y - maxR);
        var VX = 0;
        var VY = 0;

        function dibujarAro(x, y, r) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI, true);
                //ctx.lineWidth = 7;
                ctx.strokeStyle = "rgb(87,125,25)";
                ctx.stroke();
        }

        function dibujarCirculo(x, y, r) {
                ctx.beginPath();
                ctx.fillStyle = "rgb(255, 144, 76)";
                ctx.arc(x, y, r, 0, 2 * Math.PI, true);
                ctx.fill();
        }

        // dibujamos los dos compoentes del joystick
        dibujarAro(X, Y, RHoop);
        dibujarCirculo(p.X, p.Y, RCircle);
        
        // EVENTOS 
        canvas.addEventListener('mousedown', function(evt) {
                var mousePos = oMousePos(canvas, evt);

                if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
                        arrastrar = true;
               }
        }, false);

        // mousemove 
        canvas.addEventListener('mousemove', function(evt) {
                var m = oMousePos(canvas, evt);
                //ctx.beginPath();
                //ctx.arc(X, Y, maxR, 0, 2 * Math.PI);
                if (arrastrar) {
                        delta.x = m.x - p.X;
                        delta.y = m.y - p.Y;
                        var deltaR = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                        var elR = Math.min(deltaR, maxR);
                        //console.log("DeltaR: " + deltaR + " elR: " + elR);
                        var angulo = Math.atan2(delta.y, delta.x);
                        //console.log(angulo); //
                        
                        x = X + elR * Math.cos(angulo);
                        y = Y + elR * Math.sin(angulo);
                        
                        
                        VY = ((x - X)/maxR); // establecemos las velocidades (VY y VX van al reves ya que consuderamos x (avance) el joystick hacia adelante)
                        VX = ((y - Y)/maxR)*(-1);
                        
                        sendCMDVel(VX*velocidad,-VY*velocidad);// Change variables and send the command to the drone
                        //console.log("VX: " + VY);

                        
                        ctx.clearRect(0, 0, cw, ch); // Clear and redraw the joystick
                        dibujarAro(X, Y, RHoop);
                        dibujarCirculo(x, y, RCircle);
                }
        }, false);
        
        // mouseup 
        canvas.addEventListener('mouseup', function() {
                VX = 0.0;
                VY = 0.0;
                sendCMDVel(VX,VY);// Change variables and send the command to the drone

                  
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);

        // mouseout 
        canvas.addEventListener('mouseout', function() {
                VX = 0.0;
                VY = 0.0;
                sendCMDVel(VX,VY);// Change variables and send the command to the drone

                
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);
        
        
        
        canvas.addEventListener('touchstart', function(evt) {
                var mousePos = getTouchPos(canvas, evt);

                if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
                        arrastrar = true;
               }
        }, false);
        
        // mousemove 
        canvas.addEventListener('touchmove', function(evt) {
        var m = getTouchPos(canvas, evt);
        //ctx.beginPath();
        //ctx.arc(X, Y, maxR, 0, 2 * Math.PI);
        if (arrastrar) {
                delta.x = m.x - p.X;
                delta.y = m.y - p.Y;
                var deltaR = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                var elR = Math.min(deltaR, maxR);
                //console.log("DeltaR: " + deltaR + " elR: " + elR);
                var angulo = Math.atan2(delta.y, delta.x);
                //console.log(angulo); //
                
                x = X + elR * Math.cos(angulo);
                y = Y + elR * Math.sin(angulo);
                
                
                VY = ((x - X)/maxR); // establecemos las velocidades (VY y VX van al reves ya que consuderamos x (avance) el joystick hacia adelante)
                VX = ((y - Y)/maxR)*(-1);
                
                sendCMDVel(VX*velocidad,-VY*velocidad);// Change variables and send the command to the drone

                
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(x, y, RCircle);
        }

        }, false);
        
        // mouseup 
        canvas.addEventListener('touchend', function() {
                VX = 0;
                VY = 0;
                sendCMDVel(VX,-VY);// Change variables and send the command to the drone

                  
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);
        
        // mouseout 
        canvas.addEventListener('touchup', function() {
                VX = 0;
                VY = 0;
                sendCMDVel(VX,-VY);// Change variables and send the command to the drone

                
                arrastrar = false;
                ctx.clearRect(0, 0, cw, ch);
                dibujarAro(X, Y, RHoop);
                dibujarCirculo(X, Y, RCircle);
        }, false);

        
        // Prevent scrolling when touching the canvas
        document.body.addEventListener("touchstart", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
        
        document.body.addEventListener("touchend", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
        
        document.body.addEventListener("touchmove", function (e) {
                if (e.target == canvas) {
                        e.preventDefault();
                }
        }, false);
}
