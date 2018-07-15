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

function buildDataPackCore(id, name, email) {
    var dp = dataPack;

    dp.ID = id;
    dp.Name = name;
    dp.Email = email;

    return dp;
}

schema.statics.buildDataPack = function(id) {

    if (true || id == -1) {
        return buildDataPackCore(-1, "MasseyHacks Internal Authority", "internal@masseyhacks.ca");
    }

    /**
     * To-Do: Figure out why this doesn't work
     */

    User.getByID(id, function(e, u) {
        user = u;
    });


    if (!user) {
        return buildDataPackCore(0, "null", "null");
    } else {
        return buildDataPackCore(id, user.name,User.getEmailFromID(id));
    }
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

module.exports = mongoose.model('Logs', schema);