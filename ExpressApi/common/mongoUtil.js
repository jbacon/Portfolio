var mongodb = require('mongodb')
var CustomError = require('../common/errorUtil');
var dbContext;

exports.connectDB = function (url, callback) {
  if(dbContext) {
    callback(new CustomError('Database context already exists', 500))
  }
  else {
    mongodb.MongoClient.connect(
        url,
        (error, db) => {
          if(error) {
            callback(error)
          }
          else  {
            dbContext = db;
            callback();
          }
        }
      );
  }
}
exports.closeDB = function(callback) {
  dbContext.close(function(err, result) {
    callback(err, result);
  })
}
exports.getDB = function() {
  if(dbContext) {
    return dbContext
  }
  else {
    throw new CustomError('Database context does not exist.', 500)
  }
}
exports.configureDB = function(callback) {
  if(dbContext) {
    // dbContext.createIndex('accounts', { email: 1 }, { unique: true });
    callback()
  }
  else{
    callback(new CustomError('Database content does not exist.', 500))
  }
}