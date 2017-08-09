var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var CustomError = require('../common/errorUtil');
var emailUtil = require('../common/emailUtil');
var router = express.Router();

/* Register w/ Local Credentials */
router.post('/register/request', (req, res, next) => {
	try {
		req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
		req.body.password = undefined
		const newAccount = new Account(req.body)
	    const token = authUtil.createJwt(newAccount.toJSON())
		const hashFragmentString = 'token='+token
		// Send email to 
		const email = new emailUtil.Email({
			to: emailAddress,
			from: 'aegairsoft1@gmail.com',
			subject: 'Password Reset',
			text: undefined,
			html: '<p>This is an automated Email.</br>Thank you for registering an account with my Portfolio web app! To complete registration please visit the temporary link below (which will verify your email and activate your account!).</br>https://portfolio.joshbacon.name/#registration-callback?'+hashFragmentString+'<p>'
		});
		emailUtil.sendEmail(email, (error) => {
			if(error) {
				next(error)
			}
			else {
				res.json('Additional Action Required! To activate your newly created account you must verify your email via the automated email sent to your address.')
			}
		})
	}
	catch(err) {
		return next(err)
	}
});
router.get('/register/callback', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
		const newAccount = new Account(decodedToken.data)
		Account.create({ account: newAccount })
		.then((account) => {
			const tokenDetails = authUtil.createJwt(account.toJSON())
			const token = tokenDetails.token
			const expiration = tokenDetails.expiration
		    res.json({ token: token, expiration: expiration, user: account.toJSON() })
		})
		.catch((err) => {
			next(err)
		});
	}
	catch(err) {
		next(err)
	}
})
/* Authenticate w/ Local Credentials */
router.get('/local/token', 
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user.toJSON())
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});
/* Authenticate w/ Facebook Token*/
router.get('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: 'email'}),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user.toJSON())
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});
router.get('/email/token', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
    	res.json({ token: req.query.token, exp: decodedToken.expiration, user: decodedToken.data })
	}
	catch(err) {
		next(err)
	}
});
/* Forgot Password */
router.get('/email/request', (req, res, next) => {
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
		    const token = authUtil.createJwt(account.toJSON())
			var hashFragmentString = 'email_token='+token
			var email = new emailUtil.Email({
				to: emailAddress,
				from: 'aegairsoft1@gmail.com',
				subject: 'Password Reset',
				text: undefined,
				html: '<p>This is an automated Email.</br>A password reset was requested for your account on my site (https://portfoio.joshbacon.name).</br>Use the following temporary link to access your account: https://portfolio.joshbacon.name/#forgot-password-callback?'+hashFragmentString+'.</br>To permanently reset your password navigate to the "My Account" page.</p>'
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