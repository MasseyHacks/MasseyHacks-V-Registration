var mongoose = require('mongoose');
var User  = require('../models/User');

JWT_SECRET = process.env.JWT_SECRET;

var dataPack = {
    ID : {
        type: String,
        required: true
    },
    Name : {
        type: String,
        required: true
    },
    Email : {
        type: String,
        required: true
    }
};

var schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    from : dataPack,
    to : dataPack,
    message : {
        type: String,
        required: true
    }
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.virtual('timestampHuman').get(function() {
    return new Date(this.timestamp);
});

function buildLoggingCore(id, name, email) {
    var dp = dataPack;

    dp.ID = id;
    dp.Name = name;
    dp.Email = email;

    return dp;
}

// Builds object with core data
// Extracts data from mongo
// -> ID
// -> Full name
// -> Email
schema.statics.buildLoggingData = function(id, callback) {
    if (id == -1) {
        return callback(buildLoggingCore(-1, "MasseyHacks Internal Authority", "internal@masseyhacks.ca"));
    }

    User.getByID(id, function (err, user) {
        if (!user) {
            return callback(buildLoggingCore(id, "null name", "null email"));
        } else {
            return callback(buildLoggingCore(id, user.fullName, user.email));
        }
    });
};

schema.statics.getLog = function(callback){
    this
        .find({})
        .exec(function (err, log) {
            if (err || !log) {
                if (err) {
                    return callback(err);
                }

                return callback(null, { log : [] });
            }
            return callback(null, {log : log});
        });
};

module.exports = mongoose.model('LogEvent', schema);