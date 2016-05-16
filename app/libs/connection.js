var MongoClient = require('mongodb')
	.MongoClient,
	url = 'mongodb://aarvee:aarvee%401234@128.199.116.241:12527/rest_service';
// Connect using MongoClient

var database = false;
var connect = function(done) {
	MongoClient.connect(url, function(err, db) {
		database = db;
		done(err, db);
	});
}
var getCollection = function(collectionName) {
	return database ? database.collection(collectionName) : false;

}
module.exports = {
	connect: connect,
	collection: getCollection
}