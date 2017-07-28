var express = require('express');
var authUtil = require('../common/authUtil');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var CustomError = require('../common/errorUtil');
var router = express.Router();


router.post('/local/register', (req, res, next) => {
	/*  WORK TO BE DONE.. LINK SOCIAL ACCOUNT W/ LOCAL */
	Account.read({
    	query: { email: req.body.email }
    })
    .then((accounts) => {
    	switch(accounts.length) {
    		case 1:
    			next(new CustomError('The email is already in use by an Account!)', 500));
    			break;
    		case 0:
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
    			break;
    		default:
    			next(new CustomError('The email is already being used by multiple accounts (this is an internal server error/bug!!)', 500));
    			break;
    	}
    })
    .catch((err) => {
		next(err)
    })
});
// Generates JWT Token for Client Authentication from Local Credentials.
router.get('/local/token', 
	authUtil.getPassport().authenticate('local'),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});
// Generates JWT Token for Client Authentication from Facebook Token
router.get('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: 'email'}),
	(req, res, next) => {
		const tokenDetails = authUtil.createJwt(req.user)
		const token = tokenDetails.token
		const expiration = tokenDetails.expiration
	    res.json({ token: token, expiration: expiration, user: req.user.toJSON() })
});

module.exports = router;