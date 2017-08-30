/* CONFIG */
(function() {
	window.portfolio = {}
	if(location.origin.includes('localhost')) {
		// ASSUME DEV MODE
		window.portfolio.apiServerAddress = 'http://localhost:8080'
	}
	else {
		//ASSUME PROD MODE
		window.portfolio.apiServerAddress = 'https://portfolioapi.joshbacon.name'
	}
	if(window.localStorage.token) {
		const tokenSplit = window.localStorage.token.split(".")
		window.portfolio.token = {}
		window.portfolio.token.header = JSON.parse(atob(tokenSplit[0]))
		window.portfolio.token.payload = JSON.parse(atob(tokenSplit[1]))
		window.portfolio.token.signature = tokenSplit[2]
		if(window.portfolio.token.payload.exp < Math.floor(Date.now() / 1000)) {
			delete window.localStorage.token
			delete window.portfolio.token
		}
	}
}());

const commentsSection			= document.getElementById('comments-section')
const commentPlaceholder 		= document.getElementById('comment-placeholder')

if(window.portfolio.token) {
	document.getElementById('logout').classList.remove('hidden')
	document.getElementById('login').classList.add('hidden')
	document.getElementById('register').classList.add('hidden')
	document.getElementById('greeting').innerText = 
		'Welcome, '+window.portfolio.token.payload.data.nameFirst+' '+window.portfolio.token.payload.data.nameLast
	document.getElementById('greeting').classList.remove('hidden')
	document.getElementById('account').classList.remove('hidden')
	commentPlaceholder.currentUserID = window.portfolio.token.payload.data._id
	commentPlaceholder.isAdmin = window.portfolio.token.payload.data.isAdmin
}
commentPlaceholder.shadowRoot.getElementById('remove-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('flag-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('up-vote-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('up-vote-count').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('down-vote-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('down-vote-count').classList.add('hidden')

function loadMainContent(href, done) {
	importHtml(href, (err, newDoc) => {
		const newMainContent = document.createElement("div"); 
		newMainContent.id='main-content'
		const newContent = document.importNode(newDoc.querySelector('template').content, true)
		newMainContent.appendChild(newContent)
		document.getElementById('main-content').replaceWith(newMainContent)
		if(done) done(null)
	});
}
/* Using HTML Imports, dynamically insert an import link (if does not exist).
Once loaded pass imported document into provided callback function.
Link element id is generated using provided href */
function importHtml(href, done) {
	var id = href.replace('[^A-Za-z0-9]', '-')
	var link = document.getElementById(id)
	if(link) {
		if(done) done(null, link.import);
	}
	else {
		link = document.createElement('link')
		link.id = id
		link.rel = 'import'
		link.href = href
		link.setAttribute('async', '')
		link.onload = function() {
			if(done) done(null, link.import);
		}
		link.onerror = function() {
			if(done) done('Something went wrong')
		}
		document.head.appendChild(link);
	}
}


window.fbAsyncInit = function() {
    FB.init({
        appId            : '144772189413167',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.10',
        cookie           : false
    });
    FB.AppEvents.logPageView();
    // Check for Login Status. 
    fbCheckLoginStatus()
	FB.Event.subscribe('auth.login', function(response) {
		getAuthenticatedViaFacebook('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
	});
};
function fbCheckLoginStatus() {
	FB.getLoginStatus(function(response) {
	    if (response.status === 'connected') {
			if(!window.portfolio.token) {
	    		/* Facebook Session exists but no API Server Session.
	    			Create new API Server Session */
				getAuthenticatedViaFacebook('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
			}
			else {
				/* Both Facebook Session & API Server Session exit. */
				if(window.portfolio.token.payload.data.facebookProfileID !== response.authResponse.userID) {
					/* If mismatch profile prefer Facebook Session.
						Reauthenticate w/ API Server */
					getAuthenticatedViaFacebook('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
				}
				else {
					// Do nothing..
				}
			}
		} else {
	        // Do nothing...
	    }
    });
}
function handleServerErrorResponse(response) {
	if(response)
		alert(response.status+' - '+response.message+'. '+((response.stack) ? response.stack : ''));
	else
		alert('Something went wrong!')
}
function getAuthenticatedViaGoogle(google_access_token) {
	getAuthenticated('/auth/google/token?'+google_access_token)
}
function getAuthenticatedViaFacebook(facebook_access_token) {
	getAuthenticated('/auth/facebook/token?'+facebook_access_token)
}
function getAuthenticatedViaLocal(local_access_token) {
	getAuthenticated('/auth/local/token?'+local_access_token)
}
function getAuthenticatedViaCredentials({ email, password }={}) {
	getAuthenticated('/auth/local/credentials?email='+encodeURIComponent(email)+'&password='+encodeURIComponent(password))
}
function getAuthenticatedViaRegistration(registration_token) {
	getAuthenticated('/auth/register/callback?token='+encodeURIComponent(registration_token))
}
function getAuthenticatedViaEmail(email_token) {
	getAuthenticated('/auth/email/callback?token='+encodeURIComponent(email_token))
}
function getAuthenticated(rest_api_path, callback) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', window.portfolio.apiServerAddress+rest_api_path);
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if(this.status === 200) {
				const responseJSON = JSON.parse(this.response)
				const token = responseJSON.token
				window.localStorage.token = token
				window.location.href = '/';
			}
			else {
				handleServerErrorResponse(this.response)
			}
		}
	}
	httpClient.send();
}