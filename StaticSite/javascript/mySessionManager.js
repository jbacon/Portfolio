/*
HANDLE URL FRAGMENT
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
	history.pushState("", document.title, window.location.pathname + window.location.search);
}
/* GET SERVER ADDRESS */
(function() {
	window.portfolio = {}
	if(window.localStorage.session) {
		window.portfolio.session = JSON.parse(JSON.parse(window.localStorage.session))
		if(window.portfolio.session.expiration < Math.floor(Date.now() / 1000)) {
			delete window.localStorage.session
			delete window.portfolio.session
		}
	}
	if(location.origin.includes('localhost')) {
		// ASSUME DEV MODE
		window.portfolio.getApiServerAddress = 'http://localhost:8080'
	}
	else {
		//ASSUME PROD MODE
		window.portfolio.getApiServerAddress = 'https://portfolioapi.joshbacon.name'
	}
}());

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
			if(!window.portfolio.session) {
	    		/* Facebook Session exists but no API Server Session.
	    			Create new API Server Session */
				getAuthenticatedViaFacebook('access_token='+response.authResponse.accessToken+'&expires_in='+response.authResponse.expiresIn)
			}
			else {
				/* Both Facebook Session & API Server Session exit. */
				if(window.portfolio.session.user.facebookProfileID !== response.authResponse.userID) {
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

// let instance = null;
// /* 
// Write & Read JSON to/from Local/Session Storage.
// Performs parsing, stringification and type checking. */
// class CacheManager {
// 	constructor() {
// 		if(!instance) {
// 			instance = this
// 		}
// 		if(sessionJson.expiration <)
// 		this.token = (window.localStorage.token)
// 		return instance
// 	}
// 	writeSession(key,json) {
// 		window.
// 	}
// 	readSession() {
// 		return window.sessionStorage.
// 	}
// 	writeLocal(json) {
// 		window.localStorage
// 	}
// 	readLocal() {
// 		return window.localStorage.
// 	}
// }
// /*
// Create Session Object (Singleton via LocalStorage)
// */
// class Session {
// 	constructor() {
// 		/*
// 		Check LocalStorage
// 		If Expired set empty/default session
// 		*/
// 		var sessionJson = null;
// 		if(window.localStorage.session) {
// 			sessionJson = JSON.parse(window.localStorage.session)
// 		}
// 		if(!this.isValid()) {
// 			sessionJs
// 		}
// 		this.fromJSON(sessionJSON)
// 		this.
// 		if(sessionJson.expiration < Math.floor(Date.now() / 1000)) {
// 			// Expired
// 			sessionJson = null;
// 			if(window.localStorage.session.expiration  < M) {

// 			}
// 		}
// 		else {
// 			this = sessionJson
// 		}
// 		else {

// 		}
// 		if(!sessionInstance) {
// 			sessionInstance = this
// 			this.user = null
// 		}
// 		return sessionInstance;
// 	}
// 	get user() {
// 		return this._user
// 	}
// 	get token() {
// 		if()
// 		return JSON.parse(this._user)
// 	}
// 	get expiration() {
// 		return this._expiration
// 	}
// 	isExpired() {
// 		if(this.expiration > Math.floor(Date.now() / 1000))
// 			return true
// 		else 
// 			return false
// 	}
// 	isValid() {

// 	}
// 	toJSON() {
// 		return {

// 		}
// 	}
// 	fromJSON(json) {

// 	}
// }