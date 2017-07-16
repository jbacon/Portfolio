var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var router = express.Router();

/* Links current logged in user's social account to local account w/ Password.	*/
router.post('/local/link', authUtil.ensureAuthenticated, (req, res, next) => {
	if(!req.user.passwordHashAndSalt) {
		try {
			const passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
			req.user.passwordHashAndSalt = passwordHashAndSalt
			Account.update({ account: req.user })
	        .then((account) => {
	        	next()
	        })
	        .catch((err) => {
	          next(err)
	        })
		}
		catch(err) {
			next(err)
		}
	}
	else {
		const err = new Error('Account already has local password link!')
		err.status = 409
		next(err)
	}
});

router.post('/local/register', (req, res, next) => {
	try {
		/*  WORK TO BE DONE.. LINK SOCIAL ACCOUNT W/ LOCAL */
		Account.read({
	    	query: { email: req.body.email }
	    })
	    .then((accounts) => {
	    	switch(accounts.length) {
	    		case 1:
					var err = new Error('The email is already in use by an Account!)')
					err.status = 500
					next(err)
	    			break;
	    		case 0:
	    			req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
					req.body.password = undefined
					var newAccount = new Account(req.body)
					Account.create({ account: newAccount })
					.then((account) => {
						authUtil.getPassport().authenticate('local')(
							req, 
							res, 
							(req, res, next) => {
								const tokenDetails = authUtil.createJwt(req.user)
								const token = tokenDetails.token
								const expiration = tokenDetails.expiration
				    			res.json({ 
				    				token: token, 
				    				expiration: expiration, 
				    				user: req.user.toObject() 
				    			})
							});
					})
					.catch((err) => {
						next(err)
					});
	    			break;
	    		default:
					var err = new Error('The email is already being used by multiple accounts (this is an internal server error/bug!!)')
					err.status = 500
					next(err)
	    			break;
	    	}
	    })
	    .catch((err) => {
			next(err)
	    })
		
	}
	catch(err) {
		next(err)
	}
});
// Generates JWT Token for Client Authentication from Local Credentials.
router.get('/local/token', 
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toObject() })
});
// Generates JWT Token for Client Authentication from Facebook Token
router.get('/facebook/token', 
	authUtil.getPassport().authenticate('facebook', { scope: 'email'}),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toObject() })
});

module.exports = router;