/* CONFIG */
var config = {
	killNodeProcesses : true,
	httpServer : true,
	enableOOP : true,
	port: 7777,
	debug: true // unused
}
/* CONFIG --END */


/* REQUIRE */
var Status = require('./Status.js'), ServerInfo = require('./ServerInfo.js'),
	express = require('express'), app = express(), cons = require('consolidate'), routes = require('./routes'),
	verbose = process.env.NODE_ENV != 'test';
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

app.map = function(a, route){
	route = route || '';
	for (var key in a) {
		switch (typeof a[key]) {
			// { '/path': { ... }}
			case 'object':
				app.map(a[key], route + key);
				break;
			// get: function(){ ... }
			case 'function':
				if (verbose) console.log('%s %s', key, route);
				app[key](route, a[key]);
				break;
		}
	}
};
/* PM --END */

/* HTTP */

exports = module.exports = app;

app.set('port', process.env.PORT || 3000);
app.set('views', './views');
app.use(express.compress());
app.use(express.static(__dirname + '/public'));

app.engine('hbs', cons.handlebars);
app.set('view engine', 'hbs');
app.set('view options', { layout: true });

features = require('./routes/features');
contact = require('./routes/contact');
api = require('./routes/api');

if(verbose)
	console.log('--/ Router Map \\--');
app.map({
	'/' : {
		get: routes.index
	},
	'/features' : {
		get: features.get
	},
	'/contact' : {
		get: contact.get
	},
	'/api' : {
		'/features' : {
			'/get' : {
				'/server-status' : {
					get: api.features.serverStatus,
					'/:ip' : {
						get: api.features.serverStatus,
						'/:port' : {
							get: api.features.serverStatus
						}
					}
				}
			}
		}
	}
});
if(verbose)
	console.log('------------------');

http.createServer(app).listen(app.get('port'), function() {
	if(verbose)
		console.log('Express server listening on port ' + app.get('port'));
});

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
			if(response.post.ip != null && response.post.port != null) {
				if('getOnlinePlayers' in response.post) {
					console.log('Request: Get Online Players.');
					console.time("dbsave"); // start timer

					var status = new Status(response.post.ip, response.post.port);

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
				} else if('getPlayerInfo' in response.post && response.post.playerName != null) {
					console.log('Request: Get Player Info.');

					var status = new Status(response.post.ip, response.post.port);
					status.getPlayerInfo(response.post.playerName);
				} else
					console.log('Undefined request.');
			}
        });
	} else {
		response.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
		response.end('<html>' +
			'<form action="/" method="post">' +
				'<input type="text" name="ip" placeholder="Server IP..."/>' +
				'<input type="number" name="port" placeholder="Server Port..."/>' +
				'<button type="submit" name="getOnlinePlayers">Get Online Players List</button>' +
				'<br/>' +
				'<input type="text" name="playerName" placeholder="Player\'s name..."/> ' +
				'<button type="submit" name="getPlayerInfo">Get Player Info</button>' +
			'</form>' +
		'</html>');
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
