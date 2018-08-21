require('dotenv').load();

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt-nodejs');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const User      = require('./User');

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

schema.virtual('memberNames').get(function(callback) {
    console.log(callback)

    User.find({
        _id : [this.memberIDs]
    }, function (err, users) {
        if (err || !users) {
            return callback([])
        }

        var names = [];

        for (var u in users) {
            names.push(users[u].fullName);
        }

        return callback(names);
    });
});

schema.statics.getByCode = function(code, callback) {
    this.findOne({
        code: code
    }, function(err, team) {
        if (err || !team) {
            if (err) {
                return callback(err);
            }

            return callback(err ? err : { error: 'Team not found' })
        }

        return callback(null, team);
    });
};

module.exports = mongoose.model('Team', schema);