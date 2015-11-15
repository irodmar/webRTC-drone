// about:webrtc

var remoteStream; // stream local de video + audio
var PeerConnection; // 

var remoteVideo = document.querySelector('#droneVideo'); // 

// Variable para dataChannel
var dataChannel;
var fader = document.getElementById("fader");


var boton = document.getElementById("button");
boton.disabled = true;
// CANVAS circulo
var cxt=boton.getContext("2d");
cxt.fillStyle ="red";
cxt.beginPath();
cxt.arc(60,60,50,0,Math.PI*2,true);
cxt.closePath();
cxt.fill();


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
RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                       window.webkitRTCPeerConnection || window.msRTCPeerConnection;
RTCPSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                       window.webkitRTCSessionDescription || window.msRTCSessionDescription;
RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate ||
                        window.webkitRTCIceCandidate || window.msRTCIceCandidate;
// Chrome
//if (navigator.webkitGetUserMedia){
	//RTCPeerConnection = webkitRTCPeerConnection;

// Firerox
//} else if (navigator.mozGetUserMedia) {
//	RTCPeerConnection = mozRTCPeerConnection;
	//RTCPSessionDescription = mozRTCSessionDescription;
	//RTCIceCandidate = mozRTCIceCandidate;
//}
console.log('RTCPeerConnection object: ' + RTCPeerConnection);

// Creaamos PeerConnection
function createPeerConnection(remoteSDP){
	console.log('llamamos a createpeerconection');
    console.log(remoteSDP);

	try{
		PeerConnection = new RTCPeerConnection(ICE_config, pc_constraints);
            PeerConnection.ondatachannel = gotReceiveChannel;

            //console.log('PeerConnection creada con:\n'+ 
            //	' config: \'' + JSON.stringify(ICE_config) + '\';\n' + 
            //	' constrainsts: \'' + JSON.stringify(pc_constraints) + '\'.');
            //PeerConnection.addStream(localStream); //No necesito añadir localStream a PeerConnection
            PeerConnection.setRemoteDescription(new RTCPSessionDescription(remoteSDP));
            PeerConnection.createAnswer(gotLocalDescription, onSignalingError);
            PeerConnection.onaddstream = handleRemoteStreamAdded;
            PeerConnection.onicecandidate = handleIceCandidate; // Manejador ICE local (manda ICE local a remoto)
            console.log('Creando Oferta...');
                // handler del Data Channel creadop por el droner
	} catch(e){
		console.log('Fallo al crear PeerConnection, excepcion: ' + e.message);
	}
}

function gotReceiveChannel(event) {
	console.log('Receive Channel Callback');
	dataChannel = event.channel;
	dataChannel.onmessage = handleMessage;
	dataChannel.onopen = handleSendChannelStateChange;
	dataChannel.onclose = handleSendChannelStateChange;
}

function handleMessage(event) {
	console.log('Received message: ' + event.data);
	document.getElementById('fileOutput').value = event.data;
}


function handleSendChannelStateChange() {
	var readyState = dataChannel.readyState;
	console.log('Receive channel state is: ' + readyState);
	// If channel ready, enable user's input
	if (readyState == "open") {
		fader.disabled = false;
		boton.disabled = false;
		boton.onclick = sendBoton;//pongo el onclick aqui
	}
}
// enviamos cuando se mueve el fader
function sendFader(value) {
	dataChannel.send("fader " + value);
	document.querySelector('#val').value = value;
	console.log('Sent data: ' + value);
}

// enviamos cuando se pulsa el boton
function sendBoton() {
	if (cxt.fillStyle == "#ff0000") { //Si el color es rojo cambialo a verde y mandalo
		cxt.fillStyle = "green";
		cxt.fill();
		dataChannel.send("Boton " + cxt.fillStyle);
	} else{
		cxt.fillStyle = "red";
		cxt.fill();
		dataChannel.send("Boton " + cxt.fillStyle);
	}
	console.log('Sent Boton');
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
function handleRemoteStreamAdded(event) {
	window.remoteStream = event.stream; // make avalaible on console for inspection
	if (window.URL){
		remoteVideo.src = window.URL.createObjectURL(event.stream);
	} else{
		remoteVideo.src = event.stream;
	}
    console.log('Remote stream attached!!.');
	remoteStream = event.stream;
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