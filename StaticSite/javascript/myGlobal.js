const navBar 				= document.getElementById('#site-nav-bar')
const navBarItems			= document.querySelector('#site-nav-bar .nav-item')
const navBarItemLogout 		= document.getElementById('logout-nav-item')
const navBarItemLogin 		= document.getElementById('login-nav-item')
const navBarItemGreeting 	= document.getElementById('greeting-nav-item')
const navBarItemRegister 	= document.getElementById('register-nav-item')
const navBarItemAccount 	= document.getElementById('account-nav-item')
const commentsSection		= document.getElementById('comments-section')
const commentPlaceholder 	= document.getElementById('comment-placeholder')
const formRegister			= document.getElementById('register-form')
const formLoginLocal		= document.getElementById('login-form-local')
const formLoginFacebook		= document.getElementById('login-form-facebook')
const formForgotPassword 	= document.getElementById('forgot-password-form')

if(window.portfolio.session) {
	navBarItemLogout.classList.remove('hidden')
	navBarItemLogin.classList.add('hidden')
	navBarItemRegister.classList.add('hidden')
	navBarItemGreeting.innerHTML = 'Welcome, '+window.portfolio.session.user.nameFirst+' '+window.portfolio.session.user.nameLast
	navBarItemGreeting.classList.remove('hidden')
	navBarItemAccount.classList.remove('hidden')
	commentPlaceholder.currentUserID = window.portfolio.session.user._id
	commentPlaceholder.isAdmin = window.portfolio.session.user.isAdmin
}
commentPlaceholder.shadowRoot.getElementById('remove-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('flag-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('up-vote-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('up-vote-count').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('down-vote-button').classList.add('hidden')
commentPlaceholder.shadowRoot.getElementById('down-vote-count').classList.add('hidden')

// var dialog = document.querySelector('dialog');
// dialog.addEventListener('click', function (event) {
//     var rect = dialog.getBoundingClientRect();
//     var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
//       && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
//     if (!isInDialog && dialog.open) {
//         dialog.close();
//     }
// });

/* LOGIN */

formLoginLocal.addEventListener('submit', function(event) {
	event.preventDefault()
	getAuthenticatedViaLocal({
		email: formLoginLocal.elements.namedItem('email').value,
		password: formLoginLocal.elements.namedItem('password').value
	})
});
formLoginFacebook.addEventListener('submit', function(event) {
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
/* FORGOT PASSWORD */
formForgotPassword.addEventListener('submit', function(event) {
	event.preventDefault()
	getAuthenticatedViaLocal({
		email: formForgotPassword.elements.namedItem('email').value,
		password: formForgotPassword.elements.namedItem('password').value
	})
})
/* REGISTRATION FORM */
formRegister.addEventListener('submit', function(event) { 
	event.preventDefault();
	const httpClient = new XMLHttpRequest();
	httpClient.open('POST', window.portfolio.getApiServerAddress+'/auth/register');
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
		jsonData[formRegister.elements[i].name] = formRegister.elements[i].value;
	}
	const dataString = JSON.stringify(jsonData)
	httpClient.send(dataString);
})
/* LOGOUT */
navBarItemLogout.addEventListener('click', function(event) {
	delete window.portfolio.session
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
function getAuthenticatedViaLocal({ email, password }={}) {
	getAuthenticated('/auth/local/token?email='+encodeURIComponent(email)+'&password='+encodeURIComponent(password))
}
function getAuthenticatedViaRegistration() {
	
}
function getAuthenticated(rest_api_path, callback) {
	const httpClient = new XMLHttpRequest();
	httpClient.open('GET', window.portfolio.getApiServerAddress+rest_api_path);
	httpClient.setRequestHeader("Content-Type", "application/json");
	httpClient.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			const response = JSON.parse(this.response);
			if(this.status === 200) {
				window.localStorage.session = JSON.stringify(this.response)
				window.location.href = '/';
			}
			else {
				handleServerErrorResponse(response)
			}
		}
	}
	httpClient.send();
}