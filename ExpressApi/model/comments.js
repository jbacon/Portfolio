var mongoUtil = require('../common/mongoUtil');
var Document = require('../model/document');
var Account = require('../model/accounts');
var validatorUtil = require('../common/validatorUtil')
var validator = require('validator');
var CustomError = require('../common/errorUtil');
var mongodb = require('mongodb');

module.exports = class Comment extends Document {
	static get COLLECTION_NAME() {
		return 'comments'
	}
	constructor(json) {
		// Set Default & Initials
		super(json)
		this.articleID = json.articleID
		this.children = json.children || []
		this.ancestors = json.ancestors || []
		this.parent = json.parent || null
		this._parentComment = (json.parentComment) ? Comment.fromJSON(json.parentComment) : null
		this.text = json.text
		this.accountID = json.accountID || null
		this._account = (json.account) ? Account.fromJSON(json.account) : null
		this.email = json.email || null
		this.nameFirst = json.nameFirst || null
		this.nameLast = json.nameLast || null
		this.notifyOnReply = json.notifyOnReply || true
		this.upVoteAccountIDs = json.upVoteAccountIDs || []
		this.downVoteAccountIDs = json.downVoteAccountIDs || []
		this.flags = json.flags || []
		this.removed = json.removed || null
	}
	get accountID() {
		return this._accountID;
	}
	set accountID(val) {
		if(val && (this.email || this.nameFirst || this.nameLast))
			throw new CustomError('Invalid accountID. You cannot set accountID when any one of: email, nameFirst, or nameLast... have already been set to values.' )
		this._accountID = validatorUtil.normalizeID(val, { allowNullable: true })
	}
	// Virtual Account
	get account() {
		return (async () => {
			if(this.accountID) {
				if(this._account && this._account._id === this.accountID) {
					return this._account
				}
				else {
					// Refresh/Search account (mismatch ID)
					const result = await mongoUtil.getDB()
						.collection(Account.COLLECTION_NAME)
						.findOne({
							_id: this.accountID
						});
					return Account.fromJSON(result);
				}
			}
			else {
				return null;
			}
    })();
	}
	get text() {
		return this._text;
	}
	set text(val) {
		this._text = val
	}
	get email() {
		return this._email;
	}
	set email(val) {
		if(val && this.accountID)
			throw new CustomError('Invalid email. You cannot set email when accountID has already been set to a value.')
		if(!val)
			this._email = null
		else
			this._email = validator.normalizeEmail(val)
	}
	get nameFirst() {
		return this._nameFirst;
	}
	set nameFirst(val) {
		if(val && this.accountID)
			throw new CustomError('Invalid nameFirst. You cannot set nameFirst when accountID has already been set to a value.')
		this._nameFirst = val
	}
	get nameLast() {
		return this._nameLast;
	}
	set nameLast(val) {
		if(val && this.accountID)
			throw new CustomError('Invalid nameLast. You cannot set nameLast when accountID has already been set to a value.')
		this._nameLast = val
	}
	get notifyOnReply() {
		return this._notifyOnReply
	}
	set notifyOnReply(val) {
		this._notifyOnReply = validatorUtil.normalizeBool(val)
	}
	get articleID() {
		return this._articleID;
	}
	set articleID(val) {
		this._articleID = validatorUtil.normalizeID(val)
	}
	get parent() {
		return this._parent;
	}
	set parent(val) {
		const temp = validatorUtil.normalizeID(val, { allowNullable: true })
		if(temp && this.ancestors.length > 0 && !temp.equals(this.ancestors[this.ancestors.length - 1]))
			throw new CustomError('Invalid parent value. Parent was not present on the end of the ancestor list.')
		this._parent = temp
	}
	// Virtual Parent Comment
	get parentComment() {
		return (async () => {
			if(this.parent) {
				if(this._parentComment && this._parentComment._id === this.parent) {
					return this._parentComment
				}
				else {
					// Refresh/Search account (mismatch ID)
					const result = await mongoUtil.getDB()
						.collection(Comment.COLLECTION_NAME)
						.findOne({
							_id: this.parent
						});
					return Comment.fromJSON(result);
				}
			}
			else {
				return null;
			}
    })();
	}
	get upVoteAccountIDs() {
		return this._upVoteAccountIDs;
	}
	set upVoteAccountIDs(val) {
		this._upVoteAccountIDs = validatorUtil.normalizeArrayIDs(val)
	}
	get downVoteAccountIDs() {
		return this._downVoteAccountIDs;
	}
	set downVoteAccountIDs(val) {
		this._downVoteAccountIDs = validatorUtil.normalizeArrayIDs(val)
	}
	get flags() {
		return this._flags;
	}
	set flags(val) {
		this._flags = validatorUtil.normalizeArrayIDs(val)
	}
	get removed() {
		return this._removed;
	}
	set removed(val) {
		this._removed = validatorUtil.normalizeID(val, { allowNullable: true })
	}
	get children() {
		return this._children;
	}
	set children(val) {
		this._children = validatorUtil.normalizeArrayIDs(val)
	}
	get ancestors() {
		return this._ancestors;
	}
	set ancestors(val) {
		const temp = validatorUtil.normalizeArrayIDs(val)
		if(this.parent && temp.length < 1)
			throw new CustomError('Invalid ancestors list. Ancestors is empty but parent is not.')
		if(this.parent && !this.parent.equals(temp[temp.length - 1]))
			throw new CustomError('Invalid ancestors list. Ancestors last item is not equivalent to the parent.')
		this._ancestors = temp
	}
	async toJSONIncludingVirtuals({ includeSensitiveFields=[] } = {}) {
		var obj = await super.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields })
		obj.accountID = (this.accountID) ? this.accountID.toHexString() : this.accountID
		const account = await this.account;
		if(account)
			obj.account = await account.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields.filter((field) => field.startsWith('account.')).map((field) => { return field.substr(8) }) })
		obj.text = this.text
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		obj.notifyOnReply = this.notifyOnReply
		obj.articleID = this.articleID.toHexString();
		obj.parent = (this.parent) ? this.parent.toHexString() : this.parent;
		const parentComment = await this.parentComment;
		if(parentComment)
			obj.parentComment = await parentComment.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields.filter((field) => field.startsWith('parentComment.')).map((field) => { return field.substr(8) }) })
		obj.upVoteAccountIDs = this.upVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.downVoteAccountIDs = this.downVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.flags = this.flags.map((objectID) => { return objectID.toHexString() });
		obj.removed = (this.removed) ? this.removed.toHexString() : this.removed;
		obj.children = this.children.map((objectID) => { return objectID.toHexString() });
		obj.ancestors = this.ancestors.map((objectID) => { return objectID.toHexString() });
		return obj;
	}
	toJSON({ includeSensitiveFields=[] } = {}) {
		var obj = super.toJSON({ includeSensitiveFields: includeSensitiveFields })
		obj.accountID = (this.accountID) ? this.accountID.toHexString() : this.accountID
		obj.text = this.text;
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		obj.notifyOnReply = this.notifyOnReply
		obj.articleID = this.articleID.toHexString();
		obj.parent = (this.parent) ? this.parent.toHexString() : this.parent;
		obj.upVoteAccountIDs = this.upVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.downVoteAccountIDs = this.downVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.flags = this.flags.map((objectID) => { return objectID.toHexString() });
		obj.removed = (this.removed) ? this.removed.toHexString() : this.removed
		obj.children = this.children.map((objectID) => { return objectID.toHexString() });
		obj.ancestors = this.ancestors.map((objectID) => { return objectID.toHexString() });
		return obj;
	}
}