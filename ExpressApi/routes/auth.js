var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var router = express.Router();

router.post('/local/register', (req, res, next) => {
	try {
		/*  WORK TO BE DONE.. LINK SOCIAL ACCOUNT W/ LOCAL */
		req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
		req.body.password = undefined
		var account = new Account(req.body)
		Account.create({ account: account })
		.then((account) => {
			// Login
			authUtil.getPassport().authenticate('local')(
				req, 
				res, 
				(req, res, next) => {
					const tokenDetails = authUtil.createJwt(req.user)
					const token = tokenDetails.token
					const expiration = tokenDetails.expiration
	    			res.json({ token: token, expiration: expiration, user: req.user.toObject() })
				});
		})
		.catch((err) => {
			next(err)
		});
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