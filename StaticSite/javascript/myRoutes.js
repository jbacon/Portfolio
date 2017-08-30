var router = new Router()
router.register(/\//, function() { // Matching just / or nothing: /(^$|^\/)$/g
	loadMainContent('/templates/welcome.html');
});
router.register(/\/about-me/, function() {
	loadMainContent('/templates/about.html');
});
router.register(/\/contact-me/, function() {
	loadMainContent('/templates/contact.html')
});
router.register(/\/photo-gallery/, function() {
	loadMainContent('/templates/photos.html')
});
router.register(/\/articles/, function() {
	loadMainContent('/templates/articles.html');
});
router.register(/\/articles\/(.*)\//, function() {

});
router.register('/login', function() {
	importHtml('/templates/login.html', (err, newDoc) => {
		const navBarItemLogin = document.getElementById('login')
		if(navBarItemLogin.lastElementChild.childElementCount === 0) {
			const newLoginContent = document.createElement('div')
			newLoginContent.slot='content'
			const newContent = document.importNode(newDoc.querySelector('template').content, true)
			newLoginContent.appendChild(newContent)
			navBarItemLogin.lastElementChild.replaceWith(newLoginContent)
		}
		if(!navBarItemLogin.open) {
			navBarItemLogin.firstElementChild.click();
		}
	});
});
router.register('/logout', function() {
	delete window.portfolio.token
	delete window.localStorage.token
	FB.getLoginStatus(function(response) {
	    if (response.status === 'connected') {
			FB.logout(function(response) {
				window.location.href = '/';
			});
		} else {
	    	window.location.href = '/';
	    }
    });
});
router.register('/register', function() {
	importHtml('/templates/register.html', (err, newDoc) => {
		const navBarItemRegister = document.getElementById('register')
		if(navBarItemRegister.lastElementChild.childElementCount === 0) {
			const newRegisterContent = document.createElement('div')
			newRegisterContent.slot='content'
			const newContent = document.importNode(newDoc.querySelector('template').content, true)
			newRegisterContent.appendChild(newContent)
			navBarItemRegister.lastElementChild.replaceWith(newRegisterContent)
		}
		if(!navBarItemRegister.open) {
			navBarItemRegister.firstElementChild.click();
		}
	});
});
router.register('/account', function() {
	importHtml('/templates/account.html', (err, newDoc) => {
		const navBarItemAccount = document.getElementById('account')
		if(navBarItemAccount.lastElementChild.childElementCount === 0) {
			const newAccountContent = document.createElement('div')
			newAccountContent.slot='content'
			const newContent = document.importNode(newDoc.querySelector('template').content, true)
			newAccountContent.appendChild(newContent)
			navBarItemAccount.lastElementChild.replaceWith(newAccountContent)
		}
		if(!navBarItemAccount.open) {
			navBarItemAccount.firstElementChild.click();
		}
	});
});
router.register('/auth/facebook/callback', function() {
	var fragment = window.location.hash.slice(1)
	getAuthenticatedViaFacebook(fragment)
});
router.register('/auth/local/token', function() {
	var fragment = window.location.hash.slice(1)
	const dataStringDecoded = decodeURIComponent(fragment)
	const dataJson = JSON.parse(dataStringDecoded)
	getAuthenticatedViaLocal(dataJson.token)
});
router.register('/auth/register/callback', function() {
	const searchString = window.location.search;
	const searchStringDecoded = decodeURIComponent(searchString)
	const searchParams = new URLSearchParams(searchStringDecoded);
	const token = searchParams.get('token');
	const tokenJSON = JSON.parse(token);
	getAuthenticatedViaRegistration(tokenJSON)
});
router.register('/auth/google/token', function() {
	var fragment = window.location.hash.slice(1)
	getAuthenticatedViaGoogle(fragment)
});
router.route(window.location.pathname)