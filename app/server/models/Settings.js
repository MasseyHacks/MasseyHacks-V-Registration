require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

var schema = new mongoose.Schema({

});

schema.statics.registrationOpen = function() {

    return true;

};

module.exports = mongoose.model('Settings', schema);