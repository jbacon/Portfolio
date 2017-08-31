/* Auth API - Manages Token and Server Authentication */
window.portfolio.apis.AuthManager = class {
	constructor() {
		this._initializeSession();
	}
	_initializeSession() {
		if(window.localStorage.token) {
			const tokenSplit = window.localStorage.token.split(".")
			const header = JSON.parse(atob(tokenSplit[0]))
			const payload = JSON.parse(atob(tokenSplit[1]))
			const signature = tokenSplit[2]
			if(payload.exp < Math.floor(Date.now() / 1000)) {
				delete window.localStorage.token
				this._authType = null;
			}
		}
		else {
			delete window.localStorage.token
			this._authType = null;
		}
	}
	get token() {
		return window.localStorage.token
	}
	get user() {
		return (window.localStorage.token) ? JSON.parse(atob(window.localStorage.token.split(".")[1])).data : null
	}
	get authType() {
		return this._authType;
	}
	loginViaGoogle({ access_token, expires_in }={}, callback) {
    window.portfolio.apis.authManager._authType = 'google'
    this._login({
    	rest_api_path: "/auth/google/token?access_token="+encodeURIComponent(access_token)+"&expires_in="+encodeURIComponent(expires_in)
    })
	}
	loginViaFacebook({ access_token, expires_in }={}, callback) {
		window.portfolio.apis.authManager._authType = 'facebook'
    this._login({
    	rest_api_path: "/auth/facebook/token?access_token="+encodeURIComponent(access_token)+"&expires_in="+encodeURIComponent(expires_in)
    })
	}
	// Not sure why i need this?
	// loginViaExistingToken({ access_token }={}, callback) {
	//     this._login("/auth/email/verifytoken?"+encodeURIComponent(access_token), function() {
	//     	this._authType = 'local'
	//     })
	// }
	loginViaCredentials({ email, password }={}, callback) {
		window.portfolio.apis.authManager._authType = 'local'
    this._login({
    	rest_api_path: "/auth/email/login?email="+encodeURIComponent(email)+"&password="+encodeURIComponent(password)
    })
	}
	loginViaRegistrationToken({ registration_token }={}, callback) {
    window.portfolio.apis.authManager._authtype = 'local'
    this._login({
    	rest_api_path: "/auth/email/register/callback?token="+encodeURIComponent(registration_token)
    })
	}
	_login({ rest_api_path }={}, callback) {
	    const httpClient = new XMLHttpRequest()
	    httpClient.open("GET", window.portfolio.configs.apiserveraddress+rest_api_path)
	    httpClient.setRequestHeader("Content-Type", "application/json")
	    httpClient.onload = function() {
	    	if(this.status === 200) {
	        window.localStorage.token = JSON.parse(this.response).token
    			window.dispatchEvent(new Event("login-event"))
    			if(callback) callback()
	    	}
	    	else {
	    		window.portfolio.utils.handleServerError(this, callback)
	    	}
	    }
	    httpClient.onerror = function() {
	        window.portfolio.utils.handleServerError(this, callback)
	    }
	    httpClient.send()
	}
	logout(callback) {
		delete window.localStorage.token
		this._authType = null;
		window.dispatchEvent(new Event("logout-event"))
		if(callback) callback();
	}
}
window.portfolio.apis.authManager = new window.portfolio.apis.AuthManager()