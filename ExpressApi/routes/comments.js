var express = require('express');
var Comment = require('../model/comments');
var mongodb = require('mongodb'); 
var commonAuth = require('../common/authUtil.js'); 
var router = express.Router();

// Route Handler
router.post('/create', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		var comment = new Comment(req.body)
		// Associate current user's account w/ comment
		comment.accountID = new mongodb.ObjectID(req.user._id);
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
		.catch((err) => { next(err) })
	}
	catch(err) { next(err) }
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
		.catch((err) => { next(err); });
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
		Comment.update({comment: comment })
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
router.post('/down-vote', commonAuth.ensureAuthenticated, function(req, res, next) {
	Comment.userDownVote({
		_id: req.body._id,
		accountID: req.user._id
	})
	.then((results) => {
		if(results.modifiedCount === 0) {
			const err = new Error('You have already down-voted this comment')
			err.status = 401
			next(err)
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
			const err = new Error('You have already up-voted this comment')
			err.status = 401
			next(err)
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
			const err = new Error('You have already flagged this comment')
			err.status = 401
			next(err)
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
				// Comment not found
					var err = new Error('This comment does not exist anymore...')
					err.status = 404
					next(err)
				}
				else if(results[0].accountID.toString() === req.user._id) {
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
					//User does NOT own this comment...
					var err = new Error('Not permited to remove comment owned by another user...')
					err.status = 401
					next(err)
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