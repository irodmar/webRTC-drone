// Archivo que se encarga de la comunicacion con el servidor de señalozacion y llama a las funciones necesarias de webRTC
// del watcher

// instruments
var panelControl;
var intervalo = null;

// Pedimos nombre de la sala
var room = prompt('Introduce el nombre de la sala a la que te quieres unir:');

// conexion de Socket.io al servidor de señalizacion
var socket = io.connect("10.10.48.188");

// Send 'Create or join' message to singnaling server
if (room !== '') {
	console.log('Join remote to: ', room);
	socket.emit('join remote', room);
}

socket.on('joined', function (room){
	console.log('This peer has joined room ' + room);
	panelControl = new panelControl();
	leftJoystick();
	rightJoystick();
});



socket.on('message', function (message){
	console.log('Received message:', message);
        if (message.type === 'offer') {
        	createPeerConnection(message);

	} else if (message.type === 'candidate') {
		var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
			candidate:message.candidate});
		PeerConnection.addIceCandidate(candidate);
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