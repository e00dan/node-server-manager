function Player(name, level) {
	this.Name 	= typeof name !== 'undefined' ? name : ''; // ASCII string
	this.Level 	= typeof level !== 'undefined' ? level : ''; // int32
}
module.exports = Player;