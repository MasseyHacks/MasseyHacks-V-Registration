require('dotenv').load();

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt-nodejs');
const validator = require('validator');
const jwt       = require('jsonwebtoken');

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

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model('Team', schema);