exports.CONFIG_FILE = process.env.CONFIG_FILE || './configs.json.template';
var configFile = require('../'+exports.CONFIG_FILE);

exports.ENVIRONMENTS = {
	PROD: 'prod',
	DEV: 'dev'
}
exports.environment = process.env.ENVIRONMENT || configFile.environment || exports.OPTIONS.ENV.DEV

exports.jwtSecret = process.env.JWT_SECRET || configFile.jwtSecret || 'This is my default super secret password!'

exports.adminEmail = process.env.ADMIN_EMAIL || configFile.adminEmail || 'jbacon@zagmail.gonzaga.edu'

exports.adminNameFirst = process.env.ADMIN_NAME_FIRST || configFile.adminNameFirst || 'Josh'

exports.adminNameLast = process.env.ADMIN_NAME_LAST || configFile.adminNameLast || 'Bacon'

exports.adminPassword = process.env.ADMIN_PASSWORD || configFile.adminPassword || 'password'

exports.serverPort = process.env.SERVER_PORT || configFile.serverPort || '3000'

exports.serverUrl = process.env.SERVER_URL || configFile.serverUrl || 'http://localhost'

exports.mongoDbUrl = process.env.MONGODB_URL || configFile.mongoDbUrl || 'mongodb://172.17.0.2:27017/portfolio'

exports.facebookAppID = process.env.FACEBOOOK_APP_ID || configFile.facebookAppID || null

exports.facebookAppSecret = process.env.FACEBOOK_APP_SECRET || configFile.facebookAppSecret || null