module.exports = function(serverInfo) {
	data = serverInfo.tsqp;

	this.getUptime = function() {
		seconds = data['serverinfo'][0]['$']['uptime'];
		hours = Math.floor(seconds / 3600);
		seconds = seconds - (hours * 3600);
		mins = Math.floor(seconds / 60);
		seconds = seconds - (mins * 60);

		return { hours: hours, minutes: mins, seconds: seconds };
	}
}