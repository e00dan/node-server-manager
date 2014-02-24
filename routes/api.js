var validator = require('validator'), Status = require('.././Status'), ServerInfo = require('.././ServerInfo');

exports.features = {
	serverStatus: function(req, res) {
		if(!req.params.ip || !req.params.port || !(validator.isIP(req.params.ip) || (validator.isLength(req.params.ip, 2, 30) && validator.contains(req.params.ip, '.'))) || !(validator.isInt(req.params.port) && req.params.port <= 65535))
			res.send('You have to specify valid IP address and port.');
		else {
			ip = validator.blacklist(req.params.ip, '<>$');
			message = 'Get Server Status for server with IP: ' + ip + ' and PORT: ' + req.params.port + '.<br/>';

			var status = new Status(ip, req.params.port);

			status.on('serverInfo', function(serverInfo) {
				var info = new ServerInfo(serverInfo);
				var uptime = info.getUptime();

				res.send(message + 'Server status: Online<br/>' +
					'Uptime: ' + uptime.hours + ' hours, ' + uptime.minutes + ' minutes and ' + uptime.seconds + ' seconds<br/>' +
					'<br/>');
			});

			status.getServerInfo();
		}
	}
}