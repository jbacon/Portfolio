var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var CustomError = require('../common/errorUtil');
var emailUtil = require('../common/emailUtil');
var configUtil = require('../common/configUtil');
var router = express.Router();

/* Registration request - Sends an email to the specified address w/ a registration link containing a temporary verification token. */
router.post('/register/request', (req, res, next) => {
	try {
		req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
		req.body.password = undefined
		const newAccount = new Account(req.body)
	    const token = authUtil.createJwt(newAccount.toJSON())
	    const queryString = 'token='+encodeURIComponent(token)
		const email = new emailUtil.Email({
			to: newAccount.email,
			from: 'aegairsoft1@gmail.com',
			subject: 'Password Reset',
			text: undefined,
			html: '<p>This is an automated Email.</br>Thank you for registering an account with my Portfolio web app! To complete registration please visit the temporary link below (which will verify your email and activate your account!).</br>'+configUtil.siteUrl+((configUtil.sitePort) ? ':'+configUtil.sitePort : '')+'/auth/register/callback?'+queryString+'<p>'
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
/* Registration Callback - Verify the registration token to complete registration process and create the user account. */
router.get('/register/callback', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
		const newAccount = new Account(decodedToken.data)
		Account.create({ account: newAccount })
		.then((account) => {
			req.query.token = authUtil.createJwt(account.toJSON())
			verifyAndSendToken(req, res, next)
		})
		.catch((err) => {
			next(err)
		});
	}
	catch(err) {
		next(err)
	}
});
/* Authenticate w/ Local Credentials - Exchange valid credentials for a local authentication token.  */
router.get('/local/credentials', 
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		req.query.token = authUtil.createJwt(req.user.toJSON())
		verifyAndSendToken(req, res, next)
});
/* Verify Local JWT and send back to user if valid. */
router.get('/local/token', (req, res, next) => {
	verifyAndSendToken(req, res, next)
});
/* Authenticate w/ Facebook Token - Verify Facebook Token and exchange for a Local Authentication Token. */
router.get('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: 'email'}),
	(req, res, next) => {
		req.query.token = authUtil.createJwt(req.user.toJSON())
		verifyAndSendToken(req, res, next)
});
/* Request PasswordReset Email - Send email to specified address including a link w/ a temporary passwordreset token.*/
router.post('/email/request', (req, res, next) => {
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
		    const tokenString = JSON.stringify(jwt.token)
		    const queryString = 'token='+encodeURIComponent(tokenString)+'&expiration='+encodeURIComponent(jwt.expiration)
			var email = new emailUtil.Email({
				to: emailAddress,
				from: 'aegairsoft1@gmail.com',
				subject: 'Forgot Password',
				text: undefined,
				html: '<p>This is an automated Email.</br>A forgot password request was sent for your account on my site ('+configUtil.serverUrl+').</br>Use the following temporary link to access your account: '+configUtil.siteUrl+((configUtil.sitePort) ? ':'+configUtil.sitePort : '')+'/auth/email/callback?'+queryString+'.</br>To permanently reset your password navigate to "Account" page.</p>'
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
/* Password Reset Email Callback - Verify passwordreset token and send email with new password*/
router.get('/email/callback', (req, res, next) => {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
		const newAccount = new Account(decodedToken.data)
		Account.create({ account: newAccount })
		.then((account) => {
			req.query.token = authUtil.createJwt(account.toJSON())
			verifyAndSendToken(req, res, next)
		})
		.catch((err) => {
			next(err)
		});
	}
	catch(err) {
		next(err)
	}
});
function verifyAndSendToken(req, res, next) {
	try {
		const decodedToken = authUtil.decodeToken(req.query.token)
    	res.json({
    		token: req.query.token
    	});
	}
	catch(err) {
		next(err)
	}
}

module.exports = router;