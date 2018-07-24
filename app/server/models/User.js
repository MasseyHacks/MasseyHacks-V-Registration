require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;


var status = {
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    passwordSuspension: {
        type: Boolean,
        required: true,
        default: false
    },
    submittedApplication: {
        type: Boolean,
        required: true,
        default: false
    },
    sentConfirmation: {
        type: Boolean,
        required: true,
        default: false
    },
    waitlisted: {
        type: Boolean,
        required: true,
        default: false
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false
    },
    admittedBy: {
        type: String
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    waiver: {
        type: Boolean,
        required: true,
        default: false
    },
    declined: {
        type: Boolean,
        required: true,
        default: false
    },
    noConfirmation: {
        type: Boolean,
        required:true,
        default: false
    },
    rejected: {
        type: Boolean,
        required: true,
        default: false
    },
    checkedIn: {
        type: Boolean,
        required: true,
        default: false
    },
    checkInTime: {
        type: Number
    },
    confirmBy: {
        type: Number
    },
    statusReleased: {
        type: Boolean,
        default: false
    }
};

var profile = {

};

var confirmation = {

};

var userType = {
    hacker : {
        type: Boolean,
        required: true,
        default: true
    },
    mentor: {
        type: Boolean,
        required: true,
        default: false
    },
    workshopHost: {
        type: Boolean,
        required: true,
        default: false
    }
};

var permissions = {
    verified : {
        type: Boolean,
        required: true,
        default: false
    },
    checkin: {
        type: Boolean,
        required: true,
        default: false
    },
    reviewer: {
        type: Boolean,
        required: true,
        default: false
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    owner: {
        type: Boolean,
        required: true,
        default: false
    },
    developer: {
        type: Boolean,
        required: true,
        default: false
    }
};


var schema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        validate: [
            validator.isEmail,
            'Invalid Email'
        ]
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    timestamp: {
        type: Number,
        required: true,
        default: 0
    },

    lastUpdated: {
        type: Number,
        default: 0
    },

    passwordLastUpdated: {
        type: Number,
        default: 0
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140
    },

    applicationAdmit: {
        type: [String]
    },

    applicationReject: {
        type: [String]
    },

    applicationVotes: {
        type: [String]
    },

    numVotes : {
        type: Number,
        default: 0
    },

    status: status,
    permissions : permissions,
    userType: userType,

    // Only parts user can update
    profile: profile,
    confirmation: confirmation
});


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
            return callback(err);
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
    if (this.status.completedProfile) {
        return "submitted";
    }

    if (!this.verified) {
        return "unverified";
    }

    return "incomplete";

});

module.exports = mongoose.model('User', schema);