var session = {};
var jwt = require('jsonwebtoken');
// var Users = tables.loudshoutModUsers;
var config = require('./../../config/config')

var response = {
	error: false,
	status: "",
	data: null,
	userMessage: ''
};
var sendResponse = function(res, status) {
	return res.status(status || 200).send(response);
}


session.checkV2Token = function(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers["authorization"];

	if (typeof bearerHeader !== 'undefined') {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;

	}

	var token = bearerToken || req.body.token || req.query.token;
	if (token === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NDc0MTY3NzMsImlkIjoiNTYzYTI5OTJlNjc2NmM1Y2ZmMDAwMDAyIiwib3JpZ19pYXQiOjE0NDczOTUxNzN9.mrklv_JV8jsTAXRNi2mhrXNR3q1AvdFzJnUXAntKKx8") {
		next();
	} else {
		response.userMessage = "Your session has been expired. Please relogin.";
		return sendResponse(res, 401);
	}
}

module.exports = session;