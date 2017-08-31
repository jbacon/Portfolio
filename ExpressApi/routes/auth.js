var express = require('express')
var Account = require('../model/accounts')
var bcrypt = require('bcryptjs')
var authUtil = require('../common/authUtil')
var mongoUtil = require('../common/mongoUtil');
var validator = require('validator')
var validatorUtil = require('../common/validatorUtil')
var CustomError = require('../common/errorUtil')
var emailUtil = require('../common/emailUtil')
var configUtil = require('../common/configUtil')
var router = express.Router()

/* Authenticate w/ Facebook Token - Verify Facebook Token and exchange for a Local Authentication Token. */
router.get('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: [ 'profile', 'email' ] }),
	(req, res, next) => {
		const user = req.user.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] })
		user.passwordHashAndSalt = null
		req.query.token = authUtil.createJwt(user)
		verifyAndSendToken(req, res, next)
	})
/* Authenticate w/ Google Token - Verify Facebook Token and exchange for a Local Authentication Token. */
router.get('/google/token',
	authUtil.getPassport().authenticate('google', { scope: [ 'profile', 'email' ] }),
	(req, res, next) => {
		req.query.token = authUtil.createJwt(req.user.toJSON({ includeSensitiveFields: ['email'] }))
		verifyAndSendToken(req, res, next)
	})
// NOTE: LinkedIn does not support Implicit Grant yet...
// /* Authenticate w/ Facebook Token - Verify Facebook Token and exchange for a Local Authentication Token. */
// router.get('/linkedin/token',
// 	authUtil.getPassport().authenticate('linkedin', { scope: [ 'r_emailaddress', 'r_basicprofile' ] }),
// 	(req, res, next) => {
// 		req.query.token = authUtil.createJwt(req.user.toJSON())
// 		verifyAndSendToken(req, res, next)
// 	})
/* Authenticate w/ Local Credentials - Exchange valid credentials for a local authentication token.  */
router.get('/email/login',
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		req.query.token = authUtil.createJwt(req.user.toJSON({ includeSensitiveFields: ['email'] }))
		verifyAndSendToken(req, res, next)
	})
/* Registration Request
	1. Sends an email to the specified address w/ a registration link containing a temporary verification token. */
router.post('/email/register/request', (req, res, next) => {
	try {
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.findOne({
				email: validatorUtil.normalizeEmail(req.body.email)
			})
			.then((results) => {
				if(results) {
					next(new CustomError('Account with that email already exists!', 500))
				}
				else {
					req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10)
					req.body.password = undefined
					const newAccount = new Account({
						email: req.body.email,
						nameFirst: req.body.nameFirst,
						nameLast: req.body.nameLast,
						passwordHashAndSalt: req.body.passwordHashAndSalt
					})
					const token = authUtil.createJwt(newAccount.toJSON({ includeSensitiveFields: ['email'] }))
					const queryString = 'token='+encodeURIComponent(token)
					const email = new emailUtil.Email({
						to: newAccount.email,
						from: 'aegairsoft1@gmail.com',
						subject: 'Account Registration',
						text: undefined,
						html: '<p>This is an automated Email.'
						+'</br>Thank you for registering an account with my Portfolio web app!</br>'
						+'To complete registration please visit the link below.</br>'
						+configUtil.siteUrl+((configUtil.sitePort) ? ':'+configUtil.sitePort : '')+'/auth/email/register/callback?'+queryString+'<p>'
					})
					emailUtil.sendEmail(email, (error) => {
						if(error) {
							next(error)
						}
						else {
							res.json('Additional action required! To activate your account you must verify your email via the automated confirmation email sent to your address.')
						}
					})
				}
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
/* Registration Callback - Verify the registration token to complete registration process and create the user account. */
router.get('/email/register/callback', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
		var newAccount = Account.fromJSON(decodedToken.data)
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.insertOne(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
			.then((result) => {
				// Send admin-notification email that acocunt has been created.
				const account = Account.fromJSON(result.ops[0])
				req.query.token = authUtil.createJwt(account.toJSON({ includeSensitiveFields: ['email'] }))
				verifyAndSendToken(req, res, next)
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
/* Request PasswordReset Email - Send email to specified address including a link w/ a temporary passwordreset token.*/
router.post('/email/forgotpassword/request', (req, res, next) => {
	try {
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.findOne({
				email: validatorUtil.normalizeEmail(req.body.email)
			})
			.then((results) => {
				if(results) {
					const account = Account.fromJSON(results)
					const user = account.toJSON({ includeSensitive: ['email'] })
					const token = authUtil.createJwt(user)
					const queryString = 'token='+encodeURIComponent(token)
					var email = new emailUtil.Email({
						to: account.email,
						from: 'aegairsoft1@gmail.com',
						subject: 'Forgot Password? Please verify your request',
						text: undefined,
						html: '<p>This is an automated Email.</br>'
						+'You\'ve requested an account password reset on my blog ('+configUtil.serverUrl+').'
						+'</br>Navigate to following link to be sent a new password: '+configUtil.siteUrl+((configUtil.sitePort) ? ':'+configUtil.sitePort : '')+'/auth/email/forgotpassword/callback?'+queryString+'.</p>'
					})
					emailUtil.sendEmail(email, (error) => {
						if(error) {
							next(error)
						}
						else {
							res.json('Your temporary password reset link has been sent to your email adress: '+account.email)
						}
					})
				}
				else {
					next(new CustomError('Account not found!', 404))
				}
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
/* Password Reset Email Callback - Verify passwordreset token and send another email containing the new generated password in plaintext*/
router.get('/email/forgotpassword/callback', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(decodeURIComponent(req.query.token))
		const account = Account.fromJSON(decodedToken.data)
		const newPassword = authUtil.generatePassword()
		var newPasswordHashAndSalt = null
		try {
			newPasswordHashAndSalt = bcrypt.hashSync(newPassword, 10)
		}
		catch(err) {
			return next(err)
		}
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.updateOne(
				{ _id: validatorUtil.normalizeID(req.user._id) },
				{
					$set: {
						passwordHashAndSalt: (validator.isAlphaNumeric(newPasswordHashAndSalt)) ? newPasswordHashAndSalt : (() => { throw new CustomError('Invalid entry...', 500, '') })
					}
				}
			)
			.then((results) => {
				emailUtil.sendEmail(
					new emailUtil.Email({
						to: account.email,
						from: 'aegairsoft1@gmail.com',
						subject: 'Forgot Password? Here\'s your new password',
						text: undefined,
						html: '<p>This is an automated Email.'
						+'</br>You\'ve confirmed your request for a new account password on my blog ('+configUtil.serverUrl+').'
						+'</br>Here is your new password: '+newPassword+'</p>'
					}),
					(error) => {
						if(error) {
							next(error)
						}
						else {
							res.json('Your new password was just sent to your email address at '+account.email)
						}
					})
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
function verifyAndSendToken(req, res, next) {
	try {
		authUtil.decodeToken(req.query.token)
		res.json({
			token: req.query.token
		})
	}
	catch(err) {
		next(err)
	}
}

module.exports = router