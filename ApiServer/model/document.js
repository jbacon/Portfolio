var mongoUtil = require('../common/mongoUtil');
var validator = require('validator');
var mongodb = require('mongodb');

module.exports = class Document {
	constructor(doc) {
		// Use Set methods to perform validation
		// Set Default/Initial values
		this._id = doc._id;
		this.dateUpdated = doc.dateUpdated
		this.dateCreated = doc.dateCreated
	}
	get _id() {
		return this.__id;
	}
	set _id(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this.__id = new mongodb.ObjectID();
		}
		else if(mongodb.ObjectID.isValid(val)) {
			var objectID = mongodb.ObjectID(val)
			this.__id = objectID;
		}
		else if(val instanceof mongodb.ObjectID) {
			this.__id = val;
		}
		else {
			throw new Error('Failed to construct document. Invalid entry for... val: '+val)
		}
	}
	get dateUpdated() {
		return this._name;
	}
	set dateUpdated(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._dateUpdated = new Date
		}
		else if(val instanceof Date)
			this._dateUpdated = val;
		else if(Date.parse(val))
			this._dateUpdated = Date.parse(val);
		else
			throw new Error('Failed to construct document. Invalid entry for... val: '+val)
	}
	get dateCreated() {
		return this._dateCreated;
	}
	set dateCreated(val) {
		if(val === undefined || val === null || val === 'null' || val === 'undefined' || val === '') {
			this._dateCreated = new Date
		}
		else if(val instanceof Date)
			this._dateCreated = val;
		else if(Date.parse(val))
			this._dateCreated = Date.parse(val);
		else
			throw new Error('Failed to construct document. Invalid entry for... val: '+val)
	}
	/* This enforces use of get methods for creating Object.
		Otherwise "_" instance variables would be used.
		Object to be stored in Mongo. */
	toObject() {
		var obj = {}
		obj._id = this._id;
		obj.dateUpdated = this.dateUpdated;
		obj.dateCreated = this.dateCreated;
		return obj
	}
	static async create({ doc } = {}) {
		if(!(doc instanceof Document))
			throw new Error('Invalid document')
		var results = await mongoUtil.getDB()
			.collection(doc.constructor.COLLECTION_NAME)
			.insertOne(doc.toObject());
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
			throw new Error('Invalid document')
		var results = await mongoUtil.getDB()
			.collection(doc.constructor.COLLECTION_NAME)
			.updateOne(doc.toObject())
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