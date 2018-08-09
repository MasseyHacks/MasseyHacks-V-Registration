require('dotenv').load();

const mongoose    = require('mongoose');
const bcrypt      = require('bcrypt-nodejs');
const validator   = require('validator');
const jwt         = require('jsonwebtoken');
const fields      = require('../models/data/UserFields');

JWT_SECRET = process.env.JWT_SECRET;

var schema = new mongoose.Schema(fields);

schema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

schema.methods.generateAuthToken = function () {
    return jwt.sign({id: this._id, type: 'authentication'}, JWT_SECRET, {
        expiresIn: 1209600
    });
};

schema.methods.generateVerificationToken = function() {
    return jwt.sign({id: this._id, type: 'verification'}, JWT_SECRET, {
        expiresIn: 3600
    });
};

schema.methods.generateResetToken = function() {
    return jwt.sign({id: this._id, type: 'password-reset'}, JWT_SECRET, {
        expiresIn: 3600
    });
};

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.statics.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function filterSensitive(user, permissionLevel) {
    var u = user.toJSON();

    // No one gets this...
    delete u.password;

    // Less than Owner
    if (permissionLevel < 5) {
        delete u.applicationAdmit;
        delete u.applicationReject;
    }

    // Less than Admin
    if (permissionLevel < 3) {
        delete u.applicationVotes;
        delete u.numVotes;
        delete u.status.admittedBy;
        delete u.lastUpdated;
    }

    // Mask status
    if (!user.status.statusReleased && permissionLevel < 3) {
        u.status.admitted = false;
        u.status.declined = false;
        u.status.waitlisted = false;
        u.status.rejected = false;
        u.status.waitlisted = false;
    }

    return u;
}

// Helper function
schema.statics.filterSensitive = function(user, permissionLevel) {
    return filterSenstive(user, permissionLevel);
};

schema.statics.getByID = function(id, callback, permissionLevel) {

    if (permissionLevel == null) {
        permissionLevel = 1;
    }

    this.findOne({
        _id:  id
    }, function(err, user) {
        if (err || !user) {
            if (err) {
                return callback(err);
            }

            return callback({ error: "Error: User not found." })
        }

        return callback(null, filterSensitive(user, permissionLevel));
    });
};

schema.statics.getByToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback({
                error: 'Error: Invalid Token'
            });
        }

        if (payload.type != 'authentication' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: 'Error: Token is invalid for this operation'
            });
        }

        this.findOne({_id: payload.id}, function(err, user) {

            if (err || !user) {
                if (err) {
                    return callback(err);
                }

                return callback({
                    error: 'Error: Token is invalid.'
                });
            }

            if (payload.iat * 1000 < user.passwordLastUpdated) {
                return callback({
                    error: 'Error: Token is revoked.'
                });
            }

            return callback(err, user);
        });
    }.bind(this));
};

schema.statics.getByEmail = function (email, callback) {
    this.findOne({
        email:  email ? email.toLowerCase() : email
    }, function(err, user) {
        if (err || !user) {
            if (err) {
                return callback(err);
            }

            return callback({error: "Error: User not found"})
        }

        return callback(null, user);
    });
};


schema.virtual('lowerCaseName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName.toLowerCase() + " " + this.lastName.toLowerCase();
    }

    return "";
});

schema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName + " " + this.lastName;
    }

    return "";
});

schema.virtual('permissions.level').get(function () {
    // 0 - Hacker Unverified
    // 1 - Hacker
    // 2 - Check In
    // 3 - Admin
    // 4 - Review
    // 5 - Owner
    // 6 - Developer

    if (!this.status.active || this.status.passwordSuspension) {
        return 0;
    } else if (this.permissions.developer) { // Developers (Gods)
        return 6;
    } else if (this.permissions.owner) { // Owner
        return 5;
    } else if (this.permissions.reviewer) { // Admin w/ review
        return 4;
    } else if (this.permissions.admin) { // Admin w/o review
        return 3;
    } else if (this.permissions.checkin) { // Checkin
        return 2;
    } else if (this.permissions.verified) { // Verified
        return 1;
    } else { // Unverified
        return 0;
    }
});

schema.virtual('status.name').get(function () {

    if (this.permissions.level >= 2) {
        return "organizer";
    }

    if (this.status.checkedIn && this.status.statusReleased) {
        return 'checked in';
    }

    if (this.status.declined && this.status.statusReleased) {
        return "declined";
    }

    if (this.status.waitlisted && this.status.statusReleased) {
        return "waitlisted";
    }

    if (this.status.confirmed && this.status.statusReleased) {
        return "confirmed";
    }

    if (this.status.admitted && this.status.statusReleased) {
        return "admitted";
    }

    if (this.status.submittedApplication) {
        return "submitted";
    }

    if (!this.permissions.verified) {
        return "unverified";
    }

    return "incomplete";

});

schema.static.filterSensitive = function (excuterToken, user, callback) {
    this.getByToken(excuterToken, function (err, user) {
        var permissionLevel = 0;

        if (user) {
            permissionLevel = user.permissions.level;
        }

        var queue = [[fields, u]];
        var runner;
        var userpath;
        var keys;

        while (queue.length !== 0) {
            runner = queue[0][0];
            userpath = queue.shift()[1];
            keys = Object.keys(runner);

            for (var i = 0; i < keys.length; i++) {
                if("type" in runner[keys[i]]) {
                    if (runner[keys[i]].permission >= permissionLevel){
                        try {
                            delete userpath[keys[i]];
                        } catch (e) {
                            console.log(e)
                        }
                    }
                } else {
                    queue.push([runner[keys[i]], userpath[keys[i]]])
                }
            }
        }

        return callback(false, user)
    })
}

module.exports = mongoose.model('User', schema);