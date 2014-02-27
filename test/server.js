var request = require('supertest'),
	app = require('../app.js'),
	should = require('should');

describe('Server', function() {
	describe('GET /', function() {
		it('should respond with page', function(done) {
			request(app)
				.get('/')
				.expect('X-Powered-By', 'Express')
				.end(function(err, res) {
					if(err)
						throw err;
					res.should.have.status(200);
					res.body.should.not.equal(null);
					done();
				});
		});
	});
});