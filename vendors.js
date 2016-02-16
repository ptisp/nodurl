require('colors');

var util = require('util');

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(util.format('mongodb://%s:%s/' + (process.env.MONGO_DB || 'nodurl'), process.env.MONGO_HOST || '127.0.0.1', 27017), function(err, db) {
  if (err) throw err;
  exports.mongo = db;
  console.log('(SYSTEM) Connected to MongoDB.'.green);
});
