
/*
 * GET features.
 */

exports.get = function(req, res) {
	params = {
		title: 'Features',
		activeNav: 'features',
		partials : {
			content: 'features',
			script: 'features_script'
		}
	}
	switch(req.params.name) {
		case 'get-server-status':
			params.active = 'Get Server Status';
			params.prefix = '../';
			params.partials.feature_module = '/features/get-server-status';
			break;
		case 'get-online-players':
			params.active = 'Get Online Players';
			params.prefix = '../';
			params.partials.feature_module = '/features/get-online-players';
			break;
		case 'get-player-status':
			params.active = 'Get Player Status';
			params.prefix = '../';
			params.partials.feature_module = '/features/get-player-status';
			break;
		default:
			params.prefix = '../';
			break;
	}
	res.render('layout', params);
};