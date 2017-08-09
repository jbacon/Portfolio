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
Examples:
1. 	When page is loaded via a redirect from an OAuth2 Server, the URL fragment will
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
2. 	Back-Button to navigate to various content areas/anchors.
*/
if(window.location.hash) {
	var fragment = window.location.hash.slice(1)
	if(fragment.includes('access_token') && fragment.includes('expires_in')) {
		//fragment
		authViaFacebookToken(fragment)
	}
	else if(fragment.startsWith('forgot-password-callback?')) {
		const dataStringEncoded = fragment.substr('forgot-password-callback?'.length)
		const dataStringDecoded = decodeURIComponent(dataStringEncoded)
		const dataJson = JSON.parse(dataStringDecoded)
		authViaEmailToken(dataJson.token)
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
    FB.getLoginStatus(function(response) {
	    console.log(response);
	    if (response.status === 'connected') {
	    	// Facebook User Currently Authenticated.
	    	// Now Authenticate with API Server.
			if(!hasUserSession()) {
				authViaFacebookToken('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
			}
		} else {
	        // Not logged into your app or unable to tell.
	    }
    });
};
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
document.getElementById('login-link').addEventListener('mouseup', function(event) {
	var emailInput = document.querySelector('#login-form input.email')
    emailInput.focus();
});
document.getElementById('login-form').addEventListener('submit', function(event) {
	authViaLocalPassword({
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
	authViaLocalPassword({
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
				window.location.href = '/';
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
	window.location.href = '/';
})
function handleServerAuthResponse(response) {
	createUserSession({
		token: response.token,
		expiration: response.expiration,
		user: response.user
	})
	window.location.href = '/';
}
function handleServerErrorResponse(response) {
	if(response)
		alert(response.status+' - '+response.message+'. '+((response.stack) ? response.stack : ''));
	else
		alert('Something went wrong!')
}
function authViaGoogleToken(google_access_token) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/facebook/token?'+facebook_access_token);
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				handleServerAuthResponse(response)
			}
			else {
				handleServerErrorResponse(response)
			}
			ready()
		}
	}
	httpClient.send();
}
/*
GET AUTHENTICATION JWT via FACEBOOK - Get api server auth token by verifying facebook's token
*/
function authViaFacebookToken(facebook_access_token) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/facebook/token?'+facebook_access_token);
	// httpClient.setRequestHeader("Bearer", facebook_access_token)
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				handleServerAuthResponse(response)
			}
			else {
				handleServerErrorResponse(response)
			}
			ready()
		}
	}
	httpClient.send();
}
/*
GET AUTHENTICATION JWT via EMAIL - Get api server auth token by verifying email's token
*/
function authViaEmailToken(email_access_token) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/email/token?'+email_access_token);
	// httpClient.setRequestHeader("Bearer", facebook_access_token)
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				handleServerAuthResponse(response)
			}
			else {
				handleServerErrorResponse(response)
			}
			ready()
		}
	}
	httpClient.send();
}
/*
GET AUTHENTICATION JWT via LOCAL CREDENTIALS - Get api server auth token by verifying credentials
*/
function authViaLocalPassword({ username, password }={}) {
	event.preventDefault();
	const httpClient = new XMLHttpRequest();
	const email = event.target.elements.namedItem('email').value
	const password = event.target.elements.namedItem('password').value
	httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/local/token?email='+encodeURIComponent(email)+'&password='+encodeURIComponent(password));
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				handleServerAuthResponse(response)
			}
			else {
				handleServerErrorResponse(response)
			}
		}
	}
	httpClient.send()
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
		return {
			token: window.localStorage.token,
			expiration: window.localStorage.tokenExpiration,
			user: JSON.parse(window.localStorage.user)
		}
	}
	return null
}
function createUserSession({ token, expiration, user }={}) {
	window.localStorage.token = token;
	window.localStorage.expiration = expiration;
	window.localStorage.user = JSON.stringify(user);
}
function deleteUserSession() {
	delete window.localStorage.token;
	delete window.localStorage.expiration
	delete window.localStorage.user;
}