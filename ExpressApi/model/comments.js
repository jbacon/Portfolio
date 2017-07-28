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
	constructor(comment) {
		// Use Set methods to perform validation
		// Set Default/Initial values
		super(comment);
		this.accountID = comment.accountID;
		this._account = (comment._account) ? new Account(comment._account) : undefined;
		this.text = comment.text || null
		this.articleID = comment.articleID;
		this.parentCommentID = comment.parentCommentID || null
		this.upVoteAccountIDs = comment.upVoteAccountIDs || []
		this.downVoteAccountIDs = comment.downVoteAccountIDs || []
		this.flags = comment.flags || []
		this.removed = comment.removed || null
		this.childCommentIDs = comment.childCommentIDs || []
	}
	get accountID() {
		return this._accountID;
	}
	set accountID(val) {
		this._accountID = validatorUtil.normalizeID(val)
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
					const accounts = await Account.read({
						query: {
							_id: this.accountID
						},
						pageSize: 1,
						pageNum: 1
					})
					this._account = accounts[0]
					return accounts[0];
				}
			}
			else {
				return null;
			}
            // return await someAsyncOperation();
        })();
	}
	get text() {
		return this._text;
	}
	set text(val) {
		this._text = val
	}
	get articleID() {
		return this._articleID;
	}
	set articleID(val) {
		this._articleID = validatorUtil.normalizeID(val)
	}
	get parentCommentID() {
		return this._parentCommentID;
	}
	set parentCommentID(val) {
		this._parentCommentID = validatorUtil.normalizeID(val, { allowNullable: true })
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
	get childCommentIDs() {
		return this._childCommentIDs;
	}
	set childCommentIDs(val) {
		this._childCommentIDs = validatorUtil.normalizeArrayIDs(val)
	}
	async toObjectWithVirtuals() {
		var obj = super.toJSON()
		obj.accountID = this.accountID.toHexString();
		const account = await this.account;
		obj.account = (account) ? account.toJSON() : null;
		obj.text = this.text;
		obj.articleID = this.articleID.toHexString();
		obj.parentCommentID = (this.parentCommentID) ? this.parentCommentID.toHexString() : null;
		obj.upVoteAccountIDs = this.upVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.downVoteAccountIDs = this.downVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.flags = this.flags.map((objectID) => { return objectID.toHexString() });
		obj.removed = (this.removed) ? this.removed.toHexString() : null;
		obj.childCommentIDs = this.childCommentIDs.map((objectID) => { return objectID.toHexString() });
		return obj;
	}
	toJSON() {
		var obj = super.toJSON()
		obj.accountID = this.accountID.toHexString();
		obj.text = this.text;
		obj.articleID = this.articleID.toHexString();
		obj.parentCommentID = (this.parentCommentID) ? this.parentCommentID.toHexString() : null;
		obj.upVoteAccountIDs = this.upVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.downVoteAccountIDs = this.downVoteAccountIDs.map((objectID) => { return objectID.toHexString() });
		obj.flags = this.flags.map((objectID) => { return objectID.toHexString() });
		obj.removed = (this.removed) ? this.removed.toHexString() : null
		obj.childCommentIDs = this.childCommentIDs.map((objectID) => { return objectID.toHexString() });
		return obj;
	}
	static async create({ comment } = {}) {
		if(!(comment instanceof Comment))
			throw new CustomError('Parameter not instance of Comment', 500, comment)
		// Try CREATE!
		const result = await super.create({
			doc: comment
		})
		// If new comment has a PARENT, then add new ID to the PARENTS childCommentList (for purpose as secondary search criteria)
		if(result.ops[0].parentCommentID) {
			Comment.addChildCommentID({
				_id: result.ops[0].parentCommentID.toString(),
				childCommentID: result.ops[0]._id
			})
		}
		const newComment = new Comment(result.ops[0])
		return newComment
	}
	static async read({ id=undefined, articleID=undefined, parentCommentID=undefined, start=undefined, pageSize=10, sortOrder=-1/*Ascending*/, pageNum=1, skipOnPage=0 } = {}) {
		//Build match query (based on paramaters)
		const match = {}
		if(id !== undefined) {
			match._id = validatorUtil.normalizeID(id, { allowNullable: true })
		}
		else { // IF ID PROVIDED, then START IS IRRELEVANT TO QUERY!
			var startObject;
			if(start === 'newest')
				startObject = mongodb.ObjectID()
			else 
				startObject = validatorUtil.normalizeID(start)
			if(sortOrder === -1) //New -> Old
				match._id = { $lte: startObject }
			else if(sortOrder === 1) //Old -> New
				match._id = { $gt: startObject };
		}
		if(articleID !== undefined) {
			match.articleID = validatorUtil.normalizeID(articleID).toHexString()
		}
		if(parentCommentID !== undefined) {
			match.parentCommentID = validatorUtil.normalizeID(parentCommentID, { allowNullable: true })
			match.parentCommentID = (match.parentCommentID) ? match.parentCommentID.toHexString() : match.parentCommentID
		}
		const results = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME)
			.aggregate([])
			.match(match)
			.sort({
				_id: sortOrder
			})
			.skip(parseInt(pageSize) * (parseInt(pageNum) - 1))
			.limit(parseInt(pageSize))
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
		const sliced = results.slice(skipOnPage);
		const comments = sliced.map((result) => { return new Comment(result) })
		return comments //Skip On Page
	}
	static async update({ comment } = {}) {
		if(!(comment instanceof Comment))
			throw new CustomError('Failed to create document. Parameter not instance of Comment', 500, comment)
		const result = await super.update({
			doc: comment
		})
		return result;
	}
	static async delete({ _id } = {}) {
		const result = await super.delete( {
			_id: _id,
			collection: Comment.COLLECTION_NAME
		});
		return result
	}
	static async addChildCommentID({ _id, childCommentID } = {}) {
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(_id)
				},
				{
					$addToSet: {
						childCommentIDs: validatorUtil.normalizeID(childCommentID) 
					}
				}
			);
		return result
	}
	static async userDownVote({ _id, accountID } = {}) {
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(_id)  
				},
				{
					$addToSet: {
						downVoteAccountIDs: validatorUtil.normalizeID(accountID) 
					}
				}
			);
		return result;
	}
	static async userUpVote({ _id, accountID } = {}) {
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(_id)  
				},
				{
					$addToSet: {
						upVoteAccountIDs: validatorUtil.normalizeID(accountID) 
					}
				}
			);
		return result
	}
	static async flag({ _id, accountID } = {}) {
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(_id) 
				},
				{
					$addToSet: {
						flags: validatorUtil.normalizeID(accountID)
					}
				}
			);
		return result;
	}
	static async remove({ _id, accountID } = {}) {
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: validatorUtil.normalizeID(_id) 
				},
				{
					$set: { 
						removed: validatorUtil.normalizeID(accountID)
					}
				}
			);
		return result
	}
}