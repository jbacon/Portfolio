/* My Simple VanillaJS Router for my Single Page Application Flow.
My Definitions:
	- Router: A helper singleton class that enables navigation via history/links. 
	- URL: Linkable path address that corresponds to one or more Routes.
	- Route: A subset of URL with a single associated handler.
	- Handler: A function that has one-to-one association w/ a Route.
	- Navigate: Update History, Examine URL, and Apply one or more Routes & Handlers.
*/
let routerInstance = null;
class Router {
	constructor() {
		if(!routerInstance) {
			routerInstance = this;
		}
		window.onpopstate = function(event) {
			routerInstance.route(window.location.pathname);
		}
		this.routes = [];
	}
	register(route, handler) {
		this.routes.push({
			route: route,
			handler: handler
		});
	}
	deregister(route) {
		for(var i=0; i < this.routes.length; i++) {
			if(this.routes[i].route === route) {
				this.routes.remove(i)
			}
		}
	}
	/* Iterate Routes -> Apply Handlers */
	route(path) {
        for(var i=0; i<this.routes.length; i++) {
            var match = path.match(this.routes[i].route);
            if(match) {
                match.shift();
                this.routes[i].handler.apply({}, match);
            }         
        }
	}
	/* Push History -> Apply Routes */
	navigate(path) {
		history.pushState({}, 'Page', path);
		this.route(path)
	}
}