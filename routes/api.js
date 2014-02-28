var validator = require('validator'),
	Status = require('.././Status'),
	ServerInfo = require('.././ServerInfo');

function validateAddress(ip, port) {
	return (!ip || !port || !(validator.isIP(ip) || (validator.isLength(ip, 2, 30) && validator.contains(ip, '.'))) || !(validator.isInt(port) && port <= 65535));
}

exports.features = {
	serverStatus: function(req, res) {
		if(validateAddress(req.params.ip, req.params.port))
			res.send('<span class="label label-danger">You have to specify valid IP address and port.</span>');
		else {
			ip = validator.blacklist(req.params.ip, '<>$');
			message = 'Get Server Status for server with IP: ' + ip + ' and PORT: ' + req.params.port + '.<br/>';

			var status = new Status(ip, req.params.port);

			status.on('serverInfo', function(serverInfo) {
				var info = new ServerInfo(serverInfo);
				var uptime = info.getUptime();

				res.send(message + 'Server status: <span class="label label-success">Online</span><br/>' +
					'Uptime: ' + uptime.hours + ' hours, ' + uptime.minutes + ' minutes and ' + uptime.seconds + ' seconds<br/>' +
					'<br/>');

				status.removeAllListeners('error');
			});

			status.on('error', function(err) {
				errorMsg = 'Error: ';
				if(err.code == 'ECONNREFUSED')
					errorMsg += 'Connection refused.';
				else if(err.code == 'ECONNLOST')
					errorMsg += 'Connection lost. Maybe server status delay is active.';
				res.send(message + '<span class="label label-danger">' + errorMsg + '</span>');
			});

			status.getServerInfo();
		}
	},
	onlinePlayers: function(req, res) {
		responseSend = false;
		if(validateAddress(req.params.ip, req.params.port))
			res.send('<span class="label label-danger">You have to specify valid IP address and port.</span>');
		else {
			ip = validator.blacklist(req.params.ip, '<>$');
			message = 'Get Online Players for server with IP: ' + ip + ' and PORT: ' + req.params.port + '.<br/>';

			var status = new Status(ip, req.params.port);

			status.on('players', function() {
				content = '<table><thead><th>Number</th><th>Nick</th><th>Level</th></thead><tbody>';
				content += 'There are <b>' + status.PlayersList.length + '</b> online players.<br/>';

				status.PlayersList.sort(function(a, b) {
					return a.Level < b.Level;
				});
				var i = 0;
				status.PlayersList.map(function (p) {
					i++;
					content += '<tr><td>' + i + '.</td><td>' + p.Name + '</td><td>' + p.Level + '</td>';
				});

				content += '</tbody></table>';
				res.send(content);

				responseSend = true;
			});

			status.on('error', function(err) {
				if(!responseSend) {
					errorMsg = 'Error: ';
					if(err.code == 'ECONNREFUSED')
						errorMsg += 'Connection refused.';
					else if(err.code == 'ECONNLOST')
						errorMsg += 'Connection lost. Maybe server status delay is active.';
					res.send(message + '<span class="label label-danger">' + errorMsg + '</span>');
				}
			});

			status.getOnlinePlayers();
		}
	}
}