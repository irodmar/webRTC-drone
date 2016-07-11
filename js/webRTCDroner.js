/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/


var localStream; // stream local de video + audio
//var PeerConnection; // 

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var localVideo = document.querySelector('#localVideo'); // 


var constraints = {
    audio: false,
    video: {
        width: { ideal: 1280, max: 1920 },
        height: {ideal: 720, max: 1080 },
    }
};
// Variable para dataChannel
var dataChannel;
var isChannelRunning = false; 
var fader = document.getElementById("fader");



function sendNavigationData(pose, navdata) {
	var s = {pose:pose, navdata:navdata};
	dataChannel.send(JSON.stringify(s));
	//console.log("Send navigationData.");
}


function handleUserMedia(stream){
	localStream = stream;

	if (window.URL){
		localVideo.src = window.URL.createObjectURL(stream);
		window.AVER = stream;
	} else{
		localVideo.src = stream;
	}
	//console.log('Adding local stream.');
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
window.dess = RTCPSessionDescription;
RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate ||
                        window.webkitRTCIceCandidate || window.msRTCIceCandidate;


// Creaamos PeerConnection
function createPeerConnection(isRemote){
	//console.log('llamamos a createpeerconection');
	
		// ********* Funciones de peer connection

	function handleIceCandidate(event){
		//console.log('handleIceCandidate event: ', event);
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
	
	
	
	// ******* Manejador de datos recibidos ********
	function handleReceiveData(data) {
		if ("orden" in data) {
			if (data.orden == "takeoff") {
				arDrone.takeoff();
			} else if (data.orden == "land") {
				arDrone.land();
			} else {
				console.log("Orden no valida. ");
			}
		} else if ("x" in data) {
			arDrone.setXYValues(data.x, data.y);
		} else if ("alt" in data) {
			arDrone.setAltYaw(data.alt, data.yaw);
		} else {
			console.log("Dato invalido. ");
		}		
	}
	
    // Recibimos los paquetes del datachannel y los enviamos al manejador de datos
	function handleMessage(event) {
		//console.log('Received message: ' + event.data);
		var data = JSON.parse(event.data);
		handleReceiveData(data);
	}
	
	function handleReceiveChannelStateChange() {
		var readyState = dataChannel.readyState;
		//console.log('Send channel state is: ' + readyState);
		if (readyState == closed) {
			isChannelRunning = false;
            clearInterval(intervalo); //Paramos el intervalo de actulizacion con el drone si el canal se cierra
		}
	}	
	
	try{
		var PeerConnection = new RTCPeerConnection(ICE_config, pc_constraints);
		
		// Creamos el dataChannel si es un remote
		if (isRemote) {		
			try {
				// Create a reliable data channel
				dataChannel = PeerConnection.createDataChannel("droneDataChannel", {ordered: false});
				dataChannel.onerror = function (error) {
					console.log("Data Channel Error:", error);
				};
				dataChannel.onopen = handleReceiveChannelStateChange;
				dataChannel.onmessage = handleMessage;
				dataChannel.onclose = handleReceiveChannelStateChange;
				isChannelRunning = true;
				//console.log('Created datachannel');
			} catch (e) {
				console.log('createDataChannel() failed with exception: ' + e.message);
			}
		}
		
		
		PeerConnection.addStream(localStream); // Añadimos localStream a PeerConnection
		//console.log('Añadido stream a PeerConnection');
		PeerConnection.onicecandidate = handleIceCandidate; // Manejador ICE local (manda ICE local a remoto)
		//console.log('Creando Oferta...');	
		PeerConnection.createOffer(gotLocalDescription, onSignalingError);
		
		
		
		socket.on('message', function (message){
		//console.log('Received message:', message);
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