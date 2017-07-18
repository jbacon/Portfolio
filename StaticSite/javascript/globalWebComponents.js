/* 
DYNAMICALLY DETERMINE DEV/PROD - by examining location origin
*/
var API_SERVER_ADDRESS = function() {
	if(location.origin.includes('localhost')) {
		// ASSUME DEV MODE
		return 'http://localhost:8080'
	}
	else {
		// ASSUME PROD MODE
		return 'https://portfolioapi.joshbacon.name'
	}
}

/* 
PARSING URL FRAGMENT
When this page is loaded off a redirect from an OAuth2 Server, the URL fragment will
contain an access_token (lookup Implicit Grant Authentication Flow).
This access_token needs to be parsed out of the URL fragment and sent to my API server,
so that it can verify the token, respond with the corresponding User account, and
then return it's own signed JWT token...
Subsequent request to the API server authenticate using this new JWT token 
(NOT the original external OAuth2 access_token).
This design decision intends to reduce authentication complexity, but using a single
JWT middleware to verify API calls, instead of relying upon switching between many
different auth flows which inherently occurs while using passportjs middlware usually
 (e.i. via facebook, google, twitter, etc..).
*/
var fragment = window.location.hash.slice(1)
if(fragment) {
	// Catagorize Fragment Data...
	if(fragment.includes('access_token') && fragment.includes('expires_in')) {
		// FACEBOOK REDIRECT...
		// Make API call to verify access_token & generate a JWT token for subsequent requests...
		const httpClient = new XMLHttpRequest();
		httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/facebook/token?'+fragment);
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
					const userString = JSON.stringify(response.user)
					window.localStorage.user = userString;
				}
				else {
					deleteUserSession()
					handleServerErrorResponse(response)
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
	/*
	AUTHENTICATED USER U.I. ALTERATIONS
	*/
	var user;
	const currentTime = Math.floor(Date.now() / 1000)
	if(window.localStorage.token
		&& window.localStorage.tokenExpiration
		&& window.localStorage.user
		&& currentTime < Number(window.localStorage.tokenExpiration)) {
		user = JSON.parse(window.localStorage.user)
		document.querySelector('#logout').classList.remove('hidden')
		document.querySelector('#login').classList.add('hidden')
		document.querySelector('#register').classList.add('hidden')
		document.querySelector('#greeting').classList.remove('hidden')
		document.querySelector('#greeting').innerHTML = 'Welcome, '+user.nameFirst+' '+user.nameLast
		document.querySelector('#my-account').classList.remove('hidden')
	}
	else {
		document.querySelector('#greeting').innerHTML = ''
		document.querySelector('#greeting').classList.add('hidden')
		document.querySelector('#my-account').classList.add('hidden')
		document.querySelector('#logout').classList.add('hidden')
		document.querySelector('#login').classList.remove('hidden')
		document.querySelector('#register').classList.remove('hidden')
		deleteUserSession()
	}
	/*
	INITIALIZE MY-ACCOUNT SECTION
	*/
	if(user) {
		window.customElements.define('my-account', MyMyAccountComponent)
		const myMyAccountObject = new MyMyAccountComponent({ 
			account: user
		});
		const myAccountModalBoxContent = document.querySelector('#my-account-modal-box--open .modal-box__content')
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
		currentUserID: (user && user._id) ? user._id : undefined,
		isAdmin: (user && user.isAdmin) ? true : false
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
	document.getElementById('login').addEventListener('mouseup', function(event) {
		var emailInput = document.getElementById('email')
	    emailInput.focus();
	});
	document.getElementById('login-form').addEventListener('submit', function(event) {
		event.preventDefault();
		const httpClient = new XMLHttpRequest();
		const email = event.target.elements.namedItem('email').value
		const password = event.target.elements.namedItem('password').value
		httpClient.open('GET', API_SERVER_ADDRESS()+'/auth/local/token?email='+encodeURIComponent(email)+'&password='+encodeURIComponent(password));
		httpClient.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					// Store JWT token
					// Reload page... (to adjust U.I. accordingly for authenticated user)
					window.localStorage.token = response.token;
					window.localStorage.tokenExpiration = response.expiration;
					window.localStorage.user = response.user;
					window.location.href = '/';
				}
				else {
					deleteUserSession()
					handleServerErrorResponse(response)
				}
			}
		}
		httpClient.send()
	});
	document.getElementById('facebook-login-form').addEventListener('submit', function(event) {
		event.preventDefault();
		var clientId = '144772189413167'
		var redirectUrl = location.origin
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
		httpClient.open('POST', API_SERVER_ADDRESS()+'/auth/local/register');
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
	/*
	UNHIDE PAGE -> Prevent page flicker from dynamic changes...
	*/
	document.body.classList.remove('hidden')
}

function handleServerErrorResponse(response) {
	alert(response.status+' - '+response.message+'. '+((response.stack) ? response.stack : ''));
}
function deleteUserSession() {
	delete window.localStorage.token;
	delete window.localStorage.tokenExpiration
	delete window.localStorage.user;
}