require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;


var schema = new mongoose.Schema({
    log: {
        type: [String]
    }
});

schema.statics.registrationOpen = function() {

    return true;

};

schema.statics.getLog = function(){
    this
        .findOne({})
        .exec(function (err, settings) {
            return settings.log;
        });
};


schema.statics.getPrivateSettings = function(callback){
    this
        .findOne({})
        .exec(callback);
};

schema.statics.getPublicSettings = function(callback){
    this
        .findOne({}).select('-log').select('-accumulator')
        .exec(callback);
};

module.exports = mongoose.model('Settings', schema);