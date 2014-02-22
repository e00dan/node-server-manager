module.exports = function(dataBuffer) {
	this.position 		= 0;
	this.CompleteLength = 0;

	var buffer 			= dataBuffer;
	var storedBuffers 	= [];

	//console.log('[MsgBuffer::__construct][Info]: buffer.length = ' + buffer.length + '.');
	if(!(dataBuffer instanceof Buffer) && dataBuffer instanceof Array) {
		buffer = new Buffer(buffer);
	}

	this.verifyNextByte = function(byte) {
		var bool = (buffer[this.position] === byte);
		this.position++;
		var message = (bool) ? '[MsgBuffer::verifyNextByte][Info]: Byte verified - ' + byte + ' - good.' : '[MsgBuffer::verifyNextByte][Info]: Byte verified - ' + byte + ' - bad.';
		console.log(message);
		return bool;
	}

	this.loadBytes = function() {
		buffer = (storedBuffers.length > 0) ? Buffer.concat(storedBuffers) : buffer;
		console.log('[MsgBuffer::loadBytes][Info]: Loaded (buffer.length) ' + buffer.length + ' bytes.');
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
		console.log('[MsgBuffer::getUint16][Info]: MsgBuffer.position = ' + this.position + ' against buffer.length = ' + buffer.length + '.');
		if(this.position == buffer.length) {
			console.log('[MsgBuffer::getUint16][Info]: MsgBuffer.position = ' + this.position + ' is equal to buffer.length = ' + buffer.length + '. Crash coming soon...');
			return false;
		} else {
			var uint16 = buffer.readUInt16LE(this.position);
			this.position += 2;
			return uint16;
		}
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

	this.putString = function(string, encoding, addLength) {
		encoding = typeof encoding !== 'undefined' ? encoding : 'ASCII';
		addLength = typeof addLength !== 'undefined' ? addLength : 'false';
		if(addLength == true)
			this.putUint16(string.length);
		var stringBuffer = new Buffer(string, encoding);
		buffer = Buffer.concat([buffer, stringBuffer]);
	}

	this.putUint16 = function(value) {
		var uintBuffer = new Buffer(2);
		uintBuffer.writeUInt16LE(value, 0);
		buffer = Buffer.concat([buffer, uintBuffer]);
	}

	this.getLength = function() {
		return buffer.length;
	}
}