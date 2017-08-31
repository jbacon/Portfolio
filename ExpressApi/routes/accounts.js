var express = require('express')
var mongoUtil = require('../common/mongoUtil')
var Account = require('../model/accounts')
var validatorUtil = require('../common/validatorUtil')
var commonAuth = require('../common/authUtil')
var CustomError = require('../common/errorUtil')
var bcrypt = require('bcryptjs')
var validator = require('validator')
var router = express.Router()

/**
 * @apiDefine GroupAccounts
 * @apiGroup Accounts
 *
 * @apiError CustomError Something went wrong.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *			 "status": "404",
 *       "message": "Something went wrong",
 *			 "object": "{}"
 *     }
 */

/**
 * @api {post} /account/create Create a new Account
 * @apiVersion 0.3.0
 * @apiName CreateAccount
 * @apiGroup Account
 * @apiPermission admin
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
 * @apiDescription Create a new account.
 *
 * @apiParam {String} name Name of the User.
 *
 * @apiSuccess {String} id         The new Users-ID.
 *
 * @apiUse CreateUserError
 */
router.post('/create', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		var account = new Account({
			email: req.body.email,
			nameFirst: req.body.nameFirst,
			nameLast: req.body.nameLast,
			passwordHashAndSalt: req.body.passwordHashAndSalt
		})
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.insertOne(account.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
			.then((result) => {
				const account = Account.fromJSON(result.ops[0])
				res.json({ data: account })
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.get('/read', commonAuth.ensureAuthenticated, commonAuth.ensureAdmin, function(req, res, next) {
	try {
		if(!validator.isInt(req.query.pageSize)) throw new CustomError('Invalid param...', 400, req.body.pageSize)
		if(!validator.isInt(req.query.pageNum)) throw new CustomError('Invalid param...', 400, req.body.pageNum)
		if(req.query.query instanceof Object) throw new CustomError('Invalid param...', 400, req.body.query)
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.find(req.query.query)
			.skip(parseInt(req.query.pageSize) * (parseInt(req.query.pageNum) - 1))
			.limit(parseInt(req.query.pageSize))
			.toArray()
			.then((results) => {
				const accounts = results.map((doc) => { return Account.fromJSON(doc) })
				res.json({ data: accounts })
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
		if(!validatorUtil.isValidID(req.body._id)) throw new CustomError('Invalid param...', 400, req.body._id)
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.deleteOne({ _id: validatorUtil.normalizeID(req.body._id) })
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
		var account = Account.fromJSON(req.body)
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.updateOne(
				{ _id: account._id },
				account.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] })
			)
			.then((results) => {
				res.json({ data: Account.fromJSON(results.ops[0]) })
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/edit-details', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		if(!validator.isEmail(req.body.email)) throw new CustomError('Invalid param...', 400, req.body.email)
		if(!validatorUtil.isAlpha(req.body.nameFirst)) throw new CustomError('Invalid param...', 400, req.body.nameFirst)
		if(!validatorUtil.isAlpha(req.body.nameLast)) throw new CustomError('Invalid param...', 400, req.body.nameLast)
		mongoUtil.getDB()
			.collection(Account.COLLECTION_NAME)
			.updateOne(
				{
					_id: validatorUtil.normalizeID(req.user._id)
				},
				{
					$set: {
						email: validator.normalizeEmail(req.body.email),
						nameFirst: req.body.nameFirst,
						nameLast: req.body.nameLast
					}
				}
			)
			.then((results) => {
				res.json({ data: Account.fromJSON(results.ops[0]) })
			})
			.catch((err) => {
				next(err)
			})
	}
	catch(err) {
		next(err)
	}
})
router.post('/reset-password', commonAuth.ensureAuthenticated, function(req, res, next) {
	try {
		if(!validator.isAlphaNumeric(req.body.oldPassword)) throw new CustomError('Invalid param...', 400)
		if(!validator.isAlphaNumeric(req.body.newPassword)) throw new CustomError('Invalid param...', 400)
		if(req.user.passwordHashAndSalt) {
			var newPasswordHashAndSalt
			if(!bcrypt.compareSync(req.body.oldPassword, req.user.passwordHashAndSalt)) {
				return next(new CustomError('Original password entered is incorrect', 409))
			}
			newPasswordHashAndSalt = bcrypt.hashSync(req.body.newPassword, 10)
			mongoUtil.getDB()
				.collection(Account.COLLECTION_NAME)
				.updateOne(
					{ _id: validatorUtil.normalizeID(req.user._id) },
					{
						$set: {
							passwordHashAndSalt: newPasswordHashAndSalt
						}
					}
				)
				.then((results) => {
					res.json({ data: Account.fromJSON(results.ops[0]) })
				})
				.catch((err) => {
					next(err)
				})
		}
		else {
			next(new CustomError('Account does not have a local password to reset, use \'forgot password\' to be sent a new password by email!', 409))
		}
	}
	catch(err) {
		next(err)
	}
})
module.exports = router