var winston = require('winston');
var expressWinston = require('express-winston');

module.exports = class CustomError extends Error {
	constructor(message="Something went wrong!", status=500, obj={}, err={}) {
        super(message)
        Error.captureStackTrace(this, CustomError)
        this.status = status
        this.object = obj
        this.parentError = err
    }
    get object() {
    	return this._object
    }
    set object(val) {
    	this._object = val;
    }
    get parentError() {
    	return this._parentError
    }
    set parentError(val) {
    	this._parentError = val
    }
}