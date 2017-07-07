var express = require('express');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // Middware parses request.body before 
var assert = require('assert');
var routesIndex = require('./routes/index');
var routesArticles = require('./routes/articles');
var routesComments = require('./routes/comments');
var routesAuth = require('./routes/auth');
var routesAccounts = require('./routes/accounts');
var commonLogging = require('./common/loggingUtil');
var commonMongo = require('./common/mongoUtil'); 
var commonMarkdown = require('./common/markdownUtil'); 
var commonAuth = require('./common/authUtil'); 
var commonConfigs = require('./common/configUtil');
/* 
Generate Client Javascript Functions that generate reusable HTML components.
Poor man's React.js? I want to avoid integrating a front-end framework at this point. 
This method makes SPA design simple and easy, since the API server will only be
returning json data not partials or HTML elements.
*/
/* Connect MongoDB */
commonMongo.connectDB(commonConfigs.mongoDbUrl,
  (error) => {
    if(error) throw error
    commonMongo.configureDB(
      (error) => {
      if(error) throw error;
    })
  });
/* Configure Session Store w/ MongoDB */
/* Not using sessions for this site, JWT only
var sessionStore = new MongoDBStore(
{
  uri: config.mongoDbUrl,
  collection: 'sessions'
});
sessionStore.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});
var sessionMiddleware = session({
  secret: config.sessionSecret,
  cookie: {
    maxAge: 1000 * 60 * 5 // 5 minutes
  },
  store: sessionStore,
  resave: true,
  saveUninitialized: true
});
*/

var app = express();
app.disable('x-powered-by');
app.use(express.static('./public'));
// app.use(sessionMiddleware);
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Extended true always nested objects in req.body
app.use(cookieParser());
app.use(commonAuth.getPassport().initialize());
//app.use(commonAuth.getPassport().session());
// REQUEST LOGGING (BEFORE the routers)
app.use(commonLogging.requestLoggingMiddleware);
// MY MIDDLEWARE
// app.use(commonAuth.checkAuthenticated);
// ROUTERS
app.use('/', routesIndex);
app.use('/comments', routesComments);
app.use('/article', routesArticles);
app.use('/auth', routesAuth);
app.use('/account', routesAccounts);
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// ERROR LOGGING (AFTER routers BEFORE handlers)
app.use(commonLogging.routerLoggingMiddleware);
// ERROR HANDLERS
if (commonConfigs.environment == commonConfigs.ENVIRONMENTS.DEV) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      status: err.status || 500,
      message: err.message || 'No message...',
      stack: err.stack || 'No stack trace..'
    });
  });
}
else {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      status: err.status || 500,
      message: err.message || 'No message...'
    });
  });
}
module.exports = app;