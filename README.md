# PORTFOLIO WEB APP - [https://portfolio.joshbacon.name](http://portfolio.joshbacon.name)

An interactive website built entirely by me, Josh Bacon, for use as an personal engineering portfolio. This hub employs a both a single-page application architecture and static-site architecture, along with a modern technology stack. Static Assets/Pages are hosted on S3/CloudFront where my API is hosted on EC2.

Feel free to email me with any questions! jbacon@zagmail.gonzaga.edu

## HOSTING: [AWS](), [EC2](), [S3/CloudFront](), [Docker](), 
## BACK-END API: [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/)
## FRONT-END U.I.: [Static Assets](), [VanillaJS](http://vanilla-js.com/), [Web-Components](https://www.webcomponents.org/introduction)

## TECHNOLOGIES EXPLORED (including deprecated/abandoned tech)
- Front-End:
	-Javascript
	- Document Object Model (DOM) <- Awesome native browser stuff!
		- Web Components
		- Shadow DOM Elements
		- HTML Imports
	- JQuery (deprecated)
	- SystemJS (deprecated)
	- PassportJS
	- Json Web Tokens
	- PugJS (deprecated)
- Back-End:
	- NodeJS
	- ExpressJS
	- ESLint
	- PugJS (deprecated)
	- Winston 
- Databases:
	- MongoDB
- Package Managers:
	- JSPM (deprecated)
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