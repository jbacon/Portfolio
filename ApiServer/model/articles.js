var mongoUtil = require('../common/mongoUtil');
var Document = require('../model/document');
var mongodb = require('mongodb');

module.exports = class Article extends Document {
	static get COLLECTION_NAME() {
		return 'articles'
	}
	constructor(article) {
		// Use Set methods to perform validation
		// Set Default/Initial values
		super(article);
		this.title = article.title;
		this.summary = article.summary;
		this.content = article.content;
		this.contentType = article.contentType;
	}
	get title() {
		return this._title;
	}
	set title(newTitle) {
		if(typeof(newTitle) === 'string')
			this._title = newTitle;
		else
			throw new Error('Failed to construct article. Invalid entry for... newTitle: '+newTitle)
	}
	get summary() {
		return this._summary;
	}
	set summary(newSummary) {
		if(typeof(newSummary) === 'string')
			this._summary = newSummary;
		else
			throw new Error('Failed to construct article. Invalid entry for... newSummary: '+newSummary)
	}
	get content() {
		return this._content;
	}
	set content(newContent) {
		if(typeof(newContent) === 'string')
			this._content = newContent;
		else
			throw new Error('Failed to construct article. Invalid entry for... newContent: '+newContent)
	}
	// Markdown, Markup, Html, etc..
	get contentType() {
		return this._contentType;
	}
	set contentType(newContentType) {
		if(typeof(newContentType) === 'string')
			this._contentType = newContentType;
		else
			throw new Error('Failed to construct article. Invalid entry for... newContentType: '+newContentType)
	}
	toObject() {
		var obj = super.toObject()
		obj.title = this.title;
		obj.summary = this.summary;
		obj.content = this.content;
		obj.contentType = this.contentType;
		return obj
	}
	static async create({ article } = {}) {
		if(!(article instanceof Article)) 
			throw new Error('Failed to create article. Parameter not instance of Article')
		return await super.create({ 
			doc: article
		})
	}
	static async read({ query={}, _id=undefined, pageSize=10, pageNum=1 } = {}) {
		return await super.read( {
			query: query,
			_id: _id,
			collection: Article.COLLECTION_NAME,
			pageSize: pageSize,
			pageNum: pageNum
		});
	}
	static async update({ article } = {}) {
		if(!(article instanceof Article))
			throw new Error('Failed to create article. Parameter not instance of Article')
		return await super.update({
			doc: article
		});
	}
	static async delete({ _id } = {}) {
		return await super.delete( {
			_id: _id,
			collection: Article.COLLECTION_NAME
		});
	}
}