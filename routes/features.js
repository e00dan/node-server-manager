
/*
 * GET features.
 */

exports.get = function(req, res) {
	res.render('layout', {
		title: 'Features',
		activeNav: 'features',
		partials : {
			content: 'features'
		}
	});
};