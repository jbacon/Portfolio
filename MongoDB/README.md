# Personal Website (Single Page Application)
## API Server: [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/), & [VanillaJS](http://vanilla-js.com/))
## Static Public Content: [VanillaJS](http://vanilla-js.com/), [WebComponents](https://www.webcomponents.org/introduction)

This is a web app built entirely by me, Josh Bacon, for the purpose of learning all about modern web application development. Applies Single-Page application architecture. Static website files are hosted using AWS S3+CloudFront while API/Authentication Server is hosted directly on AWS EC2 w/ Docker.
![alt text](screenshots/home.png)

## Technologies Used (both current & abandoned):
- Front-End:
	-Javascript
	- Document Object Model (DOM) <- Awesome browser native stuff!
		- Web Components!
		- Shadow DOM Elements!
		- HTML Imports!
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
- Infrastructure/Hostin:
	- AWS
		- EC2
			- Security Groups
			- ElasticIP
		- Route53
			- Public Hosted Zone
			- DNS
			- Domain Registration
		- ACM <- Didn't work...
	- LetsEncrypt
	
## Features to Implement:
1. Threaded Comments Section - like Reddit
	- Hierarchical Data 
	- Materialized Path? Nested Set? etc..?
	- Self-Referencing MongoDB table?
	- Single Comment Document vs Many Comment Document? Size constraint considerations?
	- Combine Many Comment Document w/ Single Comment Document?
		- Architect data model to support this optimized/efficient approach.
![alt text](screenshots/comments.png)
2. Markdown Blog Entries - Articles
	- Backed in MongoDB!
	- Integrate Markdown Editor! (browser based...)
	- Validate against XXS, XSFR, Scripts, etc...!
	- Pictures/Images! Via S3?
3. User Accounts
	- JWT Tokens
	- MongoDB User storage
	- Administrative accounts
	- User accounts
	- Facebook User Accounts
	- Ownership ideas
	- Facebook Authentication via passport-facebook-token.js
	- Local Account Registration
![alt text](screenshots/register.png)
4. About Me
	- Static Content
	- Resume
	- Social Profiles:
		- GitHub
		- DockerHub
		- LinkedIn
		- Email
		- Google
5. Donation Integration via PayPal, etc..
6. Email Integration
	- Forgot Password, no problem!
	- Spam! (jk)
	- Automated Email Administration & Stats:
		- Did I get a visitor!? Yay!
		- Did I get a registration/login!? Yay!
		- Did I get a million dollars!! Probably not..
7. Ads!
	- How do I accomplish this... no idea!
8. Rest API:
	- JsonWebToken Authentication.
	- Documenting the express REST api, how to!
	- Securing the REST api!
9. HTTPS:
	- Initially tried Amazon Certificate Manager, but it did not work for me (domain verification emails were never being sent to my administrative email account). After wasting lots of time trouble-shooting, I gave up and said it's broken.
	- I've since switched to LetsEncrypt + certbot. Super easy setup ~10minutes to generate certs.
10. Remove Spaghetti Code: Find Front-End Development Pattern...
	- ReactJS
	- VanillaJS (Web Components?) <- Future choice.
	- Polymer (Google)
11. Reduce Spangethhi code


## Future Plans:
- Host Static Content
	- GitHub.io? AWS S3? EC2?
- Host NodeJS API
	- EC2 w/ Docker? Lambda+API Gateway?
	- I wouldn't want to modularize my NodeJS code into separate Lambda functios, that'd be difficult to manage (I'd assume). Instaed route all traffic to one lambda, which handles all server API requests.
	- Probably start with EC2 VM + Docker, easiest to get started, decoupled from platform/service.
- Host NoSQL/MongoDB?
	- Separate EC2? Shared?
	- DBaaS?