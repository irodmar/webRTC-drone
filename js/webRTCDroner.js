// about:webrtc

var localStream; // stream local de video + audio
var PeerConnection; // 

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var localVideo = document.querySelector('#localVideo'); // 
var constraints = {video: true, audio: true};


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
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      'url': 'stun:23.21.150.121'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=udp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=tcp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    }
  ]
};

var pc_constraints = {
	'optional': [
	{'DtlsSrtpKeyAgreement': true}
]};

/////////////////////// Definimos RTCPeerConnection
// Chrome
if (navigator.webkitGetUserMedia){
	RTCPeerConnection = webkitRTCPeerConnection;
// Firerox
} else if (navigator.mozGetUserMedia) {
	RTCPeerConnection = mozRTCPeerConnection;
	RTCPSessionDescription = mozRTCSessionDescription;
	RTCIceCandidate = mozRTCIceCandidate;
}
console.log('RTCPeerConnection object: ' + RTCPeerConnection);

// Creaamos PeerConnection
function createPeerConnection(){
	console.log('llamamos a createpeerconection');
	try{
		PeerConnection = new RTCPeerConnection(ICE_config, pc_constraints);
		//console.log('PeerConnection creada con:\n'+ 
		//	' config: \'' + JSON.stringify(ICE_config) + '\';\n' + 
		//	' constrainsts: \'' + JSON.stringify(pc_constraints) + '\'.');
		PeerConnection.addStream(localStream); // Añadimos localStream a PeerConnection
		console.log('Añadido stream a PeerConnection');
		PeerConnection.onicecandidate = handleIceCandidate; // Manejador ICE local (manda ICE local a remoto)
		console.log('Creando Oferta...');	
		PeerConnection.createOffer(gotLocalDescription, onSignalingError);		
		
	} catch(e){
		console.log('Fallo al crear PeerConnection, excepcion: ' + e.message);
	}
}
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