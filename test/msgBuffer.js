var should = require('should')
	, MsgBuffer = require('../MsgBuffer.js');

describe('MsgBuffer', function() {
	describe('#verifyNextByte()', function() {
		it('should return true when next byte is the same or false when it is not', function() {
			var msgBuffer = new MsgBuffer(new Buffer([0x00, 0x01, 0x02]));
			msgBuffer.verifyNextByte(0x00).should.equal(true);
			msgBuffer.verifyNextByte(0x01).should.equal(true);
			msgBuffer.verifyNextByte(0x01).should.equal(false);
		});
	});

	describe('#loadBytes()', function() {
		it('should merge buffers when stored buffers are not empty', function() {
			var bufferOne = new MsgBuffer([0x00, 0x01]);
			var bufferTwo = new Buffer([0x02, 0x03, 0x04]);
			bufferOne.getLength().should.equal(2);

			bufferOne.loadBytes();
			bufferOne.getLength().should.equal(2);

			bufferOne.storeBuffer(bufferTwo);
			bufferOne.loadBytes();
			bufferOne.getLength().should.equal(5);
		});
	});

	describe('#storeBuffer()', function() {
		it('should store buffer new buffer and old when function called', function() {
			var buffer = new MsgBuffer();
			bufferToBeStored = new Buffer(1);
			buffer.getStoredBuffersLength().should.equal(0);

			buffer.storeBuffer(bufferToBeStored);
			buffer.getStoredBuffersLength().should.equal(2);
		});
	});

	describe('#skipBytes()', function() {
		it('should skip number of bytes to read', function() {
			var buffer = new MsgBuffer([0x00, 0x01, 0x02, 0x03]);
			buffer.skipBytes(2);
			buffer.verifyNextByte(0x02).should.equal(true);
		});
	});

	describe('#getUint16()', function() {
		it('should get uint16(LE or BE) from buffer', function() {
			var buffer = new MsgBuffer();
			var uint16 = 65535;
			buffer.putUint16(uint16);
			buffer.getUint16().should.equal(uint16);

			var uint16BE = 1126;
			buffer.putUint16(uint16BE, true);
			buffer.getUint16(true).should.equal(uint16BE);

			buffer.getUint16().should.equal(false);
		});
	});

	describe('#getInt32()', function() {
		it('should get int32(LE or BE) from buffer', function() {
			var buffer = new MsgBuffer();
			var int32 = 2147483647;
			buffer.putInt32(int32);
			buffer.getInt32().should.equal(int32);

			int32NegativeBE = -2147483648;
			buffer.putInt32(int32NegativeBE, true);
			buffer.getInt32(true).should.equal(int32NegativeBE);
		});
	});

	describe('#getString()', function() {
		it('should get string from buffer', function() {
			string = 'Test Buffer ***ąę';
			stringBuffer = new Buffer(string, 'utf8');
			buffer = new MsgBuffer(stringBuffer);
			buffer.getString(-1, 'utf8').should.equal(string);

			buffer.resetPosition();
			buffer.getString(stringBuffer.bytesLength, 'utf8').should.equal(string);
		});
	});
});