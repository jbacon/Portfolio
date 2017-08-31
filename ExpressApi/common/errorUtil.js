var winston = require("winston")
var expressWinston = require("express-winston")

/**
 * @apiDefine CustomError
 *
 * @apiError CustomError Something went wrong.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *			 "status": "404",
 *       "message": "Somethign went wrong",
 *			 "object": "{}"
 *     }
 */
module.exports = class CustomError extends Error {
	constructor(message="Additional details not provided.", status=500, obj={}, err={}) {
		super(message)
		Error.captureStackTrace(this, CustomError)
		this.status = status
		this.object = obj
		this.parentError = err
	}
}