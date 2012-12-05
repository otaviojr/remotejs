//var daemon = require('daemon'),pid;
//pid = daemon.start('./logs/stdout.log', './logs/stderr.log');
//daemon.lock('./tmp/remotejs.pid');

var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs");
var path = require("path");
var url = require("url");

// Read the configuration file
var config = require("./config.js");

// Require all enabled backends on the config file
var backends = new Array();
for(var i in config.options.backend){
	var backend_config = config.options.backend[i];
	if(backend_config.enabled){
		var backend = require("./backends/"+i+".js");
		backends.push({name:i, backend: backend, config: backend_config});
		backend.init(backend_config);
	}
}

var listeners = [];

var proccess_error = function(content,origin,remoteAddress) {
	try{
		console.log(content);
		var obj = JSON.parse(content);
		obj["origin"] = origin;
		obj["remoteAddress"] = remoteAddress;
		
		var now = new Date(); 
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		obj["date"] = now_utc;
		
		for(var i = 0; i < backends.length; i++){
			var backend = backends[i];
			backend.backend.log(obj);
		}
		
		for(var j = 0; j < listeners.length; j++){
			listeners[j].sendUTF(JSON.stringify(obj));
		}
	} catch(e){
		console.log("Error processing message");
		console.log(e);
	}
}

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    
	var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
	
	console.log("Asking for: "+ url.parse(request.url).pathname);

	// Check if we are not receiving an error from the legacy system	
	if(uri == "/onerror"){
		if(request.method == "OPTIONS"){
			var headers = {
				"Access-Control-Allow-Origin": 	"*", 
				"Access-Control-Allow-Methods":	"POST,OPTIONS",
				"Content-Type":					"application/json",
				"Access-Control-Allow-Headers": "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept",
				"Access-Control-Max-Age": 		"86400"
			};
			response.writeHead(200, headers);
			response.end();
			console.log("OPTIONS - returned");
			return;			
		} else if(request.method == "POST"){
			request.setEncoding('utf-8');
		  	var responseString = '';

  			request.on('data', function(data) {
    			responseString += data;
  			});

  			request.on('end', function() {
  				proccess_error(responseString,request.origin,request.connection.remoteAddress);
				var headers = {
					"Access-Control-Allow-Origin": 	"*",
					"Access-Control-Allow-Methods":	"POST,OPTIONS",
					"Content-Type":					"application/json"
				};
				response.writeHead(200, headers);
				response.write("{'ret':1}");
				response.end();
  			});
  		}
	} else {
		path.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
	
			if (fs.statSync(filename).isDirectory()) filename += '/index.html';
	
			fs.readFile(filename, "binary", function(err, file) {
				if(err) {        
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}
	
				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
	}
});
      
server.listen(config.options.port, config.options.listen, function() {
    console.log((new Date()) + " Server is listening on port "+config.options.listen+":"+config.options.port);
});

var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
    maxReceivedFrameSize: 1073741824,
    maxReceivedMessageSize: 1099511627776
});

function originIsAllowed(origin) {
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    console.log((new Date()) + ' Connection accepted.');
    
	if(request.requestedProtocols == 'log-protocol'){
		var connection = request.accept('log-protocol', request.origin);
		
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				var message = message.utf8Data;
				proccess_error(message,request.origin,connection.remoteAddress);
			}
			else if (message.type === 'binary') {
				//Do not support binary content by now
			}
		});
		connection.on('close', function(reasonCode, description) {
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		});
	} else if(request.requestedProtocols == 'log-listener-protocol'){
		var connection = request.accept('log-listener-protocol', request.origin);
		listeners.push(connection);
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				//Listeners only receive messages... do not talk for now..
			}
		});
		
		connection.on('close', function(reasonCode, description) {
			for(var i = 0; i < listeners.length; i++){
				if(listeners[i] === connection){
					listeners.splice(i,1);
					console.log((new Date()) + ' Listener ' + connection.remoteAddress + ' encontrado e removido.');
					break;
				}				
			}
			console.log((new Date()) + ' Listener ' + connection.remoteAddress + ' disconnected.');
		});
	}
});