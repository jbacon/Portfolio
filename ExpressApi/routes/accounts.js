var express = require('express');
var Account = require('../model/accounts');
var router = express.Router();

router.post('/create', function(req, res, next) {
	try {
		var account = new Account(req.body)
		Account.create(account)
			.then((results) => {
				res.json({ data: results });
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
});
router.get('/read', function(req, res, next) {
	Account.read(req.query)
		.then((results) => {
			res.json({ data: results });
		})
		.catch((err) => {
			next(err)
		})
});
router.post('/delete', function(req, res, next) {
	Account.delete(req.body)
		.then((results) => {
			res.json({ data: results });
		})
		.catch((err) => {
			next(err)
		})
});
router.post('/update', function(req, res, next) {
	try {
		var account = new Account(req.body)
		Account.update(account)
			.then((results) => {
				res.json({ data: results });
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
});

module.exports = router;