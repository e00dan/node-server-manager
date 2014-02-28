var MsgBuffer = require('./MsgBuffer.js'),
	Communication = require('./Communication.js'),
	Player = require('./Player.js'),
	util = require('util'),
	events = require('events'),
	parseString = require('xml2js').parseString;

exports = module.exports = Status = function Status(host, port) {
	this.OnlinePlayers = 0;
	this.PlayersList = [];

	this.getServerInfo = function() {
		var origin = this;

		var sendBuffer = new MsgBuffer(new Buffer([255, 255]));
		sendBuffer.putString('info');

		var communication = new Communication(host, port);

		communication.on('connected', function () {
			communication.send(sendBuffer.getBuffer(true));
		})

		communication.on('receivedBytes', function(bytes) {
			parseString(bytes, function(err, result) {
				origin.emit('serverInfo', result);
			});
		});

		communication.on('error', function(e) {
			origin.emit('error', e);
		});

		communication.on('lost', function(e) {
			origin.emit('error', e);
		});
		
		communication.connect();
	}

	this.getOnlinePlayers = function() {
		/* How TFS handles this: 
		- FIRST 2 BYTES: int32_t size = (int32_t)(m_buffer[0] | m_buffer[1] << 8); // Gets size of message as int32 but
			probably uint16 should be send as length
		- 3 BYTE: uint8_t type = msg.get<char>(); // Gets the type as uint8, then
			there is a switch:
			a) 3 BYTE = 0xFF
				4 BYTE = 0x01
			b) 3 BYTE = 0x01 - REQUEST_BASIC_SERVER_INFO
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
				msg.verifyNextByte(0x21);
				origin.OnlinePlayers = msg.getInt32();
			} else
				msg.storeBuffer(bytes);

			if(msg.CompleteLength == (this.bytesReceived - 2)) {
				msg.loadBytes();
				console.log('[Status::getOnlinePlayers][Info]: Received all bytes(' + this.bytesReceived + ').');

				while(origin.PlayersList.length < origin.OnlinePlayers) {
					var nickLength 	= msg.getUint16();
					var player 		= new Player(msg.getString(nickLength, 'UTF8'), msg.getInt32());
					origin.PlayersList.push(player);
				}
				console.log('[Status::getOnlinePlayers][Info]: Got all players(' + origin.PlayersList.length + ').')
				origin.emit('players');
			}
		});

		communication.on('error', function(e) {
			origin.emit('error', e);
		});

		communication.on('lost', function(e) {
			origin.emit('error', e);
		});

		communication.connect();
	}

	this.getPlayerInfo = function(name) {
		var sendBuffer = new MsgBuffer(new Buffer([0xFF, 0x01, 0x40]));
		sendBuffer.putString(name, 'ASCII', true);

		var communication = new Communication(host, port);

		communication.on('connected', function () {
			communication.send(sendBuffer.getBuffer(true));
		})

		communication.on('receivedBytes', function(bytes) {
			console.log('Received: ' + bytes.length);
			if(bytes[2] == 0x22)
				console.log('0x22! : REQUEST_PLAYER_STATUS_INFO');
			if(bytes[3] == 0x01)
				console.log('ONLINE');
			else if(bytes[3] == 0x00)
				console.log('offline?');
		});

		communication.connect();
	}
}
util.inherits(Status, events.EventEmitter);