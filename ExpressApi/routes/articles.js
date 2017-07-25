// var express = require('express');
// var Article = require('../model/articles');
// var router = express.Router();

// router.post('/create', function(req, res, next) {
// 	try {
// 		var article = new Article(req.body)
// 		Article.create(article)
// 			.then((results) => {
// 				res.json({ data: results });
// 			})
// 			.catch((err) => {
// 				next(err)
// 			})
// 	}
// 	catch(err) {
// 		next(err)
// 	}
// });
// router.get('/read', function(req, res, next) {
// 	Article.read(req.query)
// 		.then((results) => {
// 			res.json({ data: results });
// 		})
// 		.catch((err) => {
// 			next(err)
// 		})
// });
// router.post('/delete', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
// 	Article.delete(req.body)
// 		.then((results) => {
// 			res.json({ data: results });
// 		})
// 		.catch((err) => {
// 			next(err)
// 		})
// });
// router.post('/update', function(req, res, next) {
// 	try {
// 		var article = new Article(req.body)
// 		Article.update(article)
// 			.then((results) => {
// 				res.json({ data: results });
// 			})
// 			.catch((err) => {
// 				next(err)
// 			})
// 	}
// 	catch(err) {
// 		next(err)
// 	}
// });

// module.exports = router;