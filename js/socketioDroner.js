// Archivo que se encarga de la comunicacion con el servidor de señalozacion y llama a las funciones necesarias de webRTC
//del droenr

// Pedimos nombre de la sala
var room = prompt('Introduce el nombre de la nueva sala:');

// conexion de Socket.io al servidor de señalizacion
var socket = io.connect("192.168.1.10");

// Send 'Create or join' message to singnaling server
if (room !== '') {
	console.log('Create room', room);
	socket.emit('create', room);
}

// Recibimos respuesta del servidor de sala creada y llamamos a getUserMedia
socket.on('created', function (room){
	console.log('Created room ' + room);
	callGetUserMedia();
});

socket.on('join watcher', function (room){
	console.log('Un "watcher" se ha unido a la sala ' + room);
	createPeerConnection(false);
});

socket.on('join remote', function (room){
	console.log('Un "remote" se ha unido a la sala ' + room);
	createPeerConnection(true);
});


function sendMessage(message){
	console.log('Enviando mensaje: ', message);
	socket.emit('message', message);
}

// Mensajes de log que envia el Servidor
socket.on('log', function (array){
	console.log.apply(console, array);
});