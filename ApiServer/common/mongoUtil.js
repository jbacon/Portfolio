var mongodb = require('mongodb')
var dbContext;

exports.connectDB = function (url, callback) {
  if(dbContext) {
    var error = new Error('Database context already exists')
    callback(error)
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
    throw new Error('Database context does not exist.')
  }
}
exports.configureDB = function(callback) {
  if(dbContext) {
    // dbContext.createIndex('accounts', { email: 1 }, { unique: true });
    callback()
  }
  else{
    var error = new Error('Database context does not exist.')
    callback(error)
  }
}