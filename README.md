# PORTFOLIO WEB APP - [https://portfolio.joshbacon.name](http://portfolio.joshbacon.name)

An interactive website built entirely by me, Josh Bacon, for use as an personal engineering portfolio. This hub employs a single-page application architecture and a modern technology stack/infrastructure.
Feel free to email me with any questions! jbacon@zagmail.gonzaga.edu

## BACK-END API: [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/), [Docker](), [AWS EC2]()
## FRONT-END U.I.: [VanillaJS](http://vanilla-js.com/), [Web-Components](https://www.webcomponents.org/introduction), [AWS S3/CloudFront]()
![alt text](screenshots/home.png)

## TECHNOLOGY STACK (current & deprecated)
- Front-End:
	-Javascript
	- Document Object Model (DOM) <- Awesome native browser stuff!
		- Web Components
		- Shadow DOM Elements
		- HTML Imports
	- JQuery (deprecated.. I don't really care about browser compatibility for this project, update your browsers!)
	- SystemJS
	- PassportJS
	- Json Web Tokens
	- PugJS
- Back-End:
	- NodeJS
	- ExpressJS
	- ESLint
	- PugJS
	- Winston
- Databases:
	- MongoDB
- Package Managers:
	- JSPM
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
		- ACM <- Didn't work...
		- S3 
		- CloudFront
	- LetsEncrypt
	- Nginx Reverse Proxy Server
- Dev Intrastructure:
	- Dockerized Everything
	- Nginx Server for Hosting Static Content
	- Nginx Server for Reverse Proxy in-front of API Server
	
## FEATURES IMPLEMENTED:
1. Comments:
	- Similar to Reddit
	- Support Threaded/Nested Comments - Hierarchial Data
	- Roles: Admin/User/Anonymous
	- Hybrid Materialized Path & Nested Set
	- Self-Referencing MongoDB table?
	- Single Comment Document vs Many Comment Document? Size constraint considerations?
	- Combine Many Comment Document w/ Single Comment Document?
		- Architect data model to support this optimized/efficient approach.
![alt text](screenshots/comments.png)
2. Accounts:
	- Session-less - Token-based Authentication (JWT)
	- Login/Register via Local, Facebook, & Google
	- RBAC - Admin, Anonymous, User 
	- Forgot Password
![alt text](screenshots/register.png)
3. About Me
	- Early Life
	- Location
4. Photos:
	- Create a simple photo gallary
5. Blogs:
	- Create some blog posts accessible by Date/Search
6. Contact:
	- Email
	- Phone
	- Tech Profiles:
		- GitHub
		- DockerHub
		- StackOverflow
		- Apache
	- Social Profiles: 
		- LinkedIn
		- Facebook
		- Google
7. Email Integration
	- Forgot Password.. no problem!
	- Personal Administration Alerts!
	- Automated Email Administration & Stats:
		- Did I get a visitor?
		- Did I get a registration?
8. Ads!
	- How do I accomplish this... no idea!
9. HTTPS:
	- Initially tried Amazon Certificate Manager, but had no luck (domain verification emails were never being sent to my administrative email account). After wasting lots of time trouble-shooting, I gave up and claim it's broken.
	- I've since switched to LetsEncrypt + certbot. Super easy setup ~10minutes to generate certs.
10. Reduced Spaghetti Code: 
	- Adapt a Front-End Framework...
		- ReactJS?
		- VanillaJS? (Web Components?)
		- Polymer? (Google Web Components)
11. Static Content Hosted vai S3/CloudFront
12. API Hosted via EC2/LoadBalancer

## Future Plans:
- Hosting API Server:
	- Adapt Container Orchastration Platform
		- Kubernetes
		- ECS (sucks?)
- Host Static Content
	- GitHub.io? AWS S3? EC2?
- Host NodeJS API
	- EC2 w/ Docker? Lambda+API Gateway?
	- I wouldn't want to modularize my NodeJS code into separate Lambda functios, that'd be difficult to manage (I'd assume). Instaed route all traffic to one lambda, which handles all server API requests.
	- Probably start with EC2 VM + Docker, easiest to get started, decoupled from platform/service.
- Host NoSQL/MongoDB?
	- Separate EC2? Shared?
	- DBaaS?