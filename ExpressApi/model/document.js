var mongoUtil = require('../common/mongoUtil');
var validator = require('validator');
var validatorUtil = require('../common/validatorUtil')
var CustomError = require('../common/errorUtil');
var mongodb = require('mongodb');

module.exports = class Document {
	constructor(doc) {
		// Use Set methods to perform validation
		// Set Default/Initial values
		this._id = doc._id || new mongodb.ObjectID();
		this.dateUpdated = doc.dateUpdated || new Date();
		this.dateCreated = doc.dateCreated || new Date();
	}
	get _id() {
		return this.__id;
	}
	set _id(val) {
		this.__id = validatorUtil.normalizeID(val)
	}
	get dateUpdated() {
		return this._dateUpdated;
	}
	set dateUpdated(val) {
		this._dateUpdated = validatorUtil.normalizeDate(val)
	}
	get dateCreated() {
		return this._dateCreated;
	}
	set dateCreated(val) {
		this._dateCreated = validatorUtil.normalizeDate(val)
	}
	/* This enforces use of get methods for creating Object.
		Otherwise "_" instance variables would be used.
		Object to be stored in Mongo. */
	toJSON() {
		var obj = {}
		obj._id = this._id;
		obj.dateUpdated = this.dateUpdated;
		obj.dateCreated = this.dateCreated;
		return obj
	}
	static async create({ doc } = {}) {
		if(!(doc instanceof Document))
			throw new CustomError('Invalid document', 500, doc)
		var results = await mongoUtil.getDB()
			.collection(doc.constructor.COLLECTION_NAME)
			.insertOne(doc.toJSON());
		return results;
	}
	static async delete({ _id, collection } = {}) {
		var objectID = new mongodb.ObjectID(_id);
		var results = await mongoUtil.getDB()
			.collection(collection)
			.deleteOne( { _id: objectID });
		return results;
	}
	static async update({ doc } = {}) {
		if(!(doc instanceof Document))
			throw new CustomError('Invalid document', 500, doc)
		var docJson = doc.toJSON()
		var results = await mongoUtil.getDB()
			.collection(doc.constructor.COLLECTION_NAME)
			.updateOne({ _id: doc._id }, docJson)
		return results;
	}
	static async read({ query={}, collection, pageSize=10, pageNum=1 } = {}) {
		var results = await mongoUtil.getDB()
			.collection(collection)
			.find(query)
			.skip(parseInt(pageSize) * (parseInt(pageNum) - 1))
			.limit(parseInt(pageSize))
			.toArray();
		return results;
	}
}