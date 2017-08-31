var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var commonConfig = require('../common/configUtil')
var Account = require('../model/accounts')
var passport = require('passport') // Authentication Framework
var LocalStrategy = require('passport-local').Strategy // Authentication Strategy
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var CustomError = require('../common/errorUtil')
var mongoUtil = require('../common/mongoUtil')
var FacebookTokenStrategy = require('passport-facebook-token')
var GoogleTokenStrategy = require('passport-google-token').Strategy
// var LinkedInTokenStratey = require('passport-linkedin-oauth2').Strategy //Not able to use for login, doesn't support implicit grant
var crypto = require('crypto')

exports.getPassport = function() {
	return passport
}
exports.extractJwt = function(req) {
	var token = null
	if(req)
	{
		const headers = req.headers
		if(headers) {
			const authorization = headers['authorization']
			if(authorization) {
				const bearer = authorization.startsWith('Bearer ')
				if(bearer) {
					token = authorization.substring(7)
				}
			}
		}
	}
	return token
}
exports.decodeToken = function(token) {
	var decoded = jwt.verify(token, commonConfig.jwtSecret)
	return decoded
}
exports.createJwt = function(data) {
	const expiration = Math.floor(Date.now() / 1000) + (60 * 60)
	const token = jwt.sign(
		{
			exp: expiration,
			data: data
		},
		commonConfig.jwtSecret)
	return token
}
exports.generatePassword = function() {
	return crypto.randomBytes(16).toString('hex')
}
exports.ensureAdmin = function(req, res, next) {
	if(req.user.email === commonConfig.adminEmail) {
		next()
	}
	else {
		next(new CustomError('', 401))
	}
}
exports.ensureAuthenticated = function(req, res, next) {
	passport.authenticate(
		[ 'jwt' ],
		(err, user, info) => {
			if (err) {
				next(new CustomError('JWT verification failed.', 500, err))
			}
			else if (!user) {
				next(new CustomError('JWT invalid.', 401, info))
			}
			else {
				req.logIn(user, (err) => {
					if (err) {
						next(new CustomError('JWT failed login user.', 500, err))
					}
					else {
						next()
					}
				})
			}
		})(req, res, next)
}

passport.serializeUser(function(accountObject, done) {
	done(null, JSON.stringify(accountObject))
})
passport.deserializeUser(function(accountString, done) {
	const accountJson = JSON.parse(accountString)
	const accountClass = Account.fromJSON(accountJson)
	done(null, accountClass)
})

// Authenticates client provided 'JWT token' validity...
// This middleware is called on each request to ensure token validity,
// because it does not query any databases/apis to check user credentials.
// (A valid token already implies trust and authentication!!!!)
passport.use('jwt', new JwtStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true,
	session: false,
	secretOrKey: commonConfig.jwtSecret,
	jwtFromRequest: exports.extractJwt
},
(req, jwt_payload, next) => {
	// payload contains entire account data.
	// If this function is reach it is already implied that
	// the user is authenticated via a valid signed token found in the auth header.
	var user = Account.fromJSON(jwt_payload.data)
	// Refresh jwt... if needed? (bad practice, because otherwise tokens would never expire..)
	next(null, user)
}))
// Authenticates client provided credentials validity against my custom MongoDB
passport.use('local', new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true,
		session: false
	},
	(req, email, password, next) => {
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.find({
				email: email
			})
			.toArray()
			.then((results) => {
				const accounts = results.map((doc) => { return Account.fromJSON(doc) })
				switch(accounts.length) {
				case 1: { // FOUND
					const account = Account.fromJSON(accounts[0])
					if(account.passwordHashAndSalt) {
						// Account has a local password (therefore it has been email verified)
						if(!bcrypt.compareSync(password, account.passwordHashAndSalt)) {
							next(new CustomError('Incorrect Password!', 401))
							// next(null, false, new CustomError('Incorrect Password!', 401))
						}
						else {
							next(null, account)
						}
					}
					else {
						if(account.facebookProfileID || account.googleProfileID) {
							// Account does not have a local password BUT it has social account link.
							next(new CustomError('This account was registered via an external Social Media service, login using with the appropriate social account and then create separate/new login credentials for your account.', 401))
						}
						else {
							// Account does not have a local password AND no social-links (therefore it has not been verified via email..)
							next(new CustomError('Account activation not completed! Check your email inbox for account activation steps.' , 401))
						}
					}
					break
				}
				case 0: { // NOT FOUND
					next(new CustomError('Account not found!', 404))
					// next(null, false, new CustomError('Account not found!', 404))
					break
				}
				default: { // TOO MANY FOUND
					next(new CustomError('Too many accounts were found matching this email. Contact server admin.', 500))
					// next(null, false, new CustomError('Too many accounts were found matching this email. Contact server admin.', 500))
					break
				}
				}
			})
			.catch((err) => {
				next(err)
			})
	})
)

passport.use('google', new GoogleTokenStrategy({
	clientID: commonConfig.googleAppID,
	clientSecret: commonConfig.googleAppSecret,
	passReqToCallback: true,
	session: false
}, function(req, accessToken, refreshToken, profile, next) {
	exports.socialAuthencationHandler('google', profile, next)
}))

// Authenticates client provided 'Facebook token' validity
// This middleware queries the facebook GraphAPI to return facebook account details,
// therefore this is only called on initial login (not each request).
passport.use('facebook', new FacebookTokenStrategy({
	clientID: commonConfig.facebookAppID,
	clientSecret: commonConfig.facebookAppSecret,
	passReqToCallback: true,
	session: false,
	profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name' ]
},
function(req, accessToken, refreshToken, profile, next) {
	exports.socialAuthencationHandler('facebook', profile, next)
}))
// NOTE: LinkedIn only supports OAuth2 Explicit Grant, SPA (like my app) require OAuth2 Implicit Grant..
//	Will need to wait for Implicit Grant Support from linkedIn auth server...
// passport.use('linkedin', new LinkedInTokenStratey({
// 	clientID: commonConfig.linkedInAppID,
// 	clientSecret: commonConfig.linkedInAppSecret,
// 	passReqToCallback: true,
// 	session: false
// },
// function(req, accessToken, refreshToken, profile, done) {
// 	exports.socialAuthencationHandler('linkedIn', profile, done)
// }))

exports.socialAuthencationHandler = function(socialProfileType, profile, next) {
	// Social Profile might have multiple Email addresses associated with it...
	//	search for all accounts with ANY of the emails.
	const emailsList = (profile.emails && profile.emails.length > 0) ? profile.emails.map((item) => { return item.value }) : []
	mongoUtil.getDB()
		.collection(Account.COLLECTION_NAME)
		.find({
			$or: [
				{ [socialProfileType+'ProfileID']: profile.id },
				{ email: { $in: emailsList } } ]
		})
		.toArray()
		.then((results) => {
			const accounts = results.map((doc) => { return Account.fromJSON(doc) })
			try {
				switch(accounts.length) {
				case 1: // Account match found!
					const account = Account.fromJSON(accounts[0])
					// Check if Email & ProfileID match between my local account data & Social profile data.
					if(account.email
						&& emailsList.indexOf(account.email) !== -1
						&& account.email === emailsList[emailsList.indexOf(account.email)]
						&& account[socialProfileType+'ProfileID']
						&& account[socialProfileType+'ProfileID'] === profile.id) {
						// Full match
						next(null, account)
					}
					else { // Partial Match
						if(!account[socialProfileType+'ProfileID']) {
							// Email matched but missing ID, between Backend System & Social profile!
							// Update System adding FacebookProfileID
							account[socialProfileType+'ProfileID'] = profile.id
							mongoUtil.getDB()
								.collection(Account.COLLECTION_NAME)
								.updateOne({ id: account._id }, account.toJSON({ includeSensitiveFields : ['email','passwordHashAndSalt'] }))
								.then((results) => {
									next(null, Account.fromJSON(results.ops[0]))
								})
								.catch((err) => {
									next(err)
								})
						}
						else {
							// ID must have matched between Backend System & Social profile!
							if(!account.email) {
								// Email missing in Backend System, update with Social's first email!!
								account.email = emailsList[0]
								mongoUtil.getDB()
									.collection(Account.COLLECTION_NAME)
									.updateOne({ id: account._id }, account.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
									.then((results) => {
										next(null, Account.fromJSON(results.ops[0]))
									})
									.catch((err) => {
										next(err)
									})
							}
							else {
								// Email mismatch between System and Social... Weird error!
								next(new CustomError('This social profile matches an existing profile ID, but the email on record does not match! Contact server admin', 500))
							}
						}
					}
					break
				case 0: // New Account/User!!!!
					const newAccount = new Account({
						[socialProfileType+'ProfileID']: profile.id,
						nameFirst: profile.name.givenName,
						nameLast: profile.name.familyName,
						email: profile.emails[0].value
					})
					mongoUtil.getDB()
						.collection(Account.COLLECTION_NAME)
						.insertOne(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
						.then((result) => {
							// Send admin-notification email that acocunt has been created.
							next(null, Account.fromJSON(result.ops[0]))
						})
						.catch((err) => {
							next(err)
						})
					break
				default: // ERROR!!! Too many matches...
					next(new CustomError('This social profile has multiple email addresses and seems to match multiple existing accounts, which should not happen! Contact server admin', 500))
					break
				}
			}
			catch(err){
				next(err)
			}
		})
		.catch((err) => {
			next(err)
		})
}