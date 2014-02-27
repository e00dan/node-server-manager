
/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('layout', {
		title: 'Node Server Manager',
		activeNav: '/',
		partials : {
			content: 'about',
			script: 'about_script'
		}
	});
};