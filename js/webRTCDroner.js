// about:webrtc

var localStream; // stream local de video + audio
//var PeerConnection; // 

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var localVideo = document.querySelector('#localVideo'); // 
var constraints = {video: true, audio: true};

// Variable para dataChannel
var dataChannel;
var fader = document.getElementById("fader");



// CANVAS circulo

var c=document.getElementById("circulo");
var cxt=c.getContext("2d");

cxt.fillStyle ="red";
cxt.beginPath();
cxt.arc(60,60,50,0,Math.PI*2,true);
cxt.closePath();
cxt.fill();


// Lectura y envio del archivo .txt
var sendFileButton = document.getElementById("fileInput");
var file;
function readFiles(files) { // Funcion llamada cuando el usuario selecciona un archivo
	file = files[0];
	var intervalo = setInterval("readFileAndSend()", 3000); // Leemos y enviamos el archivo cada 3 segundos
}

// enviamos cada setInterval el valor del archivo
function sendFile(value) {
	dataChannel.send(value);
	console.log('Sent File: ' + value);
}


function readFileAndSend(){
	var reader = new FileReader();
	reader.onload = function (e) {
		sendFile(e.target.result);
	};
	reader.readAsText(file);
}


function handleUserMedia(stream){
	localStream = stream;
	//console.log('Usando dispositivo de video: ' + localStream.getVideoTracks()[0].label);
	//console.log('Usando dispositivo de audio: ' + localStream.getAudioTracks()[0].label);
	window.stream = stream; // make avalaible on console for inspection
	if (window.URL){
		localVideo.src = window.URL.createObjectURL(stream);
	} else{
		localVideo.src = stream;
	}
	console.log('Adding local stream.');
	// Envio un mensaje al servidor como ack de exito al llamar gerUserMedia()	
}

function handleUserMediaError(error){
	console.log('getUserMedia error: ', error);
}

// Funcion llamada despues de crear la sala
function callGetUserMedia(){
	navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError); //Ejecutarmos getUserMedia()
}

// HASTA AQUI getUserMedia

// PeerConnection
///////////////// VARIABLES PARA PEERCONNECTION
var ICE_config = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19302'
    },
    {
      'urls': 'stun:23.21.150.121'
    },
    {
      'urls': 'turn:192.158.29.39:3478?transport=udp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    },
    {
      'urls': 'turn:192.158.29.39:3478?transport=tcp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    }
  ]
};

var pc_constraints = {
	'optional': [
	{'RtpDataChannels': true}
]};

/////////////////////// Definimos RTCPeerConnection
RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                       window.webkitRTCPeerConnection || window.msRTCPeerConnection;
RTCPSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                       window.webkitRTCSessionDescription || window.msRTCSessionDescription;
RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate ||
                        window.webkitRTCIceCandidate || window.msRTCIceCandidate;
// Chrome
//if (navigator.webkitGetUserMedia){
//	RTCPeerConnection = webkitRTCPeerConnection;
// Firerox
//} else if (navigator.mozGetUserMedia) {
//	RTCPeerConnection = mozRTCPeerConnection;
//	RTCPSessionDescription = mozRTCSessionDescription;
//	RTCIceCandidate = mozRTCIceCandidate;
//}
console.log('RTCPeerConnection object: ' + RTCPeerConnection);

// Creaamos PeerConnection
function createPeerConnection(isRemote){
	console.log('llamamos a createpeerconection');
	
		// ********* Funciones de peer connection

	function handleIceCandidate(event){
		console.log('handleIceCandidate event: ', event);
		if (event.candidate) {
			sendMessage({
			type: 'candidate',
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			candidate: event.candidate.candidate});
		} else {
			console.log('End of candidates.');
		}
			// console.log('Local ICE candidate: \n' + event.candidate.candidate);
		
	}
	
	
	
	function gotLocalDescription(sessionDescription){
		PeerConnection.setLocalDescription(sessionDescription, successLocalSDP, errorLocalSDP);
		sendMessage(sessionDescription);
		// Creamos y añadomos al PeerConnection el SDP local y se lo enviamos al peer
	}
	
	function successLocalSDP(){
		console.log('Exito al crear y enviar SDP local');
	}
	
	function errorLocalSDP(error){
		console.log('Error al crear el SDP: ' + error);
	}
	
	function onSignalingError(error){
		console.log('Fallo al crear el SDP: ' + error);	
	}
	
	
	
	// ******* Funciones del DataChannel ********
	
	function handleMessage(event) {
		console.log('Received message: ' + event.data);
		var data = event.data.split(' ');
		if (data[0] == "fader") {			
			fader.value = data[1];
			document.querySelector('#val').value = data[1];
		} else{
			cxt.fillStyle = data[1];
			cxt.fill();
		}
	}
	
	function handleReceiveChannelStateChange() {
		var readyState = dataChannel.readyState;
		fader.disabled = false;
		sendFileButton.disabled = false;
		console.log('Send channel state is: ' + readyState);
	}	
	
	try{
		var PeerConnection = new RTCPeerConnection(ICE_config, pc_constraints);
		
		// Creamos el dataChannel si es un remote
		if (isRemote) {		
			try {
				// Create a reliable data channel
				dataChannel = PeerConnection.createDataChannel("droneDataChannel", {reliable:false, maxRetransmits: 10});
				dataChannel.onerror = function (error) {
					console.log("Data Channel Error:", error);
				};
				dataChannel.onopen = handleReceiveChannelStateChange;
				dataChannel.onmessage = handleMessage;
				dataChannel.onclose = handleReceiveChannelStateChange;
				console.log('Created datachannel');
			} catch (e) {
				console.log('createDataChannel() failed with exception: ' + e.message);
			}
		}
		
		
		PeerConnection.addStream(localStream); // Añadimos localStream a PeerConnection
		console.log('Añadido stream a PeerConnection');
		PeerConnection.onicecandidate = handleIceCandidate; // Manejador ICE local (manda ICE local a remoto)
		console.log('Creando Oferta...');	
		PeerConnection.createOffer(gotLocalDescription, onSignalingError);
		
		
		
		socket.on('message', function (message){
		console.log('Received message:', message);
		if (message.type === 'answer') {
			PeerConnection.setRemoteDescription(new RTCPSessionDescription(message));
		} else if (message.type === 'candidate') {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
				candidate:message.candidate});
			PeerConnection.addIceCandidate(candidate);
		}		
		
});
		
	} catch(e){
		console.log('Fallo al crear PeerConnection, excepcion: ' + e.message);
	}
}