var Document = require('../model/document');
var validator = require('validator');

module.exports = class Account extends Document {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(account) {
		super(account);
		this.facebookProfileID = account.facebookProfileID
		this.email = account.email;
		this.nameFirst = account.nameFirst;
		this.nameLast = account.nameLast;
		this.passwordHashAndSalt = account.passwordHashAndSalt;
	}
	get facebookProfileID() {
		return this._facebookProfileID
	}
	set facebookProfileID(val) {
		this._facebookProfileID = val
	}
	get email() {
		return this._email;
	}
	set email(val) {
		if(val && validator.isEmail(val))
			this._email = validator.normalizeEmail(val);
		else
			throw new Error('Failed to construct account. Invalid entry for... val: '+val)
	}
	get isAdmin() {
		if(this._email === 'jbacon@zagmail.gonzaga.edu')
			return true
		else
			return false
	}
	get nameFirst() {
		return this._nameFirst;
	}
	set nameFirst(val) {
		if(val && validator.isAlpha(val))
			this._nameFirst = val;
		else
			throw new Error('Failed to construct account. Invalid entry for... val: '+val)
	}
	get nameLast() {
		return this._nameLast;
	}
	set nameLast(val) {
		if(val && validator.isAlpha(val))
			this._nameLast = val;
		else
			throw new Error('Failed to construct account. Invalid entry for... val: '+val)
	}
	get passwordHashAndSalt() {
		return this._passwordHashAndSalt;
	}
	set passwordHashAndSalt(val) {
		// if(typeof(val) === 'string') {
			this._passwordHashAndSalt = val;
		// }
		// else
		// 	throw new Error('Failed to construct account. Invalid entry for... val')
	}
	toObject() {
		var obj = super.toObject()
		obj.facebookProfileID = this.facebookProfileID
		obj.email = this.email;
		obj.isAdmin = this.isAdmin;
		obj.nameFirst = this.nameFirst;
		obj.nameLast = this.nameLast;
		obj.passwordHashAndSalt = this.passwordHashAndSalt;
		return obj
	}
	static async create({ account } = {}) {
		if(!(account instanceof Account)) 
			throw new Error('Failed to create account. Parameter not instance of Article')
		const result = await super.create({
			doc: account
		})
		const newAccountClass = new Account(result.ops[0])
		return newAccountClass;
	}
	static async read({ query={}, pageSize=10, pageNum=1 } = {}) {
		const docs = await super.read( {
			query: query,
			collection: Account.COLLECTION_NAME,
			pageSize: pageSize,
			pageNum: pageNum
		});
		// Map json to Account Object
		const accounts = docs.map((doc) => { return new Account(doc); })
		return accounts;
	}
	static async update({ account } = {}) {
		if(!(account instanceof Account))
			throw new Error('Failed to create account. Parameter not instance of Article')
		const result = await super.update({
			doc: account
		});
		const newAccountClass = new Account(result.ops[0])
		return newAccountClass
	}
	static async delete({ _id } = {}) {
		const result = await super.delete( {
			_id: _id,
			collection: Account.COLLECTION_NAME
		});
		const newAccountClass = new Account(result.ops[0])
		return newAccountClass
	}
}