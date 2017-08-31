var express = require('express')
var Comment = require('../model/comments')
var mongodb = require('mongodb')
var mongoUtil = require('../common/mongoUtil')
var commonAuth = require('../common/authUtil.js')
var validatorUtil = require('../common/validatorUtil')
var validator = require('validator')
var CustomError = require('../common/errorUtil')
var router = express.Router()

// Route Handler
router.post('/create', function(req, res, next) {
	var createComment = function(req, res, next) {
		try {
			var comment = new Comment({
				articleID: req.body.articleID,
				parent: req.body.parent,
				text: req.body.text,
				accountID: req.body.accountID,
				email: req.body.email,
				nameFirst: req.body.nameFirst,
				nameLast: req.body.nameLast,
				notifyOnReply: req.body.notifyOnReply
			})
			var insertComment = function() {
				mongoUtil.getDB()
					.collection(Comment.COLLECTION_NAME)
					.insertOne(comment.toJSON({ includeSensitiveFields: ['email'] }))
					.then((results) => {
						try {
							const comment = Comment.fromJSON(results.ops[0])
							res.json({ data: comment })
						}
						catch(err) {
							next(err)
						}
					})
					.catch((err) => {
						next(err)
					})
			}
			if(comment.parent) {
				// IF COMMENT HAS PARENT, UDPATE ANCESTORS, THEN INSERT COMMENT
				mongoUtil.getDB()
					.collection(Comment.COLLECTION_NAME)
					.updateOne(
						{
							_id: comment.parent,
							articleID: comment.articleID
						},
						{
							$addToSet: {
								children: validatorUtil.normalizeID(comment._id)
							}
						}
					)
					.then((results) => {
						try {
							const parentComment = Comment.fromJSON(results.ops[0])
							comment.ancestors = parentComment.ancestors.push(comment.parent)
							insertComment()
						}
						catch(err) {
							next(err)
						}
					})
					.catch((err) => {
						next(err)
					})
			}
			else {
				// IF COMMENT HAS NO PARENT, DIRECTLY INSERT COMMENT
				insertComment()
			}
		}
		catch(err) {
			return next(err)
		}
	}
	if(req.body.email && req.body.nameFirst && req.body.nameLast) { // Commenting as the current user Account (assuming they are auth! Verify first..)
		req.body.accountID = null
		createComment(req, res, next)
	}
	else {
		commonAuth.ensureAuthenticated(req, res, function(err) {
			if(err) return next(err)
			req.body.accountID = req.user._id
			createComment(req, res, next)
		})
	}
})

/**
 * @api {get} /comment/read Read comment records
 * @apiVersion 0.3.0
 * @apiName CommentRead
 * @apiGroup Comment
 * @apiPermission none
 * @apiExample Example Usage:
 *	curl --include --request GET \
 *	--header "Accept: application/json" \
 *	--header "Content-Type: application/json" \
 *	http://localhost:8080/comments/read? \
 *	articleID=59344c18e987af001c119f93 \
 *	&parent=null \
 *	&start=newest \
 *	&pageSize=5 \
 *	&sortOrder=-1 \
 *	&pageNum=1 \
 *	&skipOnPage=0
 *
 * @apiDescription Returns comment records corresponding to the request query string parameters.
 *
 * @apiParam {String} articleID=undefined MongoDB ID of an Article ID to filter by.
 * @apiParam {String} parent=undefined MongoDB ID of a Parent Comment ID to filter by.
 * @apiParam {String} start=newest Where to start pagination results
 * @apiParam {String} pageSize=0 MongoDB ID of Article ID
 * @apiParam {String} sortOrder=0 MongoDB ID of Article ID
 * @apiParam {String} pageNum=0 MongoDB ID of Article ID
 * @apiParam {String} skipOnPage=0 Number of items to s
 *
 * @apiSuccess {String} id         The new Users-ID.
 *
 * @apiUse CreateUserError
 */
router.get('/read', function(req, res, next) {
	try {
		//Build match query (based on paramaters)
		const match = {}
		if(req.query.id !== undefined) {
			match._id = validatorUtil.normalizeID(req.query.id, { allowNullable: true })
		}
		else { // IF ID PROVIDED, then START IS IRRELEVANT TO QUERY!
			var startObject
			if(req.query.start === 'newest')
				startObject = mongodb.ObjectID()
			else
				startObject = validatorUtil.normalizeID(req.query.start)
			if(req.query.sortOrder === '-1') //New -> Old
				match._id = { $lte: startObject }
			else if(req.query.sortOrder === '1') //Old -> New
				match._id = { $gt: startObject }
		}
		if(req.query.articleID !== undefined) {
			match.articleID = validatorUtil.normalizeID(req.query.articleID).toHexString()
		}
		if(req.query.parent !== undefined) {
			match.parent = validatorUtil.normalizeID(req.query.parent, { allowNullable: true })
			match.parent = (match.parent) ? match.parent.toHexString() : match.parent
		}
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME)
			.aggregate([])
			.match(match)
			.sort({
				_id: parseInt(req.query.sortOrder)
			})
			.skip(parseInt(req.query.pageSize) * (parseInt(req.query.pageNum) - 1))
			.limit(parseInt(req.query.pageSize))
			.lookup({
				from: 'accounts',
				localField: 'accountID',
				foreignField: '_id',
				as: '_account'
			})
			.unwind({
				path: '$_account',
				includeArrayIndex: '_accountIndex',
				preserveNullAndEmptyArrays: true
			})
			.toArray()
			.then((results) => {
				const sliced = results.slice(parseInt(req.query.skipOnPage))
				const comments = sliced.map((result) => { return Comment.fromJSON(result) })
				const promises = comments.map((comment) => {
					return comment.toJSONIncludingVirtuals()
						.then((json) => {
							return json
						})
				})
				Promise.all(promises)
					.then((jsons) => {
						res.json({ data: jsons })
					})
					.catch((err) => {
						next(err)
					})
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/delete', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME)
			.deleteOne({
				_id: validatorUtil.normalizeID(req.body._id)
			})
			.then((results) => {
				res.json({ data: results })
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/update', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		var comment = Comment.fromJSON(req.body)
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME)
			.updateOne(
				{ _id: comment._id },
				comment.toJSON({ includeSensitiveFields: ['email'] })
			)
			.then((results) => {
				res.json({ data: Comment.fromJSON(results.ops[0]) })
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/down-vote', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(req.body._id)
				},
				{
					$addToSet: {
						downVoteAccountIDs: validatorUtil.normalizeID(req.user._id)
					}
				}
			)
			.then((results) => {
				if(results.modifiedCount === 0) {
					next(new CustomError('You have already down-voted this comment', 401))
				}
				else {
					res.json({ data: results })
				}
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/up-vote', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(req.body._id)
				},
				{
					$addToSet: {
						upVoteAccountIDs: validatorUtil.normalizeID(req.user._id)
					}
				}
			)
			.then((results) => {
				if(results.modifiedCount === 0) {
					next(new CustomError('You have already up-voted this comment', 401))
				}
				else {
					res.json({ data: results })
				}
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/flag', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(req.body._id)
				},
				{
					$addToSet: {
						flags: validatorUtil.normalizeID(req.user._id)
					}
				}
			)
			.then((results) => {
				if(results.modifiedCount === 0) {
					next(new CustomError('You have already flagged this comment', 401))
				}
				else {
					res.json({ data: results })
				}
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/remove', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		var markCommentRemoved = function() {
			mongoUtil.getDB()
				.collection(Comment.COLLECTION_NAME).updateOne(
					{
						_id: validatorUtil.normalizeID(req.body._id)
					},
					{
						$set: {
							removed: validatorUtil.normalizeID(req.user._id)
						}
					}
				)
				.then((results) => {
					res.json({ data: results })
				})
				.catch((err) => {
					next(err)
				})
		}
		if(req.user.isAdmin) {
			markCommentRemoved()
		}
		else {
			mongoUtil.getDB()
				.collection(Comment.COLLECTION_NAME)
				.findOne({
					_id: validatorUtil.normalizeID(req.body._id)
				})
				.then((results) => {
					const comment = Comment.fromJSON(results)
					if(comment.accountID.toString() === req.user._id.toString()) {
						markCommentRemoved()
					}
					else {
						next(new CustomError('Not permited to remove comment owned by another user...', 401))
					}
				})
				.catch((err) => {
					next(err)
				})
		}
	}
	catch(err) {
		next(err)
	}
})

module.exports = router