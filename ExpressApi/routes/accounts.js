var express = require('express');
var Account = require('../model/accounts');
var commonAuth = require('../common/authUtil')
var CustomError = require('../common/errorUtil');
var bcrypt = require('bcryptjs');
var router = express.Router();

router.post('/create', function(req, res, next) {
	try {
		var account = new Account(req.body)
	}
	catch(err) {
		return next(err)
	}
	Account.create(account)
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.get('/read', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	Account.read(req.query)
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/delete', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	Account.delete(req.body)
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/update', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		var account = new Account(req.body)
	}
	catch(err) {
		return next(err)
	}
	Account.update(account)
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/edit-details', commonAuth.ensureAuthenticated, function(req, res, next) {
	Account.editDetails(req.body)
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/reset-password', commonAuth.ensureAuthenticated, function(req, res, next) {
	if(req.user.passwordHashAndSalt) {
		var newPasswordHashAndSalt;
		try {
			if(!bcrypt.compareSync(req.body.oldPassword, req.user.passwordHashAndSalt)) {
				return next(new CustomError('Original password entered is incorrect', 409))
           	}
			newPasswordHashAndSalt = bcrypt.hashSync(req.body.newPassword, 10);
		}
		catch(err) {
			return next(err)
		}
		Account.createPassword({
			_id: req.user._id, 
			passwordHashAndSalt: newPasswordHashAndSalt 
		})
        .then((account) => {
			res.json({ data: account });
        })
        .catch((err) => {
          next(err)
        })
	}
	else {
		next(new CustomError('Account does not have a local password to reset, use "create password" instead!', 409));
	}
});
router.post('/create-password', commonAuth.ensureAuthenticated, function(req, res, next) {
	if(!req.user.passwordHashAndSalt) {
		var passwordHashAndSalt;
		try {
			passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10);
		}
		catch(err) {
			return next(err)
		}
		Account.createPassword({ 
			_id: req.user._id, 
			passwordHashAndSalt: passwordHashAndSalt 
		})
        .then((account) => {
			res.json({ data: account });
        })
        .catch((err) => {
          next(err)
        })
	}
	else {
		next(new CustomError('Account already has local password', 409))
	}
});

module.exports = router;