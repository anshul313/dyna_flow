var fs = require('fs');
var express = require('express');
var app = express();
var config = require('./config/config');

var port = process.env.PORT || 8080; // set our port

// var ObjectId = mongoose.Types.ObjectId;

// console.log(ObjectId.isValid("5679366fe1ed4563b5e0ed2a"));



// Bootstrap routes
var router = express.Router();

// require('./app/libs/connection').connect(function(err, db) {
// 	if (err) {
// 		console.log('mongodb connection error', err);
// 	} else {
// 		console.log('mongodb connected succussfuly');
// 	}
// });
// Bootstrap application settings
require('./config/express')(app);

//require('./config/amazon')(router, passport);
require('./config/routes')(router);
// app.use('/api', router);
app.use('/', express.static('public/'));

//Install application
if (process.env.NODE_ENV != 'test') {
	app.listen(port)
	console.log(process.env.NODE_ENV, 'Backend API\'s running on the port : ' + port);
}
module.exports = app;