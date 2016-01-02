// Archivo que se encarga de la comunicacion con el servidor de señalozacion y llama a las funciones necesarias de webRTC
//del droenr
var arDrone;
var intervalo;
// Pedimos nombre de la sala
var room = prompt('Introduce el nombre de la nueva sala:');

// conexion de Socket.io al servidor de señalizacion
var socket = io.connect("192.168.1.107");

// Send 'Create or join' message to singnaling server
if (room !== '') {
	console.log('Create room', room);
	socket.emit('create', room);
}
 
// Recibimos respuesta del servidor de sala creada y llamamos a getUserMedia
socket.on('created', function (room){
	console.log('Created room ' + room);
	callGetUserMedia();
	startArDrone();
});

socket.on('join watcher', function (room){
	console.log('Un "watcher" se ha unido a la sala ' + room);
	if (arDrone.isArDroneConnected) {
		createPeerConnection(false);
		intervalo = setInterval(arDrone.updateAndSend, 100); // intervalo de envio de los valores
	} else {
		console.log("ArDrone is not connected, not creating RTCPeerConnection. Relaunch the app.");
	}
});

socket.on('join remote', function (room){
	console.log('Un "remote" se ha unido a la sala ' + room);
	if (arDrone.isArDroneConnected) {
		createPeerConnection(true);
		intervalo = setInterval(arDrone.updateAndSend, 50); // intervalo de envio de los valores
	} else {
		console.log("ArDrone is not connected, not creating RTCPeerConnection. Relaunch the app.");
	}
});


function sendMessage(message){
	console.log('Enviando mensaje: ', message);
	socket.emit('message', message);
}

// Mensajes de log que envia el Servidor
socket.on('log', function (array){
	console.log.apply(console, array);
});


function startArDrone() {
	arDrone = new arDrone("192.168.1.117", 17000, 15000, 11000, 19000); //Conexion con el Drone
	arDrone.start();
}