var validator = require('validator');
var mongodb = require('mongodb');
var CustomError = require('../common/errorUtil');

exports.isValidNull = function(val) {
	try {
		exports.normalizeNull(val)
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeNull = function(val) {
	if(val === undefined || val === null || val === '' || val === "" || 'null' || 'undefined')
		return null
	throw new CustomError('Value ('+val+') can not be converted to null')
}
/* return bool (assumes normalized already) */
exports.isValidID = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeID(val, { allowNullable: allowNullable });
		return true
	}
	catch(err) {
		return false
	}
}
/* return value or throw error if no convertable */
exports.normalizeID = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	else if(val instanceof mongodb.ObjectID)
		return val
	else if(mongodb.ObjectID.isValid(val))
		return mongodb.ObjectID(val)
	throw new CustomError('Value ('+val+') can not be converted to Mongo ObjectID')
}
exports.isValidArrayIDs = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeArrayIDs(val, { allowNullable: allowNullable })
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeArrayIDs = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	else if(val instanceof Array) {
		return val.map((id) => {
			return normalizeID(id)
		})
	}
	throw new CustomError('Value ('+val+') can not be converted to Mongo ObjectID')
}
exports.isValidDate = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeDate(val)
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeDate = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	else if(val instanceof Date)
		return val
	else if(Date.parse(val))
		return Date.parse(val);
	throw new CustomError('Value ('+val+') can not be converted to Date')
}