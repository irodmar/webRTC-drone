// Archivo que se encarga de la comunicacion con el servidor de señalozacion y llama a las funciones necesarias de webRTC
//del droenr

// Pedimos nombre de la sala
var room = prompt('Introduce el nombre de la nueva sala:');

// conexion de Socket.io al servidor de señalizacion
var socket = io.connect("http://10.10.49.22:3000");

// Send 'Create or join' message to singnaling server
if (room !== '') {
	console.log('Create or join room', room);
	socket.emit('create or join', room);
}

// Recibimos respuesta del servidor de sala creada y llamamos a getUserMedia
socket.on('created', function (room){
	console.log('Created room ' + room);
	callGetUserMedia();
});

socket.on('join', function (room){
	console.log('Otro peer ha hecho una peticion de unirse a la sala ' + room);
	createPeerConnection();
});


//socket.on('message', function (message){
//	console.log('Received message:', message);
//	if (message.type === 'answer') {
//		PeerConnection.setRemoteDescription(new RTCPSessionDescription(message));
//	} else if (message.type === 'candidate') {
//		var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
//			candidate:message.candidate});
//		PeerConnection.addIceCandidate(candidate);
//	}
//});









function sendMessage(message){
	console.log('Enviando mensaje: ', message);
	socket.emit('message', message);
}

// Mensajes de log que envia el Servidor
socket.on('log', function (array){
	console.log.apply(console, array);
});