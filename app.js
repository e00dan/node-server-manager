/* CONFIG */
var config = {
	killNodeProcesses : true,
	httpServer : true,
	enableOOP : true,
	port: 7777,
	debug: true // unused
}
/* CONFIG --END */

/* STARTUP */
console.log('[STARTUP][Info]: Current process: { PID: ' + process.pid + ', TITLE: ' + process.title + ' }');
console.log('[STARTUP][Info]: Config: ', config);
/* STARTUP --END */

/* REQUIRE */
var net = require('net'), util = require('util'), events = require('events'), MsgBuffer = require('./MsgBuffer.js'),
	Communication = require('./Communication.js'), Status = require('./Status.js');
if(config.killNodeProcesses)
	var exec 		= require('child_process').exec;
if(config.httpServer) {
	var http 		= require('http'),
		querystring = require('querystring');
}
/* REQUIRE --END */

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
				if('getOnlinePlayers' in response.post) {
					console.log('Request: Get Online Players.');
					console.time("dbsave"); // start timer

					var status = new Status(response.post.ip, 7171);

					status.on('players', function () {
						var content = '<table><thead><th>Numer</th><th>Nick</th><th>Level</th></thead><tbody>';
						content += 'On server with IP: `' + response.post.ip + '` there are <b>' + status.PlayersList.length + '</b> players.<br/>';

						var i = 0;
						status.PlayersList.map(function (p) {
							i++;
							content += '<tr><td>' + i + '.</td><td>' + p.Name + '</td><td>' + p.Level + '</td>';
						});
						console.timeEnd("dbsave"); // end timer
						response.writeHead(200, "OK", {'Content-Type': 'text/html; charset=utf-8'});
						response.end(content + '</tbody></table>');
					});
					status.getOnlinePlayers();
				} else if('getServerInfo' in response.post) {
					console.log('Request: Get Server Info.');
					console.time("dbsave"); // start timer
					var status = new Status(response.post.ip, 7171);

					status.on('serverInfo', function(serverInfo) {
						console.log(serverInfo);
						console.timeEnd("dbsave"); // end timer
						response.writeHead(200, "OK", {'Content-Type': 'text/html; charset=utf-8'});
						response.end('Server info looged in the console.' + '</tbody></table>');
					});

					status.getServerInfo();

				}
			}

        });
	} else {
		response.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
		response.end('<html><form action="/" method="post"><input type="text" name="ip" placeholder="Server IP..."></input><button type="submit" name="getOnlinePlayers">Get Online Players List</button><button type="submit" name="getServerInfo">Get Server Info</button></form></html>');
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
httpServer.listen(config.port);
/* HTTP -- END */
