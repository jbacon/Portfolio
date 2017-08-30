# MY PORTFOLIO & ENGINEERING HUB - A web application - [https://portfolio.joshbacon.name](http://portfolio.joshbacon.name)

Built to be a modern, interactive, lightweight/vanilla, single-page, static-asset, server-decoupled, component-driven web application portal. That's a lot of buzz-words. 

Feel free to email me with any questions! jbacon@zagmail.gonzaga.edu

## HOSTING: [AWS](), [EC2](), [S3/CloudFront](), [Docker](), 
## BACK-END API: [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/)
## FRONT-END U.I.: [Static Assets](), [VanillaJS](http://vanilla-js.com/), [Web-Components](https://www.webcomponents.org/introduction)

## TECHNOLOGIES EXPLORED (including proof-of-concept/deprecated/abandoned technologies)
- Front-End:
	-Javascript
	- Document Object Model (DOM) <- Awesome native browser stuff!
		- Web Components
		- Shadow DOM Elements
		- HTML Imports
	- JQuery (deprecated. Reason: Only benefit was increased backwards browser compatability. I'm not concerned.)
	- SystemJS (deprecated. Reason: Changed project direction to employ more VanillaJS & "static" site characteristics.)
	- PassportJS
	- Json Web Tokens
	- PugJS (deprecated. Reason: Old-school server template rendering, replaced with [vanillaJS string templating](https://developers.google.com/web/updates/2015/01/ES6-Template-Strings))
- Back-End:
	- NodeJS
	- ExpressJS
	- ESLint
	- PugJS (deprecated)
	- Winston 
- Databases:
	- MongoDB
- Package Managers:
	- JSPM (deprecated.)
	- NPM
- Prod Infrastructure:
	- AWS
		- EC2
			- Security Groups
			- ElasticIP
		- Route53
			- Public Hosted Zone
			- DNS
			- Domain Registration
		- ACM (deprecated) <- Could not get this to work.
		- S3 
		- CloudFront
	- LetsEncrypt
	- Nginx Reverse Proxy Server
- Dev Intrastructure:
	- Dockerized Everything
	- Nginx Server for Hosting Static Content
	- Nginx Server for Reverse Proxy in-front of Node API Server
	
## FEATURES IMPLEMENTED:
1. Models:
	- Comment
		- Threaded / nested comment section similar to Reddit
		- Hybrid Materialized Path & Nested Set
		- 
	- Account
		- Visitors can register via Local, Facebook, and/or Google accounts.
		- Impliments:
			- Login 
			- Forgot Password
			- Link Accounts (local+facebook)
			- Edit Account Details
2. Pages:
	- About Me
	- Photo Gallery via S3
	- Blog Posts
	- Contact
3. Extras:
4. Email Integration
	- Send forgot password emails
	- Administrative Notification Emails to myself
5. Ads
6. HTTPS
	- LetsEncrypt

## FUTURE PLANS / CONSIDERATIONS
- Class Decorators & Annotations
	- I'd like to use decorators to accomplish dependency injection on my data models.
	Things that could be injected include RBAC on Fields/Classes/Methods, conditional logic,
	or any other reusable middleware for building data models.
- Hosting API Server
	- Adapt a Container Orchastration Platform
		- Kubernetes
		- ECS (sucks?)
	- EC2 w/ Docker? Lambda+API Gateway?
	- Modularizing my NodeJS code into separate Lambda functions might become difficult to manage/version. Alternative would be to use a single lambda to route all traffic for all API calls.
	- EC2 + Docker, easiest to get started, decoupled from platform/service.
- Host NoSQL/MongoDB?
	- Separate EC2? Shared?
	- DBaaS?