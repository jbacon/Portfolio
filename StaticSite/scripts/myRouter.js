/* My Simple VanillaJS Router for my Single Page Application Flow.
My Definitions:
	- Router: A helper singleton class that enables navigation via history/links.
	- URL: Linkable path address that corresponds to one or more Routes.
	- Route: A subset of URL with a single associated handler.
	- Handler: A function that has one-to-one association w/ a Route.
	- Navigate: Update History, Examine URL, and Apply one or more Routes & Handlers.
*/
window.portfolio.apis.Router = class {
	constructor() {
		if(!window.portfolio.apis.router) {
			window.portfolio.apis.router = this
		}
		window.onpopstate = (event) => {
			this.route(window.location.pathname)
		}
		this.routes = []
	}
	register(route, handler) {
		this.routes.push({
			route: route,
			handler: handler
		})
	}
	deregister(route) {
		for(var i=0; i < this.routes.length; i++) {
			if(this.routes[i].route === route) {
				this.routes.remove(i)
			}
		}
	}
	/* Execute handlers in callback waterfall */
	route(path) {
		let handlers = []
		for(let i = 0; i < this.routes.length; i++) {
			let match = path.match(this.routes[i].route)
		    if(match) {
				match.shift()
				handlers.push((next) => {
                	window.portfolio.apis.router.routes[i].handler.apply({}, match.concat(next))
				})
			}
		}
		this.waterfall(handlers, (err) => {
			if(err) {
				console.log("Router - Error routing to ath \""+path+ "\". Message: \""+err.toString())
			}
			else {
				console.log("Routed to Path "+path)
			}
		})
	}
	/* Push History -> Apply Routes */
	navigate(path) {
		history.pushState({}, "Page", path)
		this.route(path)
	}
	/* Execute an array of functions as a Callback waterfall */
	waterfall(fns, done, ...args) {
		if (fns.length) {
			var fn = fns.shift()
			var cb = (...args) => {
				window.portfolio.apis.router.waterfall.apply({}, [fns, done].concat(args))
		    }
			fn.apply({}, args.concat(cb))
		}
		else {
			done.apply(this, args)
		}
	}
}
window.portfolio.apis.router = new window.portfolio.apis.Router()
window.portfolio.apis.router.register(/^\/$/, (next) => { // Matching just / or nothing: /(^$|^\/)$/g
	window.portfolio.apis.index.loadMain("Welcome", "/html/main/welcome.html", next)
})
window.portfolio.apis.router.register(/^\/about$/, (next) => {
	window.portfolio.apis.index.loadMain("About Me", "/html/main/about.html", next)
})
window.portfolio.apis.router.register(/^\/contact$/, (next) => {
	window.portfolio.apis.index.loadMain("Contact Me", "/html/main/contact.html", next)
})
window.portfolio.apis.router.register(/^\/photos$/, (next) => {
	window.portfolio.apis.index.loadMain("My Photos", "/html/main/photos.html", next)
})
window.portfolio.apis.router.register(/^\/articles/, (next) => {
	window.portfolio.apis.index.loadMain("Articles", "/html/main/articles.html", next)
})
window.portfolio.apis.router.register(/^\/articles\/([0-9]{4})\/(january|february|march|april|may|june|july|august|september|october|november|december)\/([0-9]{1,2})\/([a-zA-Z0-9\-]+).html$/, (year, month, day, articleName, next) => {
	window.portfolio.apis.articles.loadArticle(year, month, day, articleName, next)
})
window.portfolio.apis.router.register(/^\/login$/, (next) => {
	window.portfolio.apis.index.loadLogin(next)
})
window.portfolio.apis.router.register(/^\/logout$/, (next) => {
	window.portfolio.apis.authManager.logout(next)
})
window.portfolio.apis.router.register(/^\/account$/, (next) => {
	window.portfolio.apis.index.loadAccount(next)
})
window.portfolio.apis.router.register(/^\/admin/, (next) => {
	window.portfolio.apis.index.loadAccount(next)
})
window.portfolio.apis.router.register(/^\/admin\/accounts/, (pageNum, pageSize, sortOrder, next) => {
	window.portfolio.apis.index.loadAccount(next)
})
window.portfolio.apis.router.register(/^\/admin\/accounts/, (accountID, next) => {
	window.portfolio.apis.index.loadAccount(next)
})
window.portfolio.apis.router.register(/^\/auth\/facebook\/callback/, (next) => {
	var fragment = window.location.hash.slice(1)
	window.portfolio.apis.authManager.loginViaFacebook(fragment, function() {
		window.portfolio.apis.router.navigate('/')
	})
})
window.portfolio.apis.router.register(/^\/auth\/google\/callback/, (next) => {
	var fragment = window.location.hash.slice(1)
	window.portfolio.apis.authManager.loginViaGoogle(fragment, function() {
		window.portfolio.apis.router.navigate('/')
	})
})
// Not sure why i need this?
// window.portfolio.apis.router.register(/^\/auth\/email\/verifytoken/, (next) => {
// 	var fragment = window.location.hash.slice(1)
// 	const dataStringDecoded = decodeURIComponent(fragment)
// 	const dataJson = JSON.parse(dataStringDecoded)
// 	window.portfolio.apis.authManager.loginViaExistingToken({
// 		access_token: dataJson.token
// 	}, function() {
// 		window.portfolio.apis.router.navigate('/')
// 	})
// })
window.portfolio.apis.router.register(/^\/auth\/email\/register\/callback/, (next) => {
	const searchString = window.location.search
	const searchStringDecoded = decodeURIComponent(searchString)
	const searchParams = new URLSearchParams(searchStringDecoded)
	const token = searchParams.get("token")
	window.portfolio.apis.authManager.loginViaRegistrationToken({
		access_token: token
	}, function() {
		alert('Account registration completed! Welcome!')
		window.portfolio.apis.router.navigate('/')
	})
})
window.portfolio.apis.router.register(/^\/auth\/email\/forgotpassword\/callback\?token=([a-zA-Z\.\-0-9]+)/, (token, next) => {
	const httpClient = new XMLHttpRequest()
  httpClient.open("GET", window.portfolio.configs.apiserveraddress+"/auth/email/forgotpassword/callback?token="+encodeURIComponent(token))
  httpClient.setRequestHeader("Content-Type", "application/json")
  httpClient.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE) {
          if(this.status === 200) {
              const responseJSON = JSON.parse(this.response)
              alert(responseJSON)
              window.portfolio.apis.router.navigate('/')
          }
          else {
              window.portfolio.utils.handleServerError(this)
          }
      }
  }
  httpClient.send()
})
window.portfolio.apis.router.route(window.location.pathname+window.location.search+window.location.hash)