// var mongoose = require('mongoose');
// var loudshoutPost = mongoose.model('loudshoutPost');
var database = require('./../libs/connection');
var coconut = require('coconutjs');
var session = require('./../libs/session');
var ObjectId = require('mongodb').ObjectId;
var response = {
    error: false,
    status: 200,
    userMessage: '',
    errors: null,
    data: null,
};

var NullResponseValue = function() {
    response = {
        error: false,
        status: 200,
        userMessage: '',
        errors: null,
        data: null,
    };
    return true;
};

var SendResponse = function(res) {
    res.status(response.status);
    res.send(response);
    NullResponseValue();
};

/*===========================================
***   Services  ***
=============================================*/
var methods = {};
module.exports.controller = function(router) {


    router
        .route('/dopost')
        .post(session.checkV2Token, methods.doPost);

}

/*===========================================
***  End Services  ***
=============================================*/

/*============
***     ***
==============*/

methods.doPost = function(req, res) {
    //Check for POST request errors.
    req.checkBody('type', 'type is required.').notEmpty();
    req.checkBody('sourceUrl', 'sourceUrl is required.').notEmpty();
    req.checkBody('range', 'range is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        response.error = true;
        response.code = 400;
        response.errors = errors;
        response.userMessage = 'Validation errors';
        return res.send(SendResponse(res));
    } else {
        //Database functions here
        var requestData = req.body;
        if (requestData.type != "Video" && requestData.type != "Meme") {
            response.error = true;
            response.data = "";
            response.status = 400;
            response.userMessage = "type should be Video or Meme";
            return (SendResponse(res));
        } else if (requestData.type == "Video") {
            var len = requestData.sourceUrl.length - 3;
            var ext = requestData.sourceUrl.substring(len)
            if (ext != "mp4") {
                response.error = true;
                response.data = "";
                response.status = 400;
                response.userMessage = "extension should be mp4";
                return (SendResponse(res));
            }
        } else if (requestData.type == "Meme") {
            var len = requestData.sourceUrl.length - 3;
            var ext = requestData.sourceUrl.substring(len)
            if (ext != "jpg" && ext != "png") {
                response.error = true;
                response.data = "";
                response.status = 400;
                response.userMessage = "extension should be jpg or png";
                return (SendResponse(res));

            }

        }
        var query = {
            baseCampType: "Basecamp",
            status: 1
        };
        var loudshoutBasecamps = database.collection('loudshoutBaseCamps');
        console.log(database);
        loudshoutBasecamps.find(query).sort({
            oldBasecampID: -1
        }).toArray(function(err, loudshoutBasecamps) {
            if (err) {
                response.error = true;
                response.data = "error";
                response.status = 500;
                response.userMessage = "server error";
                return (SendResponse(res));

            } else {
                var baseCamps = loudshoutBasecamps.length;
                if (requestData.range[0] > requestData.range[1] || requestData.range[1] > baseCamps) {
                    response.status = 400;
                    response.error = true;
                    response.userMessage = "range parameter invalid";
                    return (SendResponse(res));
                }
                var loudshoutPost = database.collection('loudshoutPost');
                // async.mapSeries(loudshoutBasecamps, function(basecamp, cb) {
                var baseCampsList = [];
                for (var i = requestData.range[0]; i < requestData.range[1]; i++) {
                    var basecamp = loudshoutBasecamps[i];
                    var avatar = Math.floor(Math.random() * (182 - 1 + 1) + 1);

                    var postData = new Object({
                        "_id": new ObjectId(),
                        "oldPostID": "",
                        "postText": requestData.postText || "",
                        "postTime": new Date(),
                        "sourceUrl": requestData.sourceUrl,
                        "thumbnailImageUrl": "",
                        "opinion": {
                            "multiChoice": false,
                            "optionCount": 0,
                            "options": [],
                            "answer": []
                        },
                        "type": requestData.type,
                        "upVotes": [],
                        "downVotes": [],
                        "flags": [],
                        "flagStatus": 0,
                        "favourites": [],
                        "shares": [],
                        "userID": "us-east-1:b14dee1f-5c9f-4b6c-b8ed-62dc6b010d91",
                        "baseCampID": basecamp.oldBasecampID,
                        "baseCampName": basecamp.baseCampName,
                        "channelID": "",
                        "channelName": "",
                        "avatar": avatar,
                        "deleteStatus": 0,
                        "isAdmin": 0,
                        "loc": {
                            "type": "Point",
                            "coordinates": [
                                0,
                                0
                            ]
                        },
                        "lat": 0,
                        "long": 0,
                        "likes": 0,
                        "belongsTo": "Basecamp",
                        "dislikes": 0,
                        "isModerator": true,
                        "Comments": [],
                        "activeUsers": [{
                            "_id": new ObjectId(),
                            "user": "us-east-1:b14dee1f-5c9f-4b6c-b8ed-62dc6b010d91",
                            "avatar": avatar
                        }],
                        "flagsCount": 0,
                        "favouritesCount": 0,
                        "sharesCount": 0,
                        "userPoints": 0,
                        "postGeoHash": 0
                    });
                    if (postData.type == "Video") {
                        var postID = postData._id;
                        var config = {
                            source: postData.sourceUrl,
                            webhook: "https://app.coconut.co/pings/507aa9cb/akshaykumar12527",
                            outputs: {
                                "jpg_320x480": "s3://AKIAI4EUEZSQYHVZ6T6Q:5LFgimjuusGdKxsyQPHP2SE0UN/y5m4RGR544kAj@loudshout-videos/thumbnails/" + postID + ".jpg, number=1"
                            },
                            api_key: "k-c229c67e425a3d48ff446890d2bd1496"
                        };

                        // err: = coconut.NewJob(config, "k-c229c67e425a3d48ff446890d2bd1496");
                        coconut.createJob(config, function(job) {
                            var postID = postID;
                            if (job.status == 'ok') {
                                postData.thumbnailImageUrl = "https://s3-ap-southeast-1.amazonaws.com/loudshout-videos/thumbnails/" + postID + ".jpg"
                                console.log(postData.thumbnailImageUrl);
                                console.log(job.id);
                            } else {
                                postData.thumbnailImageUrl = "https://s3-ap-southeast-1.amazonaws.com/loudshout-videos/thumbnails/" + postID + ".jpg"

                                console.log("err");
                            }
                        });
                        postData.thumbnailImageUrl = "https://s3-ap-southeast-1.amazonaws.com/loudshout-videos/thumbnails/" + postID + ".jpg"

                    }
                    loudshoutPost.insert(postData, function(err, data) {
                        if (err) {
                            response.error = true;
                            return (SendResponse(res));
                        }

                    });
                    baseCampsList.push(basecamp.baseCampName);

                }
                response.data = baseCampsList;
                response.userMessage = "Media created succussfuly";
                return (SendResponse(res));


            }
        });

    }
}

/*-----  End of doPost  ------*/