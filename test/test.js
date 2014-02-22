var should = require('should'), MsgBuffer = require('../MsgBuffer.js');

describe('MsgBuffer', function() {
	describe('#verifyNextByte', function() {
		it('should return true when next byte is exactly the same', function() {
			var msgBuffer = new MsgBuffer(new Buffer([0x00, 0x01, 0x02]));
			msgBuffer.verifyNextByte(0x00).should.equal(true);
			msgBuffer.verifyNextByte(0x01).should.equal(true);
			msgBuffer.verifyNextByte(0x01).should.equal(false);
		});
	});
});

describe('MsgBuffer', function() {
	describe('loadBytes', function() {
		it('should should merge buffers when stored', function() {
			var bufferOne = new MsgBuffer([0x00, 0x01]);
			var bufferTwo = new Buffer([0x02, 0x03, 0x04]);
			bufferOne.getLength().should.equal(2);

			bufferOne.storeBuffer(bufferTwo);
			bufferOne.loadBytes();
			bufferOne.getLength().should.equal(5);
		});
	});
});