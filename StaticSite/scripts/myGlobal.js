/* 	Configs:
	Components:
	Apis:
	Utils:
	Session: */
window.portfolio = {
	configs: {
		apiserveraddress: ((location.origin.includes("localhost")) ? "http://localhost:8080" : "https://portfolioapi.joshbacon.name"),
		googleapi: {
			client_id: "1074651307568-nhejig1r7egq7hojhvj5smq148m1vvgh.apps.googleusercontent.com"
		},
		facebookapi: {
			client_id: "144772189413167"
		}
	},
	components: {
		MyMyAccountComponent: undefined,
		MyDialogButton: undefined,
		MyCarouselComponent: undefined,
		MyCommentComponent: undefined
	},
	apis: {
		Router: undefined,
		router: undefined,
		Auth: undefined,
		auth: undefined
	},
	utils: {

	},
	session: {

	}
}
/* Using HTML Imports, dynamically insert an import link (if does not exist).
Once loaded pass imported document into provided callback function.
Link element id is generated using provided href */
window.portfolio.utils.importHtml = function(href, done) {
	var id = href.replace(/[^A-Za-z0-9]/g, "") // Generate a valid id using the href provided.
	var link = document.querySelector("script#"+id) // Lookup existing script type link element with this id
	if(link) {
		done(null, link.import) // Callback with link imported data
	}
	else {
		link = document.createElement("link")
		link.id = id
		link.rel = "import"
		link.href = href
		link.setAttribute("async", "")
		link.onload = () => {
			done(null, link.import)
		}
		link.onerror = (err) => {
			done(err)
		}
		document.head.appendChild(link) // Append new script link type element 
	}
}
window.portfolio.utils.importHtmlAsync = function(href) {
	return new Promise(function (resolve, reject) {
		window.portfolio.utils.importHtml(href, function(err, linkImport) {
			if(err) reject(err)
			else resolve(linkImport)
		})
	})
}
window.portfolio.utils.handleServerError = function(request) {
	var message = "Server Error: "+request.status+" - "+request.statusText+". "
	if(typeof request.response !== "undefined") {
		if(typeof(request.response) === "string" ) {
			var responseJSON = null
			try {
				responseJSON = JSON.parse(request.response)
				message += responseJSON.message+". "+((responseJSON.stack) ? ("Stack: "+responseJSON.stack) : "")
			}
			catch(e) {
				message += request.response
			}
		}
		else if(request.response instanceof Object) {
			message += request.response.message+". "+((request.response.stack) ? ("Stack: "+request.response.stack) : "")
		}
		else {
			message += request.response.toString()
		}
	}
	else {
		message += "No response message was returned from server."
	}
	console.log(message)
	alert(message)
}
/* Initialization Facebook SDK */
window.fbAsyncInit = function() {
	FB.init({
		appId            : window.portfolio.configs.facebookapi.client_id,
		autoLogAppEvents : true,
		xfbml            : true,
		version          : "v2.10",
		cookie           : true
	})
	// FB.AppEvents.logPageView();
	// Events: https://developers.facebook.com/docs/reference/javascript/FB.Event.subscribe/v2.10
	FB.Event.subscribe("auth.login", function(response) {
		if(response.status === 'connected') {
	    console.log("Facebook - Event - auth.login")
	    window.portfolio.apis.authManager.loginViaFacebook({
	    	access_token: response.authResponse.accessToken,
	    	expires_in: response.authResponse.expiresIn
	    })
		}
	})
	FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      window.portfolio.apis.authManager.loginViaFacebook({
      	access_token: response.authResponse.accessToken,
      	expires_in: response.authResponse.expiresIn
      })
    }
  });
	window.addEventListener('logout-event', function(e) {
		FB.getLoginStatus(function(response) {
	    if (response.status === 'connected') {
	    	FB.logout(function(response) {
				  // user is now logged out
				});
	    }
	  })
	})
	FB.XFBML.parse()
	window.dispatchEvent(new Event("facebook-api-init"))
}
/* Initialize Google SDK */
window.googleApiInit = function() {
	gapi.load("auth2", function() {
		gapi.auth2.init({
			client_id: window.portfolio.configs.googleapi.client_id,
			scope: "profile email"
		})
		gapi.auth2.getAuthInstance().isSignedIn.listen(function(signedIn) {
			console.log('Google - Auth2 - Event - SignInStatusChange('+signedIn+')')
			if(signedIn) { //Sign in
				window.portfolio.apis.authManager.loginViaGoogle({
					access_token: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
					expires_in: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).expires_in
				});
			}
		})
		window.dispatchEvent(new Event("google-api-init"))
	})
	window.portfolio.utils.googleLoginSuccess = function() {
		var access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token
		var expires_in = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().expires_in
		window.portfolio.apis.authManager.loginViaGoogle({
			access_token: access_token,
			expires_in: expires_in
		})
	}
	window.portfolio.utils.googleLoginFailed = function() {
		window.portfolio.utils.handleServerError({
			status: "500",
			message: "Google Login Failed"
		})
	}
	window.addEventListener('logout-event', function(e) {
		gapi.auth2.getAuthInstance().signOut()
	})
}

/* Initialization LinkedIn SDK */
// window.linkedInAsyncInit = function() {
// 	IN.Event.on(IN, "auth", function(data) {
// 		console.log("LinkedIn Login")
// 		IN.API.Raw("/people/~")
// 		.result(function(data) {
// 			console.log("LinkedIn User Data: "+data)
// 			window.portfolio.apis.auth.loginViaLinkedIn(IN.ENV.auth.oauth_token)
// 		})
// 		.error(function(data) {
// 			console.log("LinkedIn Failed User Data: "+data);
// 		});
// 	});
// 	IN.Event.on(IN, "logout", function() {
// 		console.log("LinkedIn Logout")
// 	});
// }