const DEFAULT_CONFIG_FILE='./configs.json.template'

const CONFIG_FILE = process.env.CONFIG_FILE || DEFAULT_CONFIG_FILE;

exports.ENVRIONMENTS = {
	DEV: 'development',
	PROD: 'production'
}


const configs = require('../'+exports.CONFIG_FILE);

exports.environment = process.env.NODE_ENV || configs.environment

exports.jwtSecret = process.env.JWT_SECRET || configs.jwtSecret

exports.adminEmail = process.env.ADMIN_EMAIL || configs.adminEmail

exports.adminNameFirst = process.env.ADMIN_NAME_FIRST || configs.adminNameFirst

exports.adminNameLast = process.env.ADMIN_NAME_LAST || configs.adminNameLast

exports.adminPassword = process.env.ADMIN_PASSWORD || configs.adminPassword

exports.serverPort = process.env.SERVER_PORT || configs.serverPort

exports.serverUrl = process.env.SERVER_URL || configs.serverUrl

exports.mongoDbUrl = process.env.MONGODB_URL || configs.mongoDbUrl

exports.facebookAppID = process.env.FACEBOOOK_APP_ID || configs.facebookAppID

exports.facebookAppSecret = process.env.FACEBOOK_APP_SECRET || configs.facebookAppSecret