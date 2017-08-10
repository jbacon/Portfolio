/*
LOAD DEPENDENCIES ASYNC
*/
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
/*
GET SERVER ADDRESS - Examine location origin to dynamically determine environment/server-address
*/
var API_SERVER_ADDRESS = function() {
	if(location.origin.includes('localhost')) {
		// ASSUME DEV MODE
		return 'http://localhost:8080'
	}
	else {
		//ASSUME PROD MODE
		return 'https://portfolioapi.joshbacon.name'
	}
}
/*
HANDLE URL FRAGMENT
Scenarios:
1. forgot-password-callback - Contains token for temporary session so user can reset password.
2. registration-callback - Contains token for temporary session to 
3. achors - Determines page 
4. facebook-callback - Contains token for facebook authentication
	 	When page is loaded via a redirect from an OAuth2 Server, the URL fragment will
		contain an access_token (Implicit Grant Authentication Flow).
		This access_token needs to be parsed out of the URL fragment and sent to my API server,
		so that it can verify the token, respond with the corresponding User account, and
		then return it's own signed JWT token...
		Subsequent request to the API server authenticate using this new JWT token 
		(NOT the original external OAuth2 access_token).
		This design decision intends to reduce authentication complexity, but using a single
		JWT middleware to verify API calls, instead of relying upon switching between many
		different auth flows which inherently occurs while using passportjs middlware
		(e.i. via facebook, google, twitter, etc..).
*/
if(window.location.hash) {
	var fragment = window.location.hash.slice(1)
	if(fragment.includes('access_token') && fragment.includes('expires_in')) {
		getAuthenticatedViaFacebook(fragment)
	}
	else if(fragment.startsWith('forgot-password-callback?')) {
		const dataStringEncoded = fragment.substr('forgot-password-callback?'.length)
		const dataStringDecoded = decodeURIComponent(dataStringEncoded)
		const dataJson = JSON.parse(dataStringDecoded)
		getAuthenticatedViaEmail(dataJson.token)
	}
	else if(fragment.startsWith('registration-callback?')) {
		const dataStringEncoded = fragment.substr('registration-callback?'.length)
		const dataStringDecoded = decodeURIComponent(dataStringEncoded)
		const dataJson = JSON.parse(dataStringDecoded)
		authViaRegistrationToken(dataJson.token)
	}
	else {
		document.body.classList.remove('hidden')
	}
	history.pushState("", document.title, window.location.pathname + window.location.search);
}
else {
	document.body.classList.remove('hidden')
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
			if(!hasUserSession()) {
	    		/* Facebook Session exists but no API Server Session.
	    			Create new API Server Session */
				getAuthenticatedViaFacebook('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
			}
			else {
				const session = getUserSession()
				/* Both Facebook Session & API Server Session exit. */
				if(session.user.facebookProfileID !== response.authResponse.userID) {
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
/*
USER U.I. ALTERATIONS
*/
if(hasUserSession()) {
	var session = getUserSession()
	document.querySelector('#logout').classList.remove('hidden')
	document.querySelector('#login-link').classList.add('hidden')
	document.querySelector('#register').classList.add('hidden')
	document.querySelector('#greeting').classList.remove('hidden')
	document.querySelector('#greeting').innerHTML = 'Welcome, '+session.user.nameFirst+' '+session.user.nameLast
	document.querySelector('#my-account').classList.remove('hidden')
	
	window.customElements.define('my-account', MyMyAccountComponent)
	const myMyAccountObject = new MyMyAccountComponent({ 
		account: session.user
	});
	const myAccountModalBoxContent = document.querySelector('#my-account-popup .modal-box__content')
	myAccountModalBoxContent.insertAdjacentElement('beforeend', myMyAccountObject)
}
/*
INITIALIZE COMMENT SECTION -> With dummy comment
*/
window.customElements.define('my-comment', MyCommentComponent)
const dummyComment = {
	_id: null,
	accountID: null,
	articleID: document.getElementById('article-header').dataset.articleId,
	parentCommentID: null,
	upVoteAccountIDs: [ ],
	downVoteAccountIDs: [ ],
	text: 'Comment Section',
	facebookProfileID: null,
	flags: [ ],
	childCommentIDs: [ 'dummy-placeholder' ]
}
const myCommentObject = new MyCommentComponent({ 
	comment: dummyComment, 
	currentUserID: (hasUserSession() && getUserSession().user._id) ? getUserSession().user._id : undefined,
	isAdmin: (hasUserSession() && getUserSession().user.isAdmin) ? true : false
});
myCommentObject.shadowRoot.querySelector('#remove-button').classList.add('hidden')
myCommentObject.shadowRoot.querySelector('#flag-button').classList.add('hidden')
myCommentObject.shadowRoot.querySelector('#up-vote-button').classList.add('hidden')
myCommentObject.shadowRoot.querySelector('#up-vote-count').classList.add('hidden')
myCommentObject.shadowRoot.querySelector('#down-vote-button').classList.add('hidden')
myCommentObject.shadowRoot.querySelector('#down-vote-count').classList.add('hidden')
const commentsElement = document.getElementById('comments')
commentsElement.insertAdjacentElement('beforeend', myCommentObject)

/*
LOGIN 
*/
document.getElementById('login-link-2').addEventListener('click', function(event) {
	document.getElementById('login-dialog').showModal()
});
document.getElementById('login-dialog-close').addEventListener('cancel', function(event) {
	document.getElementById('login-dialog').close()
});
document.getElementById('login-link').addEventListener('mouseup', function(event) {
	var emailInput = document.querySelector('#login-form input.email')
    emailInput.focus();
});
document.getElementById('login-form').addEventListener('submit', function(event) {
	getAuthenticatedViaLocal({
		username: event.target.elements.namedItem('email').value,
		password: event.target.elements.namedItem('password').value
	})
});
/* FORGOT PASSWORD */
// document.getElementById('forgot-password-link').addEventListener('mouseup', function(event) {
// 	var emailInput = document.querySelector('#forgot-password-form input.email')
//     emailInput.focus();
// })
document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
	getAuthenticatedViaLocal({
		username: event.target.elements.namedItem('email').value,
		password: event.target.elements.namedItem('password').value
	})
	event.preventDefault();
	const email = event.target.elements.namedItem('email').value
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/email/send?email='+encodeURIComponent(email));
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				alert('Check Email for Temporary Login Link!')
			}
			else {
				handleServerErrorResponse(response)
			}
		}
	}
	httpClient.send();
})
document.getElementById('facebook-login-form').addEventListener('submit', function(event) {
	event.preventDefault();
	var clientId = '144772189413167'
	var redirectUrl = location.origin+''
	var facebookUrl = 'https://www.facebook.com/v2.9/dialog/oauth'
		+'?client_id='+clientId
		+'&redirect_uri='+redirectUrl
		+'&response_type=token'
		+'&scope=public_profile,email,user_friends'
	window.location.href = facebookUrl
});
/*
REGISTRATION FORM 
*/
document.getElementById('register-form').addEventListener('submit', function(event) {
	event.preventDefault();
	const httpClient = new XMLHttpRequest();
	httpClient.open('POST', API_SERVER_ADDRESS()+'/auth/register');
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				alert('Thanks for registering! To activate your account continue registration steps in the verification email that has been sent to your address.')
			}
			else {
				handleServerErrorResponse(response)
			}
		}
	}
	const jsonData = {}
	for(var i = 0; i < event.target.length - 1; i++) {
		jsonData[event.target.elements[i].name] = event.target.elements[i].value;
	}
	const dataString = JSON.stringify(jsonData)
	httpClient.send(dataString);
})
document.getElementById('logout').addEventListener('click', function(event) {
	deleteUserSession()
	FB.getLoginStatus(function(response) {
	    if (response.status === 'connected') {
			FB.logout(function(response) {
				window.location.href = '/';
			});
		} else {
			window.location.href = '/';
	    }
    });
})
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
function getAuthenticatedViaEmail(email_access_token) {
	getAuthenticated('/auth/email/token?'+email_access_token)
}
function getAuthenticatedViaLocal({ username, password }={}) {
	const email = event.target.elements.namedItem('email').value
	const password = event.target.elements.namedItem('password').value
	getAuthenticated('/auth/local/token?email='+encodeURIComponent(email)+'&password='+encodeURIComponent(password))
}
function getAuthenticatedViaRegistration() {
	
}
function getAuthenticated(rest_api_path) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', API_SERVER_ADDRESS()+rest_api_path);
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				setUserSession({
					token: response.token,
					expiration: response.expiration,
					user: response.user
				})
				window.location.href = '/';
			}
			else {
				handleServerErrorResponse(response)
			}
		}
	}
	httpClient.send();
}
function hasUserSession() {
	if(window.localStorage.token
		&& window.localStorage.expiration
		&& window.localStorage.user
		&& Number(window.localStorage.expiration) > Math.floor(Date.now() / 1000)) {
		return true
	}
	return false
}
function getUserSession() {
	if(hasUserSession()) {
		const session = {
			token: window.localStorage.token,
			expiration: window.localStorage.tokenExpiration,
			user: JSON.parse(window.localStorage.user)
		}
		return session
	}
	return null
}
function setUserSession({ token, expiration, user }={}) {
	window.localStorage.token = token;
	window.localStorage.expiration = expiration;
	window.localStorage.user = JSON.stringify(user);
}
function deleteUserSession() {
	delete window.localStorage.token;
	delete window.localStorage.expiration
	delete window.localStorage.user;
}

/* Features of Auth Pattern:
token
api path

*/