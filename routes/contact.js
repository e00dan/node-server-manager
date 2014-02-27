
/*
 * GET contact.
 */

exports.get = function(req, res) {
	res.render('layout', {
		title: 'Contact',
		activeNav: 'contact',
		partials : {
			content: 'contact',
			script: 'contact_script'
		}
	});
};