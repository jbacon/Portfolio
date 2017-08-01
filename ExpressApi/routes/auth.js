var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var CustomError = require('../common/errorUtil');
var emailUtil = require('../common/emailUtil');
var router = express.Router();

/* Register w/ Local Credentials */
router.post('/local/register', (req, res, next) => {
	try {
		req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
		req.body.password = undefined
		var newAccount = new Account(req.body)
	}
	catch(err) {
		return next(err)
	}
	Account.create({ account: newAccount })
	.then((account) => {
		const tokenDetails = authUtil.createJwt(account)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: account.toJSON() })
	})
	.catch((err) => {
		next(err)
	});
});
/* Authenticate w/ Local Credentials */
router.get('/local/token', 
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});
/* Authenticate w/ Facebook Token*/
router.get('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: 'email'}),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});
router.get('/email/callback', (req, res, next) => {
	if(req.query.token) {
		try {
			const decodedToken = authUtil.decodeToken(req.query.token)
	    	res.json({ token: req.query.token, exp: decodedToken.expiration, user: decodedToken.data.user })
		}
		catch(err) {
			next(err)
		}
	}
	else {
		next(new CustomError('No valid token not found in querystring!', 404));
	}
});
/* Forgot Password */
router.get('/email/token', (req, res, next) => {
	// Send Email
	Account.read(
	{
		query: {
			email: req.query.email
		}
	})
	.then((accounts) => {
		switch(accounts.length) {
		  case 1: // FOUND
		    const account = new Account(accounts[0]);
		    const token = authUtil.createJwt(account)
			var hashFragmentString = 'email_token='+token
			var email = new emailUtil.Email({
				to: emailAddress,
				from: 'aegairsoft1@gmail.com',
				subject: 'Password Reset',
				text: undefined,
				html: '<p>This is an automated Email.</br>A password reset was requested for your account on my site (https://portfoio.joshbacon.name).</br>Use the following temporary link to access your account: https://portfolio.joshbacon.name/#'+hashFragmentString+'.</br>To permanently reset your password navigate to the "My Account" page.</p>'
			});
			emailUtil.sendEmail(email, (error) => {
				if(error) {
					next(error)
				}
			})
		    break;
		  case 0: // NOT FOUND
		    next(new CustomError('Account not found!', 404));
		    // next(null, false, new CustomError('Account not found!', 404))
		    break;
		  default: // TOO MANY FOUND
		    next(new CustomError('Too many accounts were found matching this email. Contact server admin.', 500));
		    // next(null, false, new CustomError('Too many accounts were found matching this email. Contact server admin.', 500))
		    break;
		}
	})
	.catch((err) => {
		next(err)
	});
});

module.exports = router;