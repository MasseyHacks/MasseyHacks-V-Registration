require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

var schema = new mongoose.Schema({

    name : {
        type: String,
        required: true
    },
    code : {
        type: String,
        required: true
    },
    memberIDs : {
        type: [String]
    }

});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model('Team', schema);