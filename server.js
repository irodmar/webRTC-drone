var static = require('node-static');
var http = require('http');
var PORT = process.env.PORT || 3000;
console.log(PORT);


var dronerID;
var newPeer;


// Create a node-static server instance
var file = new(static.Server)();

// We use the http module’s createServer function and
// rely on our instance of node-static to serve the files
var app = http.createServer(function (req, res) {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', 'https://webrtc-drone.herokuapp.com/');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
	file.serve(req, res);
}).listen(PORT);

// Use socket.io JavaScript library for real-time web applications
var io = require('socket.io').listen(app);

// Let's start managing connections...
io.sockets.on('connection', function (socket){

	// Handle 'message' messages
	socket.on('message', function (message) {
		log('Server --> got message: ', message);
		// channel-only broadcast...
		if (socket.id == dronerID) {
			io.sockets.socket(newPeer).emit('message', message);
		} else if (socket.id== newPeer) {
			io.sockets.socket(dronerID).emit('message', message);
		} 
	});

	// Handle 'create or join' messages
	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;


		log('Server --> Room ' + room + ' has ' + numClients + ' client(s)');
		log('Server --> Request to create or join room', room);

		// First client joining...
		if (numClients == 0){
			socket.join(room);
			dronerID = socket.id;
			socket.emit('created', room);
		} else if (numClients > 0) {
		// Second client joining...
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			newPeer = socket.id;
			socket.emit('joined', room);
		} else { // max 5 clients
			socket.emit('full', room);
		}
	});

	function log(){
		var array = [">>> "];
		for (var i = 0; i < arguments.length; i++) {
			array.push(arguments[i]);
		}
		socket.emit('log', array);
	}
});
