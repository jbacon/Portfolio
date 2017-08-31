var Document = require('../model/document')
var mongodb = require('mongodb')
var mongoUtil = require('../common/mongoUtil')
var validatorUtil = require('../common/validatorUtil')
var CustomError = require('../common/errorUtil')
var validator = require('validator')

module.exports = class Account extends Document {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(json) {
		super(json)
		this.email = json.email
		this.nameFirst = json.nameFirst
		this.nameLast = json.nameLast
		this.passwordHashAndSalt = json.passwordHashAndSalt || null
		this.facebookProfileID = json.facebookProfileID || null
		this.googleProfileID = json.googleProfileID || null
		this.dateLastAuthenticated = json.dateLastAuthenticated || new Date()
		this.notifyOnMyCommentVotes = json.notifyOnMyCommentVotes || false
		this.notifyOnMyCommentReplies = json.notifyOnMyCommentReplies || true
		this.notifyOnNewArticles = json.notifyOnNewArticles || true
		this.followingComments = json.followingComments || []
	}
	get facebookProfileID() {
		return this._facebookProfileID
	}
	set facebookProfileID(val) {
		this._facebookProfileID = val
	}
	get googleProfileID() {
		return this._googleProfileID
	}
	set googleProfileID(val) {
		this._googleProfileID = val
	}
	get linkedInProfileID() {
		return this._linkedInProfileID
	}
	set linkedInProfileID(val) {
		this._linkedInProfileID = val
	}
	get email() {
		return this._email
	}
	set email(val) {
		if(val) {
			this._email = validator.normalizeEmail(val)
		}
		else {
			return null;
		}
	}
	get isAdmin() {
		if(this._email === 'jbacon@zagmail.gonzaga.edu' || this._email === 'aegairsoft1@gmail.com')
			return true
		else
			return false
	}
	set isVerified(val) {
		return this._isVerified
	}
	get isVerified() {
		this._isVerified = validator.normalizeEmail(val)
	}
	get nameFirst() {
		return this._nameFirst
	}
	set nameFirst(val) {
		if(typeof(val) === 'string' && validator.isAlpha(val)) {
			this._nameFirst = val
		}
		else {
			throw new CustomError('Invalid entry...', 500, val)
		}
	}
	get nameLast() {
		return this._nameLast
	}
	set nameLast(val) {
		if(typeof(val) === 'string' && validator.isAlpha(val)) {
			this._nameLast = val
		}
		else {
			throw new CustomError('Invalid entry...', 500, val)
		}
	}
	get notifyOnMyCommentReplies() {
		return this._notifyOnMyCommentReplies
	}
	set notifyOnMyCommentReplies(val) {
		this._notifyOnMyCommentReplies = validatorUtil.normalizeBool(val)
	}
	get notifyOnMyCommentVotes() {
		return this._notifyOnMyCommentVotes
	}
	set notifyOnMyCommentVotes(val) {
		this._notifyOnMyCommentVotes = validatorUtil.normalizeBool(val)
	}
	get followingComments() {
		return this._followingComments
	}
	set followingComments(val) {
		this._followingComments = validatorUtil.normalizeArrayIDs(val)
	}
	get notifyOnNewArticles() {
		return this._notifyOnNewArticles
	}
	set notifyOnNewArticles(val) {
		this._notifyOnNewArticles = validatorUtil.normalizeBool(val)
	}
	get passwordHashAndSalt() {
		return this._passwordHashAndSalt
	}
	set passwordHashAndSalt(val) {
		this._passwordHashAndSalt = val
	}
	get dateLastAuthenticated() {
		return this._dateLastAuthenticated
	}
	set dateLastAuthenticated(val) {
		this._dateLastAuthenticated = val
	}
	async toJSONIncludingVirtuals({ includeSensitiveFields=[] } = {}) {
		var obj = await super.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields })
		obj.facebookProfileID = this.facebookProfileID
		obj.googleProfileID = this.googleProfileID
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.isAdmin = this.isAdmin
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		if(includeSensitiveFields.includes('passwordHashAndSalt'))
			obj.passwordHashAndSalt = this.passwordHashAndSalt
		obj.dateLastAuthenticated = this.dateLastAuthenticated
		obj.notifyOnMyCommentVotes = this.notifyOnMyCommentVotes
		obj.notifyOnMyCommentReplies = this.notifyOnMyCommentReplies
		obj.notifyOnNewArticles = this.notifyOnNewArticles
		obj.followingComments = this.followingComments
		return obj
	}
	toJSON({ includeSensitiveFields=[] } = {}) {
		var obj = super.toJSON({ includeSensitiveFields: includeSensitiveFields })
		obj.facebookProfileID = this.facebookProfileID
		obj.googleProfileID = this.googleProfileID
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.isAdmin = this.isAdmin
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		if(includeSensitiveFields.includes('passwordHashAndSalt')) obj.passwordHashAndSalt = this.passwordHashAndSalt
		obj.dateLastAuthenticated = this.dateLastAuthenticated
		obj.notifyOnMyCommentVotes = this.notifyOnMyCommentVotes
		obj.notifyOnMyCommentReplies = this.notifyOnMyCommentReplies
		obj.notifyOnNewArticles = this.notifyOnNewArticles
		obj.followingComments = this.followingComments
		return obj
	}
}