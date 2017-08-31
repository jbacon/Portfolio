# MY PORTFOLIO & ENGINEERING HUB - A Web Application
[https://portfolio.joshbacon.name](http://portfolio.joshbacon.name)

My personal blog and portfolio web application.
Built to be an single-page, event-driven, interactive, componentized, vanilla, light-weight web portal.

Feel free to email me with any questions! jbacon@zagmail.gonzaga.edu

## CORE TECHNOLGOIES:
	- HOSTING: [AWS](), [S3/CloudFront](), [Docker](), [EC2]()
	- BACK-END: [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/)
	- FRONT-END: [Web-Components](https://www.webcomponents.org/introduction), [VanillaJS](http://vanilla-js.com/), [HTML](), [CSS]()

## FEATURES IMPLEMENTED:
1. Authentication Layer
	- Facebook, Google, Local Credentials
2. Social Account Integrations
	- Facebook, Google
3. Hierachical Comment System (https://docs.mongodb.com/manual/tutorial/model-tree-structures/)
4. Blog Postings
5. Photo Gallery
6. HTTPS

## FUTURE PLANS & CONSIDERATIONS
- Notifications:
	- Email Alert User when..
		- Comment Reply
		- Comment Voted
		- New Article
	- Email Alert Admin when..
		- New Account
		- New Comment
- QueryParameters or HashURL
- Event Driven Design:
	- Increase/Improve Event Design Patterns used for U.I. & Server
- Hosting API Server
	- Container Orchastration (Kubernetes)
	- Lambda + API Gateway? (Single Lambda to handle all routes)
	- EC2 + Docker, easiest to get started, decoupled from platform/service.
- DBaaS
	- AWS vs Google Cloud vs EC2 Hosting
- Visitor Statistics
	- Page Views
	- Unique Visitors
	- Click-Stream Data
- Class Decorators & Annotations
	- Dependency Injection on Models
	- Possible Uses:
		- RBAC on Fields/Classes/Methods
		- Conditional logic
		- Reusable middleware for building data models.
- Log Injestion Pipeline (ElasticSearch, Filebeat/Logstash, Kibana?)
	- Ship -> Store -> Query -> Dashboards -> Alerts
	- Distributed Tracing?

## ALL TECHNOLOGIES EXPLORED (Including proof-of-concept, deprecated, & abandoned...)
- Front-End:
	-Javascript
	- Document Object Model (DOM) <- Awesome native browser stuff!
		- Web Components
		- Shadow DOM Elements
		- HTML Imports
	- JQuery (deprecated. Reason: Only benefit was increased backwards browser compatability, which is not concern of mine.)
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
	- MongoDB (Which I would have chose SQL)
- Package Managers:
	- JSPM (deprecated. I don't an all purpose JS package manager, VanillaJS is enough on the front-end.)
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