// about:webrtc

$(function() {
    $( "#attitude" ).draggable();
    $( "#altimeter" ).draggable();
    $( "#turn_coordinator" ).draggable();
    $( "#heading" ).draggable();
});

var remoteStream; // stream local de video + audio
var PeerConnection; // 

 

// Variable para dataChannel
var dataChannel;


function getYaw(qw,qx,qy,qz) {                     
        var rotateZa0=2.0*(qx*qy + qw*qz);
        var rotateZa1=qw*qw + qx*qx - qy*qy - qz*qz;
        var rotateZ=0.0;
        if(rotateZa0 != 0.0 && rotateZa1 != 0.0){
            rotateZ=Math.atan2(rotateZa0,rotateZa1);
        }
        return rotateZ*180/Math.PI ;
}

function getRoll(qw,qx,qy,qz){
        rotateXa0=2.0*(qy*qz + qw*qx);
        rotateXa1=qw*qw - qx*qx - qy*qy + qz*qz;
        rotateX=0.0;
        
        if(rotateXa0 != 0.0 && rotateXa1 !=0.0){
            rotateX=Math.atan2(rotateXa0, rotateXa1)
        }   
        return rotateX*180/Math.PI;
}
function getPitch(qw,qx,qy,qz){
        rotateYa0=-2.0*(qx*qz - qw*qy);
        rotateY=0.0;
        if(rotateYa0>=1.0){
            rotateY=math.PI/2.0;
        } else if(rotateYa0<=-1.0){
            rotateY=-Math.PI/2.0
        } else {
            rotateY=Math.asin(rotateYa0)
        }
        
        return rotateY*180/Math.PI;
}


function updateAndShow(pose, navdata){
        // calculate yaw, pitch, and roll
        var yaw = getYaw(pose.q0, pose.q1, pose.q2, pose.q3);
        var pitch = getPitch(pose.q0, pose.q1, pose.q2, pose.q3);
        var roll = getRoll(pose.q0, pose.q1, pose.q2, pose.q3);
        panelControl.updatePanelControl(yaw, pitch, roll, pose);
}


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
    updateAndShow(data.pose, data.navdata);
}

function handleSendChannelStateChange() {
	var readyState = dataChannel.readyState;
	console.log('Receive channel state is: ' + readyState);
	// If channel ready, enable user's input
	if (readyState == "open") {

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
function handleRemoteStreamAdded(event) {
	window.remoteVideo = remoteVideo; // make avalaible on console for inspection
    var remoteVideo = document.getElementById("droneVideo"); // 

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