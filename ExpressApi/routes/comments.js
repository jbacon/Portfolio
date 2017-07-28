var express = require('express');
var Comment = require('../model/comments');
var mongodb = require('mongodb'); 
var commonAuth = require('../common/authUtil.js'); 
var CustomError = require('../common/errorUtil');
var router = express.Router();

// Route Handler
router.post('/create', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		// Associate current user's account w/ comment
		req.body.accountID = req.user._id;
		var comment = new Comment(req.body)
	}
	catch(err) {
		return next(err)
	}
	Comment.create({ comment: comment })
	.then((comment) => {
		comment.toObjectWithVirtuals()
		.then((commentObject) => {
			res.json({ data: commentObject})
		})
		.catch((err) => {
			next(err)
		})
	})
	.catch((err) => { 
		next(err) 
	})
});
router.get('/read', function(req, res, next) {
	const data = JSON.parse(req.query.data)
	Comment.read(data)
	.then((comments) => {
		// Convert Class Object to Json Object for co
		const promises = comments.map((comment) => {
			return comment.toObjectWithVirtuals()
			.then((commentObject) => {
				return commentObject;
			})
		})
		Promise.all(promises).then((commentObjects) => {
			res.json({ data: commentObjects });
		})
		.catch((err) => {
			next(err)
		})
	})
	.catch((err) => { 
		next(err); 
	});
});
router.post('/delete', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	Comment.delete(req.body)
		.then((results) => {
			res.json({ data: results });
		})
		.catch((err) => {
			next(err)
		})
});
router.post('/update', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		var comment = new Comment(req.body)
	}
	catch(err) {
		return next(err)
	}
	Comment.update({comment: comment })
	.then((results) => {
		res.json({ data: results });
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/down-vote', commonAuth.ensureAuthenticated, function(req, res, next) {
	Comment.userDownVote({
		_id: req.body._id,
		accountID: req.user._id
	})
	.then((results) => {
		if(results.modifiedCount === 0) {
			next(new CustomError('You have already down-voted this comment', 401));
		}
		else {
			res.json({ data: results });
		}
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/up-vote', commonAuth.ensureAuthenticated, function(req, res, next) {
	Comment.userUpVote({
		_id: req.body._id,
		accountID: req.user._id
	})
	.then((results) => {
		if(results.modifiedCount === 0) {
			next(new CustomError('Failed to upvote comment', 500));
		}
		else {
			res.json({ data: results });
		}
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/flag', commonAuth.ensureAuthenticated, function(req, res, next) {
	Comment.flag({
		_id: req.body._id,
		accountID: req.user._id
	})
	.then((results) => {
		if(results.modifiedCount === 0) {
			next(new CustomError('Failed to flag comment', 500));
		}
		else {
			res.json({ data: results });
		}
	})
	.catch((err) => {
		next(err)
	})
});
router.post('/remove', commonAuth.ensureAuthenticated, function(req, res, next) {
	// Check if user is Admin and/or owns comment,
	// before allowing removal...
	commonAuth.ensureAdmin(req, res, function(error) {
		if(error) { 
			// Not Admin.. check if user owns comment
			Comment.read({ id: req.body._id, pageSize: 1, pageNum: 1 })
			.then((results) => { 
				if(results.length === 0) { 
					next(new CustomError('This comment does not exist anymore...', 404))
				}
				else {
					// Comment Found!!
					if(results[0].accountID.toString() === req.user._id) {
						// User owns Comment! Allow removal...
						Comment.remove({
							_id: req.body._id,
							accountID: req.user._id
						})
						.then((results) => {
							res.json({ data: results });
						})
						.catch((err) => {
							next(err)
						});
					}
					else { 
						next(new CustomError('Not permited to remove comment owned by another user...', 401))
					}
				}
			})
			.catch((err) => {
				next(err)
			});
		}
		else { 
			// User is admin! Allow removal...
			Comment.remove({
				_id: req.body._id,
				accountID: req.user._id
			})
			.then((results) => {
				res.json({ data: results });
			})
			.catch((err) => {
				next(err)
			});
		}
	});
});

module.exports = router;