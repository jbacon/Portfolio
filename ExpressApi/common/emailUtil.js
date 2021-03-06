const nodemailer = require('nodemailer')
var configUtil = require('../common/configUtil')
var validatorUtil = require('../common/validatorUtil')
var validator = require('validator')
var CustomError = require('../common/errorUtil')

exports.transporter = nodemailer.createTransport({
	// service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		type: 'OAuth2',
		user: 'aegairsoft1@gmail.com',
		clientId: configUtil.googleAppID,
		clientSecret: configUtil.googleAppSecret,
		refreshToken: configUtil.googleGmailRefreshToken,
		accessToken: configUtil.googleGmailAccessToken,
		expires: Date.now() + (5 * 60 * 1000)
	}
})
// exports.transporter.on('token', token => {
// 	console.log('A new access token was generated')
// 	console.log('User: %s', token.user)
// 	console.log('Access Token: %s', token.accessToken)
// 	// console.log('Refresh Token: %s', token.refreshToken);
// 	console.log('Expires: %s', new Date(token.expires))
// })
exports.sendEmail = function(email, next) {
	if(email instanceof exports.Email) {
		exports.transporter.sendMail(email.toJSON(), (error, info) => {
			if (error) {
				next(error)
			}
			else {
				console.log('Message %s sent: %s', info.messageId, info.response)
				next()
			}
		})
	}
	else {
		next(new CustomError('Value: '+email+', is not instance of Email'))
	}
}

exports.Email = class Email {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(email) {
		this.fromJSON(email)
	}
	get to() {
		return this._to
	}
	set to(val) {
		const emails = val.split(', ')
		var emailsNormalized = ''
		for(var i=0; i < emails.length; i++) {
			const emailNormalized = validator.normalizeEmail(emails[i])
			if(emailsNormalized) {
				emailsNormalized += emailNormalized
			}
			else {
				emailsNormalized += ', '+emailNormalized
			}
		}
		this._to = emailsNormalized
	}
	get from() {
		return this._from
	}
	set from(val) {
		this._from = val
		// this._from = validator.normalizeEmail(val)
	}
	get subject() {
		return this._subject
	}
	set subject(val) {
		this._subject = val
	}
	get text() {
		return this._text
	}
	set text(val) {
		this._text = val
	}
	get html() {
		return this._html
	}
	set html(val) {
		this._html = val
	}
	toJSON() {
		var obj = {}
		obj.to = this.to
		obj.from = this.from
		obj.subject = this.subject
		obj.text = this.text
		obj.html = this.html
		return obj
	}
	fromJSON(json){
		this.to = json.to
		this.from = json.from
		this.subject = json.subject
		this.text = json.text
		this.html = json.html
	}
}