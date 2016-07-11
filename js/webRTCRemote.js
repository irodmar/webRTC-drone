/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/

// about:webrtc

$(function() {
    $( "#attitude" ).draggable();
    $( "#altimeter" ).draggable();
    $( "#turn_coordinator" ).draggable();
    $( "#heading" ).draggable();
});

var remoteStream; // stream local de video + audio
var PeerConnection; // 

var pose;
var navdata;

// Variable para dataChannel
var dataChannel;


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
	{'DtlsSrtpKeyAgreement': true}
]};

/////////////////////// Definimos RTCPeerConnection
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                       window.webkitRTCPeerConnection || window.msRTCPeerConnection;
var RTCPSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                       window.webkitRTCSessionDescription || window.msRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate ||
                        window.webkitRTCIceCandidate || window.msRTCIceCandidate;



// Creamos PeerConnection
function createPeerConnection(remoteSDP){

	try{
		PeerConnection = new RTCPeerConnection(ICE_config, pc_constraints);
            PeerConnection.ondatachannel = gotReceiveChannel;
  
            PeerConnection.setRemoteDescription(new RTCPSessionDescription(remoteSDP));
            PeerConnection.createAnswer(gotLocalDescription, onSignalingError);
            PeerConnection.onaddstream = handleRemoteStreamAdded;
            PeerConnection.onicecandidate = handleIceCandidate; // Manejador ICE local (manda ICE local a remoto)
        
	} catch(e){
		console.log('Fallo al crear PeerConnection, excepcion: ' + e.message);
	}
}

function gotReceiveChannel(event) {
	//console.log('Receive Channel Callback');
	dataChannel = event.channel;
	dataChannel.onmessage = handleMessage;
	dataChannel.onopen = handleSendChannelStateChange;
	dataChannel.onclose = handleSendChannelStateChange;
}

function enviarOrden(d){
    //console.log(d);
    var data = {orden:d};
    dataChannel.send(JSON.stringify(data));
}

function sendCMDVel(x, y){
    var data = {x:x,y:y};
    //console.log(data);
    dataChannel.send(JSON.stringify(data));
}

function sendAltYaw(alt, yaw){
    //console.log(d);
    var data = {alt:alt, yaw:yaw};
    dataChannel.send(JSON.stringify(data));
}

function handleMessage(event) {
    //console.log('Received message: ' + event.data);
    var data = JSON.parse(event.data);
    pose = data.pose;
    navdata = data.navdata;
    //updateAndShow(data.pose, data.navdata); quitar de aqui
}

function handleSendChannelStateChange() {
	var readyState = dataChannel.readyState;
	//console.log('Receive channel state is: ' + readyState);
	// If channel ready, enable user's input
	if (readyState == "open") {

	}
}


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
}

function handleRemoteStreamAdded(event) {
	window.remoteVideo = remoteVideo; // make avalaible on console for inspection
    var remoteVideo = document.getElementById("droneVideo"); // 

	if (window.URL){
		remoteVideo.src = window.URL.createObjectURL(event.stream);
	} else{
		remoteVideo.src = event.stream;
	}
    //console.log('Remote stream attached!!.');
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
