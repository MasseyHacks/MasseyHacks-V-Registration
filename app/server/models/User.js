require('dotenv').load();

const mongoose    = require('mongoose');
const bcrypt      = require('bcrypt-nodejs');
const validator   = require('validator');
const jwt         = require('jsonwebtoken');
const fields      = require('../models/data/UserFields');
const Raven       = require('raven');
const speakeasy   = require('speakeasy');

JWT_SECRET = process.env.JWT_SECRET;

var schema = new mongoose.Schema(fields);

schema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

schema.methods.checkCode = function(code) {
    return speakeasy.totp.verify({ secret: this.authSecret,
                                   encoding: 'base32',
                                   token: code});
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

schema.methods.generateMagicToken = function() {
    return jwt.sign({id: this._id, type: 'magicJWT'}, JWT_SECRET, {
        expiresIn: 600
    });
}

schema.methods.generateResetToken = function() {
    return jwt.sign({id: this._id, type: 'password-reset'}, JWT_SECRET, {
        expiresIn: 3600
    });
};

schema.methods.generate2FAToken = function() {
    return jwt.sign({id: this._id, type: '2FA'}, JWT_SECRET, {
        expiresIn: 600
    });
};

schema.methods.setPermission = function(level) {
    console.log('Got level ', level)

    if (level && typeof level == 'string') {
        for (var key in fields['permissions']) {

            if (key == level.toLowerCase()) {

                console.log('Locked to', key)

                level = fields['permissions'][key]['permissionLevel']
                break
            }
        }
    }

    console.log('Translating to ', level)

    if (!level) {
        level = 0
    }

    for (var key in fields.permissions) {
        this.permissions[key] = fields['permissions'][key]['permissionLevel'] <= level
    }

    this.update({
        permissions: this.permissions
    }, function(err, user) {
        if (err || !user) {
            console.log('Failed to set permission')
        }

        console.log('Permission set')
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

schema.statics.getByID = function(id, callback, permissionLevel) {

    /*
    if (permissionLevel == null) {
        permissionLevel = 1;
    }*/

    this.findOne({
        _id:  id
    }, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {
                error: 'User not found.',
                code: 404
            })

        }

        return callback(null, user); //filterSensitive(user, permissionLevel));
    });
};

schema.statics.getByToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            return callback({
                error: 'Invalid Token',
                code: 401
            });
        }

        if (payload.type != 'authentication' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: ' Invalid Token',
                code: 403
            });
        }

        this.findOne({_id: payload.id}, function(err, user) {

            if (err || !user) {
                return callback(err ? err : {
                    error: 'Invalid Token',
                    code: 401
                });
            }

            if (payload.iat * 1000 < user.passwordLastUpdated) {
                return callback({
                    error: 'Invalid Token',
                    code: 401
                });
            }

            return callback(err, user);
        });
    }.bind(this));
};

schema.statics.get2FA = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            return callback({
                error: 'Invalid Token',
                code: 401
            });
        }

        if (payload.type != '2FA' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: 'Invalid Token',
                code: 403
            });
        }

        this.findOne({_id: payload.id}, '+QRCode +authSecret', function(err, user) {

            if (err || !user) {
                return callback(err ? err : {
                    error: 'Invalid Token',
                    code: 401
                });
            }

            if (payload.iat * 1000 < user.passwordLastUpdated) {
                return callback({
                    error: 'Invalid Token',
                    code: 401
                });
            }

            return callback(err, user);
        });
    }.bind(this));
};

schema.statics.getUser = async function(query) {
    return await this.findOne(query);
};

schema.statics.getByEmail = function (email, callback, permissionLevel) {
    this.findOne({
        email:  email ? email.toLowerCase() : email
    }, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {
                error: 'User not found',
                code: 404
            })
        }

        /*
        if (!permissionLevel) {
            permissionLevel = 0
        }*/

        return callback(null, user); //filterSensitive(user, permissionLevel));
    });
};

schema.statics.validateProfile = function(id, profile, callback) {

    var queue = [[fields.profile, profile]];
    var runner;
    var userpath;
    var keys;

    while (queue.length !== 0) {
        runner = queue[0][0];
        userpath = queue.shift()[1];
        keys = Object.keys(runner);

        for (var i = 0; i < keys.length; i++) {
            if('type' in runner[keys[i]]) {
                if (runner[keys[i]].required && userpath[keys[i]] && userpath[keys[i]] !== ''){
                    return callback({message: 'Field ' + key + ' is required'})
                }
            } else {
                if(userpath[keys[i]]) {
                    queue.push([runner[keys[i]], userpath[keys[i]]])
                }
            }
        }
    }

    return callback(null, profile);
}


schema.virtual('lowerCaseName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName.toLowerCase() + ' ' + this.lastName.toLowerCase();
    }

    return '';
});

schema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName + ' ' + this.lastName;
    }

    return '';
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

schema.virtual('userType.name').get(function() {
    if (this.permissions.developer) {
        return 'Developer';
    } else if (this.permissions.owner) {
        return 'Owner';
    } else if (this.permissions.admin) {
        return 'Admin';
    }

    var type = [];

    if (this.permissions.checkin) {
        type.push('Check In');
    }

    if (this.userType.hacker)  {
        type.push('Hacker');
    }

    if (this.userType.mentor)  {
        type.push('Mentor');
    }

    if (this.userType.workshopHost)  {
        type.push('Workshop Host');
    }

    return type.length ? type.join(' and ') : 'Goose';
});

schema.virtual('status.name').get(function () {

    if (this.permissions.level >= 2) {
        return 'organizer';
    }

    if (this.status.checkedIn && this.status.statusReleased) {
        return 'checked in';
    }

    if (this.status.declined && this.status.statusReleased) {
        return 'declined';
    }

    if (this.status.waitlisted && this.status.statusReleased) {
        return 'waitlisted';
    }

    if (this.status.confirmed && this.status.statusReleased) {
        return 'confirmed';
    }

    if (this.status.admitted && this.status.statusReleased) {
        return 'admitted';
    }

    if (this.status.rejected && this.status.statusReleased) {
        return 'rejected';
    }

    if (this.status.submittedApplication) {
        return 'submitted';
    }

    if (!this.permissions.verified) {
        return 'unverified';
    }

    return 'incomplete';

});

schema.virtual('profile.isSigned').get(function () {
    return this.profile.signature !== -1;
})

schema.statics.filterSensitive = function(user, permission, page) {
    return filterSensitive(user, permission, page);
}

var filterSensitive = function (user, permission, page) {

    try {
        console.log(page)
        if (page === 'checkin') {
            return {
                id: user.id,
                name: user.fullName,
                waiver: user.status.waiver,
                checked: user.status.checkedIn,
                email: user.email}
        }

        var u = user.toJSON();

        var permissionLevel;

        if (permission) {
            permissionLevel = permission;
        } else {
            permissionLevel = 0;
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
                if ('type' in runner[keys[i]]) {
                    if (runner[keys[i]].permission && runner[keys[i]].permission >= permissionLevel) {
                        try {
                            delete userpath[keys[i]];
                        } catch (e) {
                            console.log(e)
                        }
                    }

                    if (permissionLevel < 2 && runner[keys[i]].condition && !navigate(user, runner[keys[i]].condition)) {
                        userpath[keys[i]] = runner[keys[i]].default;
                    }

                } else {
                    if (userpath[keys[i]]) {
                        queue.push([runner[keys[i]], userpath[keys[i]]])
                    }
                }
            }
        }

        return u;
    } catch(e) {
        Raven.captureException(e);
        return {};
    }
};

var navigate = function(dictionary, path) {
    var runner = dictionary;
    path = path.split('.');

    for (var i = 0; i < path.length - 1; i++) {
        runner = runner[path[i]];
    }

    return runner[path[path.length - 1]];
}

module.exports = mongoose.model('User', schema);