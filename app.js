/* CONFIG */
var config = {
	killNodeProcesses : true,
	httpServer : true,
	enableOOP : true
}
/* CONFIG --END */

/* STARTUP */
console.log('[STARTUP][Info]: Current process: { PID: ' + process.pid + ', TITLE: ' + process.title + ' }');
console.log('[STARTUP][Info]: Config: ', config);
/* STARTUP --END */

/* REQUIRE */
var net = require('net'), enumFactory = require('simple-enum'),
	util = require('util'), events = require('events');
if(config.killNodeProcesses)
	var exec 		= require('child_process').exec;
if(config.httpServer) {
	var http 		= require('http'),
		querystring = require('querystring');
}
/* REQUIRE --END */

/* ADDRESSES */
addresses 			= enumFactory(["Memsoria", "Nouname", "Revana", "Hexana", 'Tixera']);
addresses.Memsoria 	= 'memsoria.pl';
addresses.Nouname 	= '109.125.200.88';
addresses.Revana 	= 'revana.pl';
addresses.Hexana	= 'hexana.net';
addresses.Tixera	= 'tixera.pl';
/* ADDRESSES --END */

/* PM[PROTOTYPE MODIFYING] */
Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1)
			this.splice(ax, 1);
	}
	return this;
};
/* PM --END */

/* HTTP */

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            response.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var httpServer = http.createServer(function (request, response) {
	if(request.method == 'POST') {
		processPost(request, response, function() {
            console.log(response.post);
            if(response.post.ip != null) {
            	if(config.enableOOP) {
					var status = new Status(response.post.ip, 7171);

		            status.on('players', function () {
		            	var content = 'pozytywnieeee jeest :)<br/><table><thead><th>Numer</th><th>Nick</th><th>Level</th></thead><tbody>';
						content += 'Na serwerze o IP: `' + response.post.ip + '` jest <b>' + status.PlayersList.length + '</b> graczy.<br/>';
						var i = 0;

			            status.PlayersList.map(function (p) {
			            	i++;
							content += '<tr><td>' + i + '.</td><td>' + p.Name + '</td><td>' + p.Level + '</td>';
						});

			            response.writeHead(200, "OK", {'Content-Type': 'text/html; charset=utf-8'});
			            response.end(content + '</tbody></table>');
		            });

		       		status.getOnlinePlayers();
				}
			}
			
        });
	} else {
		response.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
		response.end('<html><form action="/" method="post"><input type="text" name="ip"></input><button type="submit">IP ; p</button></form></html>');
	}
	
});

httpServer.on('error', function(e) {
	if(e.code == "EADDRINUSE") {
		/* KONP[Kill Other Node Processes] */
		if(config.killNodeProcesses) {
			var child = exec('ps aux | grep \'node\' | grep -v grep | grep -v SCREEN | awk \'{print $2}\'', function(error, stdout, stderr) {
				var processes = stdout.match(/^([\d]+)/gm);
				processes.remove(process.pid.toString());
				if (typeof processes !== 'undefined' && processes.length > 0) {
					console.log(processes);
					processes.map(function (p) {
						process.kill(p, 'SIGKILL');
						console.log('[STARTUP]=>[KONP]: Killed old node.js proccess: { PID: ' + p + ' }.');
					});
				}
				else
					console.log('[STARTUP]=>[KONP]: No old node.js processes killed.');
			});
		}
		/* KONP --END */
	}
});

httpServer.listen(7777);
/* HTTP -- END */

/* MsgBuffer */
function MsgBuffer(dataBuffer) {
	this.position 		= 0;
	this.CompleteLength = 0;

	var buffer 			= dataBuffer;
	var storedBuffers 	= [];

	this.verifyNextByte = function(byte) {
		var bool = (buffer[this.position] === byte)
		this.position++;
		return bool;
	}

	this.loadBytes = function() {
		buffer = (storedBuffers.length > 0) ? Buffer.concat(storedBuffers) : buffer;
	}

	this.storeBuffer = function(bufferToBeStored) {
		if(storedBuffers.length == 0)
			storedBuffers.push(buffer);
		storedBuffers.push(bufferToBeStored);
	}

	this.skipBytes = function(count) {
		this.position += count;
	}

	this.getUint16 = function() {
		var uint16 = buffer.readUInt16LE(this.position);
		this.position += 2;
		return uint16;
	}

	this.getInt32 = function() {
		var int32 = buffer.readInt32LE(this.position);
		this.position += 4;
		return int32;
	}

	this.getString = function(length, encoding) {
		length = (length >= 0) ? length : buffer.length - this.position;
		var string = buffer.toString(encoding, this.position, (this.position + length));
		this.position += length;
		return string;
	}

	this.getBuffer = function(putLength) {
		if(putLength) {
			var lengthBuffer = new Buffer(2);
			lengthBuffer.writeUInt16LE(buffer.length, 0);
			buffer = Buffer.concat([lengthBuffer, buffer]);
		}
		return buffer;
	}

	this.putString = function(string, encoding) {
		var stringBuffer = new Buffer(string);
		buffer = Buffer.concat([buffer, stringBuffer]);
	}
}
/* MsgBuffer --END */

/* Communication */
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
/* Communication --END */

/* Player */
function Player(name, level) {
	this.Name 				= typeof name !== 'undefined' ? name : ''; // ASCII string
	this.Level 				= typeof level !== 'undefined' ? level : ''; // int32
}
/* Player --END */

/* Status */
function Status(host, port) {
	this.OnlinePlayers = 0;
	this.PlayersList = [];

	this.getOnlinePlayers = function() {
		/* How TFS handles this: 
		- FIRST 2 BYTES: int32_t size = (int32_t)(m_buffer[0] | m_buffer[1] << 8); // Gets size of message as int32 but
			probably uint16 should be send as length
		- 3 BYTE: uint8_t type = msg.get<char>(); // Gets the type as uint8, then
			there is a switch:
			a) 3 BYTE = 0xFF
				4 BYTE = 0x01
			b) 3 BYTE = 0x01
				REQUEST_BASIC_SERVER_INFO 	= 0x01,
				REQUEST_SERVER_OWNER_INFO	= 0x02,
				REQUEST_MISC_SERVER_INFO	= 0x04,
				REQUEST_PLAYERS_INFO		= 0x08,
				REQUEST_SERVER_MAP_INFO		= 0x10,
				REQUEST_EXT_PLAYERS_INFO	= 0x20,
				REQUEST_PLAYER_STATUS_INFO	= 0x40,
				REQUEST_SERVER_SOFTWARE_INFO	= 0x80
		*/
		const REQUEST_BASIC_SERVER_INFO	 = 0x01,
			REQUEST_SERVER_OWNER_INFO	 = 0x02,
			REQUEST_MISC_SERVER_INFO	 = 0x04,
			REQUEST_PLAYERS_INFO		 = 0x08,
			REQUEST_SERVER_MAP_INFO		 = 0x10,
			REQUEST_EXT_PLAYERS_INFO	 = 0x20,
			REQUEST_PLAYER_STATUS_INFO	 = 0x40,
			REQUEST_SERVER_SOFTWARE_INFO = 0x80

		var sendBuffer = new MsgBuffer(new Buffer([0xFF, 0x01, 0x20]));

		var communication = new Communication(host, port);

		communication.on('connected', function() {
			communication.send(sendBuffer.getBuffer(true));
		});

		var origin = this;
		communication.on('receivedBytes', function(bytes) {
			this.bytesReceived += bytes.length;

			if(this.messagesReceived == 1) {
				msg = new MsgBuffer(bytes);
				msg.CompleteLength = msg.getUint16();
				console.log(msg.verifyNextByte(0x21) ? 'good byte' : 'bad byte');
				origin.OnlinePlayers = msg.getInt32();
			} else
				msg.storeBuffer(bytes);

			if(msg.CompleteLength == (this.bytesReceived - 2)) {
				msg.loadBytes();
				console.log('[Status::getOnlinePlayers][Info]: Received all bytes(' + this.bytesReceived + ').');

				while(origin.PlayersList.length < origin.OnlinePlayers) {
					var nickLength 	= msg.getUint16();
					var player 		= new Player(msg.getString(nickLength, 'ASCII'), msg.getInt32());
					origin.PlayersList.push(player);
				}
				console.log('[Status::getOnlinePlayers][Info]: Got all players(' + origin.PlayersList.length + ').')
				origin.emit('players');
			}
		});

		communication.connect();
	}

	this.getPlayerInfo = function(name) {
		var sendBuffer = new MsgBuffer(new Buffer([0xFF, 0x01, 0x40]));
		sendBuffer.putString(name, 'ASCII');

		var communication = new Communication(host, port);

		communication.on('connected', function () {
			communication.send(sendBuffer.getBuffer(true));
		})

		communication.on('receivedBytes', function(bytes) {
			console.log('Received: ' + bytes.length);
			if(bytes[2] == 0x22)
				console.log('0x22! : REQUEST_PLAYER_STATUS_INFO');
			if(bytes[3] == 0x01)
				console.log('online?');
			else if(bytes[3] == 0x00)
				console.log('offline?');
		});

		communication.connect();
	}
}
util.inherits(Status, events.EventEmitter);
/* Status --END */

