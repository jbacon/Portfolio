var mongoUtil = require('../common/mongoUtil');
var Document = require('../model/document');
var Account = require('../model/accounts');
var validator = require('validator');
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
		this.text = comment.text;
		this.articleID = comment.articleID;
		this.parentCommentID = comment.parentCommentID
		this.upVoteAccountIDs = comment.upVoteAccountIDs
		this.downVoteAccountIDs = comment.downVoteAccountIDs
		this.flags = comment.flags
		this.removed = comment.removed
		this.childCommentIDs = comment.childCommentIDs
	}
	get accountID() {
		return this._accountID;
	}
	set accountID(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._accountID = null;
		}
		else if(mongodb.ObjectID.isValid(val)) {
			var objectID = mongodb.ObjectID(val)
			this._accountID = objectID;
		}
		else {
			throw new TypeError('Invalid entry for accountID: '+val)
		}
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
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._text = null;
		}
		else if(typeof(val) === 'string') {
			this._text = val;
		}
		else {
			throw new TypeError('Invalid entry for text: '+val)
		}
	}
	get articleID() {
		return this._articleID;
	}
	set articleID(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._articleID = null;
		}
		else if(mongodb.ObjectID.isValid(val)) {
			var objectID = mongodb.ObjectID(val)
			this._articleID = objectID;
		}
		else {
			throw new TypeError('Invalid entry for articleID: '+val)
		}
	}
	get parentCommentID() {
		return this._parentCommentID;
	}
	set parentCommentID(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._parentCommentID = null;
		}
		else if(mongodb.ObjectID.isValid(val)) {
			var objectID = mongodb.ObjectID(val)
			this._parentCommentID = objectID;
		}
		else {
			throw new TypeError('Invalid entry for parentCommentID: '+val)
		}
	}
	get upVoteAccountIDs() {
		return this._upVoteAccountIDs;
	}
	set upVoteAccountIDs(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '')
			this._upVoteAccountIDs = [];
		else if(val instanceof Array)
			this._upVoteAccountIDs = val;
		else
			throw new TypeError('Invalid entry for val: '+val)
	}
	get downVoteAccountIDs() {
		return this._downVoteAccountIDs;
	}
	set downVoteAccountIDs(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '')
			this._downVoteAccountIDs = [];
		else if(val instanceof Array)
			this._downVoteAccountIDs = val;
		else
			throw new TypeError('Invalid entry for... val: '+val)
	}
	get flags() {
		return this._flags;
	}
	set flags(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '')
			this._flags = [];
		else if(val instanceof Array)
			this._flags = val;
		else
			throw new TypeError('Invalid entry for... val: '+val)
	}
	get removed() {
		return this._removed;
	}
	set removed(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '')
			this._removed = null;
		else if(mongodb.ObjectID.isValid(val))
			this._removed = val;
		else
			throw new TypeError('Invalid entry for... val: '+val)
	}
	get childCommentIDs() {
		return this._childCommentIDs;
	}
	set childCommentIDs(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '')
			this._childCommentIDs = [];
		else if(val instanceof Array)
			this._childCommentIDs = val
		else
			throw new TypeError('Invalid entry for... val: '+val)
	}
	async toObjectWithVirtuals() {
		var obj = super.toObject()
		obj.accountID = this.accountID;
		const account = await this.account;
		obj.account = (account) ? account.toObject() : null;
		obj.text = this.text;
		obj.articleID = this.articleID;
		obj.parentCommentID = this.parentCommentID;
		obj.upVoteAccountIDs = this.upVoteAccountIDs;
		obj.downVoteAccountIDs = this.downVoteAccountIDs;
		obj.flags = this.flags;
		obj.removed = this.removed;
		obj.childCommentIDs = this.childCommentIDs;
		return obj;
	}
 	toObject() {
		var obj = super.toObject()
		obj.accountID = this.accountID;
		obj.text = this.text;
		obj.articleID = this.articleID;
		obj.parentCommentID = this.parentCommentID;
		obj.upVoteAccountIDs = this.upVoteAccountIDs;
		obj.downVoteAccountIDs = this.downVoteAccountIDs;
		obj.flags = this.flags;
		obj.removed = this.removed;
		obj.childCommentIDs = this.childCommentIDs;
		return obj
	}
	static async create({ comment } = {}) {
		if(!(comment instanceof Comment))
			throw new Error('Parameter not instance of Comment')
		// Try CREATE!
		const result = await super.create({
			doc: comment
		})
		// If new comment has a PARENT, then add new ID to the PARENTS childCommentList (for purpose as secondary search criteria)
		if(result.ops[0].parentCommentID) {
			Comment.addChildComments({
				_id: result.ops[0].parentCommentID.toString(),
				childCommentIDs: [ result.ops[0]._id ]
			})
		}
		const newComment = new Comment(result.ops[0])
		return newComment
	}
	static async read({ id=undefined, articleID=undefined, parentCommentID=undefined, start=undefined, pageSize=10, sortOrder=-1/*Ascending*/, pageNum=1, skipOnPage=0 } = {}) {
		//Build match query (based on paramaters)
		const match = {}
		if(id !== undefined) { 
			if(id === 'null' || id === '' || id === null)
				match._id = null
			else if(mongodb.ObjectID.isValid(id))
				match._id = mongodb.ObjectID(id);
			else
				throw new Error('Query parameter ID invalid for value: '+ID)
		}
		else { // IF ID PROVIDED, then START IS IRRELEVANT TO QUERY!
			var startObject;
			if(start === 'newest')
				startObject = mongodb.ObjectID()
			else if(start !== undefined && start !== null && start !== 'null' && start !== 'undefined' && mongodb.ObjectID.isValid(start))
				startObject = mongodb.ObjectID(start)
			else
				throw new Error('Query parameter start invalid for value: '+start)
			if(sortOrder === -1) //New -> Old
				match._id = { $lte: startObject }
			else if(sortOrder === 1) //Old -> New
				match._id = { $gt: startObject };
		}
		if(articleID !== undefined) {
			if(articleID === 'null' || articleID === null)
				match.articleID = null
			else if(mongodb.ObjectID.isValid(articleID))
				match.articleID = mongodb.ObjectID(articleID);
			else
				throw new Error('Query parameter articleID invalid for value: '+articleID)
		}
		if(parentCommentID !== undefined) {
			if(parentCommentID === 'null' || parentCommentID === null)
				match.parentCommentID = null
			else if(mongodb.ObjectID.isValid(parentCommentID))
				match.parentCommentID = mongodb.ObjectID(parentCommentID);
			else
				throw new Error('Query parameter parentCommentID invalid for value: '+parentCommentID)
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
			throw new Error('Failed to create document. Parameter not instance of Comment')
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
	static async addChildComments({ _id, childCommentIDs } = {}) {
		const objectID = new mongodb.ObjectID(_id);
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: objectID
				},
				{
					$addToSet: {
						childCommentIDs: { $each: childCommentIDs }
					}
				}
			);
		return result
	}
	static async userDownVote({ _id, accountID } = {}) {
		const objectID = new mongodb.ObjectID(_id);
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: objectID 
				},
				{
					$addToSet: {
						downVoteAccountIDs: accountID
					}
				}
			);
		return result;
	}
	static async userUpVote({ _id, accountID } = {}) {
		const objectID = new mongodb.ObjectID(_id);
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: objectID 
				},
				{
					$addToSet: {
						upVoteAccountIDs: accountID
					}
				}
			);
		return result
	}
	static async flag({ _id, accountID } = {}) {
		const objectID = new mongodb.ObjectID(_id);
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: objectID 
				},
				{
					$addToSet: {
						flags: accountID
					}
				}
			);
		return result;
	}
	static async remove({ _id, accountID } = {}) {
		const objectID = new mongodb.ObjectID(_id);
		const result = await mongoUtil.getDB()
			.collection(Comment.COLLECTION_NAME).updateOne(
				{
					_id: objectID
				},
				{
					$set: { 
						removed: accountID 
					}
				}
			);
		return result
	}
}