const ADMIN_EMAIL = 'jbacon@zagmail.gonzaga.edu'
const PAGE_SIZE=5
const API_SERVER_ADDRESS = 'https://portfolioapi.joshbacon.name'

/* URL FRAGMENT ANALYSIS
Parse URL fragment...
Use-Case:
	Redirects back from an OAuth 2 Authentication Server (Implicit Grant Flow) contain URL fragments containing an access_token
 	This URL fragment token is only visible to the browser and the back-end API server has yet to 
	have a chance to verify the token.
	The access_token needs to be parsed and sent to back-end API server so it can 
	verify & return more detailed Account information and return a new signed JWT token,
	The responding JWT token is used in all subsequent requests (NOT the original OAuth2 token!).
	This is a design choice in order to reduce authentication complexity by using a single authentication flow (JWT), 
	instead of supporting potentially many different auth flows for each passportjs middleware.
*/
var fragment = window.location.hash.slice(1)
if(fragment) {
	// Catagorize Fragment Data...
	if(fragment.includes('access_token') && fragment.includes('expires_in')) {
		// FACEBOOK REDIRECT...
		// Make API call to verify access_token & generate a JWT token for subsequent requests...
		const httpClient = new XMLHttpRequest();
		httpClient.open('GET', 'https://portfolioapi.joshbacon.name/auth/facebook/token?'+fragment);
		httpClient.setRequestHeader("Content-Type", "application/json");
		httpClient.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					// Store JWT for future API call authentication...
					// localStorage allows multiple windows open to still have access to token,
					// sessionStorage would require login from multiple tabs/windows.
					window.localStorage.token = response.token;
					window.localStorage.tokenExpiration = response.expiration;
					window.localStorage.user = JSON.stringify(response.user);
				}
				else {
					deleteUserSession()
					handleServerErrorResponse('Facebook Authentication Failed.', response)
				}
				ready();
			}
		}
		httpClient.send();
		window.location.hash = undefined
	}
	else {
		ready();
	}
	history.pushState("", document.title, window.location.pathname + window.location.search);
}
else {
	ready();
}
function ready() {
	// Check if Logged in... via valid token
	const currentTime = Math.floor(Date.now() / 1000)
	if(window.localStorage.token
		&& window.localStorage.tokenExpiration
		&& window.localStorage.user
		&& currentTime < Number(window.localStorage.tokenExpiration)) {
		//Adjust U.I.
		document.querySelector('#logout').classList.remove('hidden')
		document.querySelector('#login').classList.add('hidden')
		document.querySelector('#register').classList.add('hidden')
		document.querySelector('#greeting').classList.remove('hidden')
		const user = JSON.parse(window.localStorage.user)
		document.querySelector('#greeting').innerHTML = 'Welcome, '+user.nameFirst+' '+user.nameLast
	}
	else {
		document.querySelector('#greeting').innerHTML = ''
		document.querySelector('#greeting').classList.add('hidden')
		document.querySelector('#logout').classList.add('hidden')
		document.querySelector('#login').classList.remove('hidden')
		document.querySelector('#register').classList.remove('hidden')
		deleteUserSession()
	}
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
	const myCommentObject = new MyCommentComponent(dummyComment)
	// myCommentObject.removed = 'false'
	// myCommentObject.repliesDisplay = 'enabled'
	// myCommentObject.replyDisplay = ''
	myCommentObject.flagDisplay = 'hidden'
	myCommentObject.voteDisplay = 'hidden'
	myCommentObject.removeDisplay = 'hidden'
	const commentsElement = document.getElementById('comments')
	commentsElement.insertAdjacentElement('beforeend', myCommentObject)
	document.getElementById('local-login-form').addEventListener('submit', function(event) {
		event.preventDefault();
		const httpClient = new XMLHttpRequest();
		httpClient.open('GET', 'https://portfolioapi.joshbacon.name/auth/local/token');
		httpClient.setRequestHeader("Content-Type", "application/json");
		httpClient.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					// Store JWT token
					// Refresh U.I. based on login
					window.localStorage.token = response.token;
					window.localStorage.tokenExpiration = response.expiration;
					window.localStorage.user = response.user;
					window.location.href = '/';
				}
				else {
					deleteUserSession()
					handleServerErrorResponse('Login Failed.', response)
				}
			}
		}
		const jsonData = {}
		for(var i = 0; i < event.target.length - 1; i++) {
			jsonData[event.target.elements[i].name] = event.target.elements[i].value;
		}
		httpClient.send(JSON.stringify(jsonData));
	})
	document.getElementById('facebook-login-form').addEventListener('submit', function(event) {
		event.preventDefault();
		var clientId = '144772189413167'
		var redirectUrl = 'https://portfolio.joshbacon.name'
		var facebookUrl = 'https://www.facebook.com/v2.9/dialog/oauth'
			+'?client_id='+clientId
			+'&redirect_uri='+redirectUrl
			+'&response_type=token'
			+'&scope=public_profile,email,user_friends'
		window.location.href = facebookUrl
	})
	document.getElementById('register-form').addEventListener('submit', function(event) {
		event.preventDefault();
		const httpClient = new XMLHttpRequest();
		httpClient.open('POST', 'https://portfolioapi.joshbacon.name/auth/local/register');
		httpClient.setRequestHeader("Content-Type", "application/json");
		httpClient.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					window.location.href = '/';
				}
				else {
					handleServerErrorResponse('Registeration Failed.', response)
				}
			}
		}
		const jsonData = {}
		for(var i = 0; i < event.target.length - 1; i++) {
			jsonData[event.target.elements[i].name] = event.target.elements[i].value;
		}
		httpClient.send(JSON.stringify(jsonData));
	})
	document.getElementById('logout').addEventListener('click', function(event) {
		deleteUserSession()
		window.location.href = '/';
	})
	// PREVENTS PAGE FLICKER
	// Some elements are styled programmatically via Javascript, this will prevent
	// page from revealing elements which have not been styled yet by javascript.
	document.body.classList.remove('hidden')}

function handleServerErrorResponse(message, response) {
	alert(message+'.. '+response.status +' - '+response.statusText+' ('+response.message+')');
}
function deleteUserSession() {
	delete window.localStorage.token;
	delete window.localStorage.tokenExpiration
	delete window.localStorage.user;
}