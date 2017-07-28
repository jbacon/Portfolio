var Document = require('../model/document');
var mongodb = require('mongodb');
var mongoUtil = require('../common/mongoUtil');
var validatorUtil = require('../common/validatorUtil')
var CustomError = require('../common/errorUtil');
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
		this._email = validator.normalizeEmail(val)
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
		if(typeof(val) === 'string' && validator.isAlpha(val)) {
			this._nameFirst = val
		}
		else {
			throw new CustomError('Invalid entry...', 500, val)
		}
	}
	get nameLast() {
		return this._nameLast;
	}
	set nameLast(val) {
		if(typeof(val) === 'string' && validator.isAlpha(val)) {
			this._nameLast = val
		}
		else {
			throw new CustomError('Invalid entry...', 500, val)
		}
	}
	get passwordHashAndSalt() {
		return this._passwordHashAndSalt;
	}
	set passwordHashAndSalt(val) {
		this._passwordHashAndSalt = val;
	}
	toJSON() {
		var obj = super.toJSON()
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
			throw new CustomError('Failed to create account. Parameter not instance of Account', 500, account)
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
			throw new CustomError('Failed to create account. Parameter not instance of Account', 500, account)
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
	static async editDetails({ _id, email, nameFirst, nameLast } = {}) {
		const result = await mongoUtil.getDB()
		.collection(Account.COLLECTION_NAME).updateOne(
			{
				_id: validatorUtil.normalizeID(_id)
			},
			{
				$set: {
					email: validator.normalizeEmail(email),
					nameFirst: (validator.isAlpha(nameFirst)) ? nameFirst : (()=> {throw new CustomError('Invalid entry...', 500, nameFirst);}),
					nameLast: (validator.isAlpha(nameLast)) ? nameLast : (()=> {throw new CustomError('Invalid entry...', 500, nameFirst);})
				}
			}
		);
		return result
	}
	static async createPassword({ _id, passwordHashAndSalt }={}) {
		const result = await mongoUtil.getDB()
		.collection(Account.COLLECTION_NAME).updateOne(
			{
				_id: validatorUtil.normalizeID(_id)
			},
			{
				$set: {
					passwordHashAndSalt: passwordHashAndSalt
				}
			}
		);
		return result
	}
}