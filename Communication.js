var enumFactory = require('simple-enum'), events = require('events'), net = require('net'), util = require('util');
connectionStates = enumFactory(['Disconnected', 'Connected']);
function Communication(host, port) {
	this.client 			= null;
	this.messagesReceived 	= 0;
	this.bytesReceived		= 0;

	var host	= host;
	var port 	= port;
	var connectionState = connectionStates.Disconnected;

	events.EventEmitter.call(this);

	this.connect = function() {
		if(connectionState === connectionStates.Disconnected) {
			var origin = this;
			this.client = net.connect({ host: host, port: port }, function() {
				connectionState = connectionStates.Connected;
				origin.emit('connected');
				console.log('[Communication::connect][Info]: Connected to `' + host + ':' + port + '`.');
			});
			this.client.on('end', function() {
				connectionState = connectionStates.Disconnected;
				console.log('[Communication::connect][Info]: Connection lost.');
			})
			this.client.on('error', function(e) {
				console.log('[Communication::connect][Error]:', e);
			});
		} else
			console.log('[Communication::connect][Error]: Connection is already made!');
	}

	this.send = function(data) {
		if(connectionState === connectionStates.Connected) {
			var origin = this;
			this.client.on('data', function(bytes) {
				origin.messagesReceived++;
				origin.emit('receivedBytes', bytes);
			});
			this.client.write(data);
		} else
			console.log('[Communication::send][Error]: Can not send data - client is disconnected.');
	}
}
util.inherits(Communication, events.EventEmitter);
module.exports = Communication;