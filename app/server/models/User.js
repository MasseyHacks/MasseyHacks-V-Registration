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
    completedProfile: {
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
        type: String,
        select: false
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

    fullName: {
        type: String,
        required: true
    },

    lowerCaseName: {
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
        default: 0,
    },

    lastUpdated: {
        type: Number,
        default: 0,
    },

    passwordLastUpdated: {
        type: Number,
        default: 0,
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140,
    },

    applicationAdmit: {
        type: [String],
    },

    applicationReject: {
        type: [String],
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

schema.statics.getEmailFromID = function(id) {
  if (id == -1) {
      return "MasseyHacks Internal Authority";
  }

  return this.findOne({ _id : id}).email;
};

schema.statics.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.statics.getByID = function(id, callback) {
    this.findOne({
        _id:  id
    }, function(err, usr) {
        if (err || !usr) {
            if (err) {
                return callback(err);
            }

            return callback({ error: "Error: User not found." })
        }

        return callback(null, usr);
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

        this.findOne({_id: payload.id}, callback);
    }.bind(this));
};

schema.statics.getByUsername = function (username) {
    return this.findOne({
        username:  username
    });
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