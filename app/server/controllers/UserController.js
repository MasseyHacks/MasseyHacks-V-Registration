const _              = require('underscore');
const User           = require('../models/User');
const Team           = require('../models/Team');
const Settings       = require('../models/Settings');

const jwt            = require('jsonwebtoken');
const uuidv4         = require('uuid/v4');

const request        = require('request');

const validator      = require('validator');
const moment         = require('moment');

const logger         = require('../services/logger');
const mailer         = require('../services/email');
const stats          = require('../services/stats');

const UserFields     = require('../models/data/UserFields');
const FilterFields   = require('../models/data/FilterFields');
const qrcode         = require('qrcode');

var UserController   = {};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

UserController.getUserFields = function(userExecute, callback) {

    var fieldsOut = [];
    var queue = [[UserFields, '']];

    while (queue.length !=0) {
        var data = queue.pop();
        var current = data[0]
        var header = data[1]

        for (var runner in current) {
            if (current[runner]['type']) {
                if (!current[runner]['permission'] || current[runner]['permission'] <= userExecute.permissions.level) {
                    fieldsOut.push({'name' : (header ? header + '.' : '') + runner, 'type' : current[runner]['type'].name});
                }
            } else {
                queue.push([current[runner], (header ? header + '.' : '') + runner])
            }
        }
    }

    callback(null, fieldsOut)
};

UserController.getAdmins = function(callback) {
    User.find({"permissions.admin":true}, "+QRCode", function(err, data) {
        if (err) {
            return callback({error: err})
        }

        var filtered = {}
        for (var i = 0; i < data.length; i++) {
            filtered[data[i].fullName] = data[i].QRCode
        }

        return callback(null, filtered)
    })
};

UserController.getByQuery = function (adminUser, query, callback) {

    if (!query || !query.page || !query.size) {
        return callback({error : 'Invalid arguments'});
    }

    var page    = parseInt(query.page);
    var size    = parseInt(query.size);
    var text    = query.text;
    var sort    = query.sort;
    var filters = query.filters ? query.filters : {};
    var and     = [];
    var or      = [];
    var appPage = query.appPage ? query.appPage : null;

    console.log(appPage)

    if (text) {
        var regex = new RegExp(escapeRegExp(text), 'i'); // filters regex chars, sets to case insensitive

        or.push({ email: regex });
        or.push({ 'firstName': regex });
        or.push({ 'lastName': regex });
        or.push({ 'teamCode': regex });
        or.push({ 'profile.school': regex });
        or.push({ 'profile.departing': regex });
    }

    if (or && or.length) {
        if ('$or' in filters) {
            filters['$or'].concat(or)
        } else {
            filters['$or'] = or
        }
    }

    if (and && and.length) {
        if ('$and' in filters) {
            filters['$and'].concat(and)
        } else {
            filters['$and'] = and
        }
    }

    console.log(filters)

    User.count(filters, function(err, count) {

        if (err) {
            console.log(err)
            return callback({error:err.message})
        }

        if (size === 0) {
            size = count
        }

        User
            .find(filters)
            .sort()
            .skip((page - 1) * size)
            .limit(size)
            .exec(function(err, users) {
                if (err) {
                    console.log(err)
                    return callback({error:err.message})
                }

                console.log(users, count, size)

                if (users) {
                    for (var i = 0; i < users.length; i++) {
                        users[i] = User.filterSensitive(users[i], adminUser.permissions.level, appPage)
                    }
                }

                return callback(null, {
                    users: users,
                    totalPages: Math.ceil(count / size)
                })
            });
        });

};

UserController.verify = function (token, callback) {

    if (!token) {
        return callback({error : 'Invalid arguments'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback({
                error: 'Invalid Token',
                code: 401
            });
        }

        if (payload.type != 'verification' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: ' Invalid Token.',
                code: 403
            });
        }

        User.findOneAndUpdate({
            _id: payload.id
        },
        {
            $set: {
                'permissions.verified': true
            }
        },
        {
            new: true
        }, function (err, user) {
            if (err || !user) {
                console.log(err);

                return callback(err);
            };

            logger.logAction(user._id, user._id, 'Verified their email.');

            return callback(null, 'Success');
        });

    }.bind(this));
};

UserController.magicLogin = function (token, callback) {

    if (!token) {
        return callback({error : 'Invalid arguments'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback({
                error: 'Invalid Token',
                code: 401
            });
        }

        if (payload.type != 'magicJWT' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: ' Invalid Token.',
                code: 403
            });
        }

        User.findOne({_id: payload.id}, "+magicJWT", function(err, user) {
            console.log(user)
            if (token === user.magicJWT) {
                User.findOneAndUpdate({
                        _id: payload.id
                    },
                    {
                        $set: {
                            'magicJWT': ""
                        }
                    },
                    {
                        new: true
                    }, function (err, user) {
                        if (err || !user) {
                            console.log(err);

                            return callback(err);
                        }
                        ;

                        logger.logAction(user._id, user._id, 'Logged in using magic link.');

                        return callback(null, {token: user.generateAuthToken(), user:User.filterSensitive(user)});
                    });
            } else {
                return callback({
                    error: 'Invalid Token',
                    code: 401
                });
            }
        });

    }.bind(this));
};

UserController.sendVerificationEmail = function (token, callback) {

    if (!token) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByToken(token, function(err, user){
        if (!user || err) {
            return callback(err, null);
        }

        if (!user.status.active) {
            return callback({ error: 'Account is not active. Please contact an administrator for assistance.', code: 403})
        }

        var verificationURL = process.env.ROOT_URL + '/verify/' + user.generateVerificationToken();

        logger.logAction(user._id, user._id, 'Requested a verification email.');

        console.log(verificationURL);

        //send the email
        mailer.sendTemplateEmail(user.email,'verifyemails',{
            nickname: user.firstName,
            verifyUrl: verificationURL
        });

        return callback(null, {message:'Success'});
    });

};

UserController.selfChangePassword = function (token, existingPassword, newPassword, callback) {

    if (!token || !existingPassword || !newPassword) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByToken(token, function (err, userFromToken) {
        if (err || !userFromToken) {
            return callback(err ? err : { error: 'Something went wrong.', code: 500});
        }

        UserController.loginWithPassword(userFromToken.email, existingPassword, function(err, user) {
            if (err || !user) {
                return callback(err ? err : { error: 'Something went wrong.', code: 500});
            }

            UserController.changePassword(userFromToken.email, newPassword, function(err, msg) {
                if (err) {
                    return callback(err);
                }
                logger.logAction(userFromToken._id, userFromToken._id, 'Changed their password with existing.');
                return callback(null, {
                    token: userFromToken.generateAuthToken(),
                    user: User.filterSensitive(userFromToken)
                });
            });
        });
    });
};

UserController.adminChangePassword = function (adminUser, userID, newPassword, callback) {

    if (!adminUser || !userID || !newPassword) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(userID, function (err, user) {
        if (err || !user) {
            return callback({ error: 'User not found.', code: 404});
        }

        UserController.changePassword(user.email, newPassword, function(err, msg) {
            if (err || !msg) {
                return callback(err);
            }
            logger.logAction(adminUser._id, user._id, 'Changed this user\'s password.');
            return callback(null, msg);
        });
    });
};

UserController.changePassword = function (email, password, callback) {

    if (!email || !password) {
        return callback({error : 'Invalid arguments'});
    }

    if (!password || password.length < 6){
        return callback({ error: 'Password must be 6 or more characters.', code: 400});
    }

    User.findOneAndUpdate({
        email : email
    }, {
            $set : {
                'status.passwordSuspension': false,
                passwordLastUpdated: Date.now() - 10000,
                password: User.generateHash(password)
            }
    }, {
        new: true
    }, function (err, user) {

        if (err || !user) {
            return callback(err);
        }

        // Mail password reset email

        mailer.sendTemplateEmail(user.email,'passwordchangedemails',{
            nickname: user.firstName,
            dashUrl: process.env.ROOT_URL
        });

        return callback(null, { message: 'Success' })

    });
};

UserController.resetPassword = function (token, password, callback) {

    if (!token || !password) {
        return callback({error : 'Invalid arguments'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback({
                error: 'Invalid Token',
                code: 401
            });
        }

        if (payload.type != 'password-reset' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: ' Invalid Token.',
                code: 403
            });
        }

        User.findOne({
                _id: payload.id
            }, function (err, user) {
                if (err || !user) {
                    console.log(err);

                    return callback({error : 'Something went wrong'});
                }

                if (payload.iat * 1000 < user.passwordLastUpdated) {
                    return callback({
                        error: 'Invalid Token',
                        code: 401
                    });
                }

                UserController.changePassword(user.email, password, function(err) {
                    if (err) {
                        return callback(err);
                    }

                    logger.logAction(user._id, user._id, 'Changed their password with token.');

                    return callback(null, {message : 'Success'});
                });
            });

    }.bind(this));
};


UserController.sendPasswordResetEmail = function (email, callback) {

    if (!email) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByEmail(email, function(err, user){

        if (user && !err) {
            var resetURL = process.env.ROOT_URL + '/reset/' + user.generateResetToken();

            logger.logAction(user._id.email, user._id, 'Requested a password reset email.');

            console.log(resetURL);
            mailer.sendTemplateEmail(email,"passwordresetemails", {
                nickname: user.firstName,
                resetUrl: resetURL
            });
        }

        return callback();
    });

};

UserController.createUser = function (email, firstName, lastName, password, callback) {

    if (!email || !firstName || !lastName || !password) {
        return callback({error : 'Invalid arguments'});
    }

    if (email.includes('2009karlzhu')) {
        return callback({error: 'Karl Zhu detected. Please contact an administrator for assistance.', code: 403}, false);
    }

    Settings.getSettings(function(err, settings) {
        if (!settings.registrationOpen) {
            return callback({
                error: 'Sorry, registration is not open.',
                code: 403
            });
        } else {
            if (!validator.isEmail(email)){
                return callback({
                    error: 'Invalid Email Format',
                    code: 400
                });
            }

            if (!password || password.length < 6){
                return callback({ error: 'Password must be 6 or more characters.', code: 400}, false);
            }

            // Special stuff
            if (password == 'Password123' && firstName == 'Adam') {
                return callback({ error: 'Hi adam, u have a bad passwd', code: 418}, false);
            }

            if (firstName.length > 50 || lastName.length > 50) {
                return callback({ error: 'Name is too long!', code: 400});
            }

            if (email.length > 50) {
                return callback({ error: 'Email is too long!', code: 400});
            }

            email = email.toLowerCase();

            User.getByEmail(email, function (err, user) {
                if (!err || user) {
                    return callback({
                        error: 'An account for this email already exists.',
                        code: 400
                    });
                } else {

                    User.create({
                        'email': email,
                        'firstName': firstName,
                        'lastName': lastName,
                        'password': User.generateHash(password),
                        'passwordLastUpdated': Date.now() - 60000,
                        'timestamp': Date.now()
                    }, function (err, user) {

                        console.log('dank');

                        if (err || !user) {
                            console.log(err);
                            return callback(err);
                        } else {
                            var token = user.generateAuthToken();
                            var verificationURL = process.env.ROOT_URL + '/verify/' + user.generateVerificationToken();

                            console.log(verificationURL);

                            mailer.sendTemplateEmail(user.email,'verifyemails',{
                                nickname: user.firstName,
                                verifyUrl: verificationURL
                            });

                            user = User.filterSensitive(user);
                            delete user.password;

                            logger.logAction(user._id, user._id, 'Created an account.');

                            return callback(null, token, user);
                        }
                    });
                }
            });
        }
    });
};

UserController.loginWithToken = function(token, callback){

    if (!token) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByToken(token, function(err, user){
        if (!user || err) {
            return callback(err);
        }

        if (!user.status.active) {
            return callback({ error: 'Account is not active. Please contact an administrator for assistance.', code: 403 })
        }

        var token = user.generateAuthToken();

        logger.logAction(user._id, user._id, 'Logged in with token.');

        return callback(err, token, User.filterSensitive(user));
    });
};

UserController.loginWithPassword = function(email, password, callback){

    if (!email || email.length === 0) {
        return callback({
            error: 'Please enter your email',
            code: 400
        });
    }

    if (!password || password.length === 0){
        return callback({
            error: 'Please enter your password',
            code: 400
        });
    }

    User.findOne({email : email.toLowerCase()}, '+password +QRCode', function (err, user) {
            console.log(user);

            if (err || !user || user == null || !user.checkPassword(password)) {
                return callback({
                    error: 'Invalid credentials',
                    code: 401
                });
            }

            if (!user.status.active) {
                return callback({ error: 'Account is not active. Please contact an administrator for assistance.', code: 403})
            }

            console.log(process.env.TUFA_ENABLED)
            if (user.permissions.admin && process.env.TUFA_ENABLED === "true") {
                logger.logAction(user._id, user._id, "Organizer is logging in. Redirecting to 2FA.")

                var token = user.generate2FAToken();

                return callback(null, {"2FA": true}, token);
            } else {
                logger.logAction(user._id, user._id, 'Logged in with password.');

                var token = user.generateAuthToken();

                return callback(null, User.filterSensitive(user), token);
            }
        });
};

UserController.loginWith2FA = function(token, code, callback) {
    if (!token) {
        return callback({error : 'No token detected'});
    }

    User.get2FA(token, function(err, user){
        if (!user || err) {
            return callback(err);
        }

        if (!user.status.active) {
            return callback({ error: 'Account is not active. Please contact developers for assistance.', code: 403 })
        }

        if (!user.checkCode(code)) {
            return callback({ error: "Invalid Code!"})
        }

        var token = user.generateAuthToken();

        logger.logAction(user._id, user._id, 'Logged in with 2FA.');

        return callback(err, token, User.filterSensitive(user));
    });
};

UserController.updateProfile = function (userExcuted, id, profile, callback){

    // Validate the user profile, and mark the user as profile completed
    // when successful.
    console.log('Updating ' + profile);
    User.validateProfile(id, profile, function(err, profileValidated){
        if (err){
            return callback({message: 'Invalid profile!'});
        }

        // Check if its within the registration window.
        Settings.getSettings(function(err, times){
            if (profileValidated.signature === -1) {
                return User.findOneAndUpdate({
                        _id: id
                    },
                    {
                        $set: {
                            'lastUpdated': Date.now(),
                            'profile': profileValidated
                        }
                    },
                    {
                        new: true
                    },
                    callback);
            }

            if (err) {
                return callback(err);
            }

            var now = Date.now();

            if (now < times.timeOpen){
                return callback({
                    message: 'Registration opens in ' + moment(times.timeOpen).fromNow() + '!'
                });
            }

            if (now > times.timeClose){
                return callback({
                    message: 'Sorry, registration is closed.'
                });
            }

            User.findOne(
                {
                    _id: id
                },
                function (err, user) {
                    if (err) {
                        return callback(err)
                    }

                    if (user.status.released && (user.status.rejected  || user.status.waitlisted  || user.status.admitted)){
                        return callback({
                            message: 'Sorry, registration is closed.'
                        });
                    }

                    User.findOneAndUpdate({
                            _id: id,
                        },
                        {
                            $set: {
                                'lastUpdated': Date.now(),
                                'profile': profileValidated,
                                'status.submittedApplication': true
                            }
                        },
                        {
                            new: true
                        },
                        callback);

                    if (!user.status.submittedApplication) {
                        User.findById(id, function(err, user) {
                            if (err) {
                                console.log('Could not send email:');
                                console.log(err);
                            }
                            mailer.sendTemplateEmail(user.email,"applicationemails",{
                                nickname: user['firstName'],
                                dashUrl: process.env.ROOT_URL
                            })
                        });
                    }

                });
        });
    });
};

UserController.voteAdmitUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.admitted': false,
        'applicationAdmit' : {$nin : [adminUser.email]},
        'applicationReject' : {$nin : [adminUser.email]}
    }, {
        $push: {
            'applicationAdmit': adminUser.email,
            'applicationVotes': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Voted to admit.');

        UserController.checkAdmissionStatus(userID);

        return callback(err, user);

    });
};

UserController.voteRejectUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.admitted': false,
        'applicationAdmit' : {$nin : [adminUser.email]},
        'applicationReject' : {$nin : [adminUser.email]}
    }, {
        $push: {
            'applicationReject': adminUser.email,
            'applicationVotes': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Voted to reject.');

        UserController.checkAdmissionStatus(userID);

        return callback(err, user);

    });
};

UserController.teamAccept = function(adminUser, userID, callback) {
    User.getbyID(userID, function (err, user) {
        if (err || !user){
            return callback(err, user);
        } else {

            Team.getByCode(user.teamCode, function (err, team) {
                if (err || !team) {
                    return callback(err, user);
                }

                logger.logAction(adminUser._id, -1, 'Admitted team ' + team.name);

                for (id in team.memberIDs) {
                    UserController.admitUser(adminUser, id, function (err, user) {
                        if (err || !user){
                            console.log(err)
                        }
                    })
                }

                return callback(err, user);
            })
        }
    })
};

function updateStatus(id, status) {
    User.findOneAndUpdate({
            '_id': id,
            'permissions.verified': true,
            'status.rejected': false,
            'status.admitted': false,
        },
        {
            $set: {
                'status': status
            }
        },
        {
            new: true
        },
        function (err, user) {
            console.log(err, user)
        });
}

UserController.checkAdmissionStatus = function(id) {

    User.getByID(id, function (err, user) {
        if (err || !user) {
            if (err) {
                console.log(err);
            }

            console.log('Error checking admission status for ' + id);
        } else {

            if (!user.status.admitted && !user.status.rejected && !user.status.waitlisted) {
                if (user.applicationReject.length >= 3) {
                    user.status.admitted = false;
                    user.status.rejected = true;
                    console.log('Rejected user');

                    logger.logAction(-1, user._id, 'Soft rejected user.');

                    updateStatus(id, user.status);

                } else {
                    console.log(user);
                    console.log(user.applicationVotes);
                    if (user.applicationAdmit.length >= 3) {
                        Settings.findOne({}, function (err, settings) {

                            if (err || !settings) {
                                console.log('Unable to get settings', err);
                                return;
                            }

                            User.count({
                                'status.admitted': true,
                                'status.declined': false,
                                'permissions.checkin': false
                            }, function (err, count) {
                                if (err) {
                                    console.log('Unable to get count', err);
                                    return;
                                }

                                if (count < settings.maxParticipants) {
                                    user.status.admitted = true;
                                    user.status.rejected = false;
                                    user.status.admittedBy = 'MasseyHacks Admission Authority';
                                    console.log('Admitted user');

                                    logger.logAction(-1, user._id, 'Accepted user.');
                                } else {
                                    user.status.waitlisted = true;
                                    user.status.rejected = false;
                                    console.log('Waitlisted User');

                                    logger.logAction(-1, user._id, 'Waitlisted user.');
                                }

                                updateStatus(id, user.status)
                            });
                        })
                    }
                }
            }
        }
    }, 1000);
};

UserController.resetVotes = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.admitted': false
    }, {
        $set: {
            'applicationAdmit': [],
            'applicationReject': [],
            'applicationVotes': [],
            'numVotes': 0
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Reset votes.');

        return callback(err, user);

    });
};

UserController.resetAdmissionState = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true
    }, {
        $set: {
            'status.admitted': false,
            'status.rejected': false,
            'status.waitlisted': false,
            'statusReleased': false
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        Settings.findOneAndUpdate({

        }, {
            $pull: {
                'emailQueue.acceptanceEmails': user.email,
                'emailQueue.rejectionEmails': user.email,
                'emailQueue.waitlistEmails': user.email,
                'emailQueue.laggerEmails': user.email,
                'emailQueue.laggerConfirmEmails': user.email
            }
        }, function(err, settings) {
            if (err || !settings) {
                return callback(err ? err : { error: 'Unable to perform action.', code: 500})
            }
        });


        logger.logAction(adminUser._id, user._id, 'Reset admission status.');

        return callback(err, user);

    });
};

UserController.admitUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    Settings.findOne({}, function(err, settings) {
        User.findOneAndUpdate({
            _id: userID,
            'permissions.verified': true,
            'status.rejected': false,
            'status.admitted': false
        }, {
            $set: {
                'status.admitted': true,
                'status.rejected': false,
                'status.waitlisted': false,
                'statusReleased': false,
                'status.admittedBy': adminUser.email,
                'status.confirmBy': settings.timeConfirm
            }
        }, {
            new: true
        }, function (err, user) {

            if (err || !user) {
                return callback(err ? err : {error: 'Unable to perform action.', code: 500})
            }

            logger.logAction(adminUser._id, user._id, 'Admitted user.');

            //send the email
            mailer.queueEmail(user.email, 'acceptanceemails', function (err) {
                if (err) {
                    return callback(err);
                }
            });

            return callback(err, user);

        });
    });
};

UserController.rejectUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.admitted': false
    }, {
        $set: {
            'status.admitted': false,
            'status.rejected': true,
            'status.waitlisted': false,
            'statusReleased': false
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Rejected user.');

        mailer.queueEmail(user.email,'rejectionemails',function(err){
            if (err){
                return callback(err);
            }
        });

        return callback(err, user);

    });
};

UserController.remove = function(adminUser, userID, callback){

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOne({_id: userID}, function (err, user) {
        if (!err && user != null) {
            logger.logAction(adminUser._id, user._id, 'Deleted user.');
        } else {
            return callback({error : 'Unable to delete user'})
        }
    });

    User.findOneAndRemove({
        _id: userID
    }, function (err) {
        if (err) {
            return callback({error : 'Unable to delete user'})
        }

        return callback({message : 'Success'})
    });
};

UserController.createTeam = function(id, teamName, callback) {

    if (!id || !teamName) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback({error : 'Unable to get user'});
        }

        if (user.teamCode && user.teamCode.length != 0) {
            return callback({error : 'You are already in a team!'});
        }

        var team = Team();
        team.name = teamName;
        team.code = uuidv4();
        team.memberIDs = [user._id];

        team.save();

        User.findOneAndUpdate({
            _id: id
        }, {
            teamCode: team.code
        }, {
            new: true
        }, function(err, newUser) {
            logger.logAction(id, id, 'Created the team: ' + teamName + ' (' + team.code + ')');
            return callback(null, { team : team.toJSON(), user : newUser });
        });
    });
};

UserController.joinTeam = function(id, teamCode, callback) {

    if (!id || !teamCode) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
       if (err || !user) {
           return callback({error : 'Unable to get user'});
       }

       if (user.teamCode && user.teamCode.length != 0) {
           return callback({error : 'You are already in a team!'});
       }

       Team.findOne({
           code : teamCode
       }, function (err, team) {
           if (err || !team) { // Team doesn't exist yet
               return callback({ error : 'Team doesn\'t exist' });
           }

           if (team.memberIDs.length < process.env.TEAM_MAX_SIZE) { // Can still join team
               Team.findOneAndUpdate({
                   code : teamCode
               }, {
                   $push : {
                       memberIDs: user._id
                   }
               }, {
                   new: true
               }, function(err, newTeam) {
                   if (err || !newTeam) {
                       return callback({ error : 'Unable to join team' });
                   }

                   User.findOneAndUpdate({
                       _id : id
                   }, {
                       $set : {
                           teamCode: newTeam.code
                       }
                   }, {
                       new: true
                   }, function(err, newUser) {
                       if (err || !newUser) {
                           return callback({error : 'Something went wrong' });
                       }
                       logger.logAction(id, id, 'Joined the team: ' + newTeam + ' (' + team.code + ')');
                       return callback(null, { team : newTeam, user : newUser });
                   });
               });
           } else {
               return callback({ error : 'Team is full' });
           }
        });
    });
};

UserController.leaveTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
       if (err || !user) {
           return callback(err ? err : {error : 'Unable to get user'});
       }

       if (user.teamCode.length == 0) {
           return callback({error : 'You are not in a team'});
       }

        User.findOneAndUpdate({
            _id : user._id
        }, {
            $set : {
                teamCode : ''
            }
        }, {
            new: true
        }, function(err, newUser) {
            if (err || !newUser) {
                return callback(err ? err : {error: 'Unable to leave team', code: 500});
            }

            Team.findOneAndUpdate({
                code : user.teamCode
            }, {
                $pull : {
                    memberIDs : user._id
                }
            }, {
                new: true
            }, function(err, newTeam) {

                if (newTeam && newTeam.memberIDs.length == 0) { // Team is dead, kill it for good
                    Team.findOneAndRemove({
                        _id : newTeam._id
                    }, function(err) {
                        logger.logAction(-1, -1, 'Deleted the team: ' + newTeam.name + ' (' + user.teamCode + ')');
                    });
                }

                if (!newTeam) {
                    newTeam.name = 'null';
                }

                logger.logAction(id, id, 'Left the team: ' + newTeam.name + ' (' + user.teamCode + ')');
                return callback(null, newUser)
            });
        })
    });
};

UserController.getTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {error : 'Unable to get user'});
        }

        if (user.teamCode.length == 0) {
            return callback({error : 'You are not in a team'});
        }

        Team.findOne({
            code : user.teamCode
        }, function (err, team) {
            if (err || !team) { // Team doesn't exist
                return callback({ error : 'Team doesn\'t exist' });
            }

            return callback(null, team);
        });
    });
};
UserController.inviteToSlack = function(id, callback) {

    if (!id) {
        return callback({error : 'Invalid arguments'});
    }

    User.getByID(id, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error : 'User not found' });
        }

        if (user.status.confirmed && user.status.admitted && user.status.statusReleased && !user.status.declined) {

            logger.logAction(user._id, user._id, 'Requested Slack invite.');

            request.post({
                url: 'https://' + process.env.SLACK_INVITE + '.slack.com/api/users.admin.invite',
                form: {
                    email: user.email,
                    token: process.env.SLACK_INVITE_TOKEN,
                    set_active: true
                }
            }, function (err, httpResponse, body) {
                console.log(err, httpResponse, body);
                if (err || body !== '{\'ok\':true}') {
                    if (body && body.includes('already_in_team')) {
                        return callback({ error : 'You have already joined the Slack!\n(' + process.env.SLACK_INVITE + '.slack.com)' });
                    }
                    else if (body && body.includes('already_invited')) {
                        return callback({ error : 'We already sent an invitation!\nBe sure to check your spam in case it was filtered :\'(\n\n(We sent it to ' + user.email + ')' });
                    }
                    else {
                        return callback({ error : 'Something went wrong...\nThat\'s all we know :/' });
                    }
                }
                else {
                    return callback(null, { message : 'Success'});
                }
            });
        }
        else {
            return callback({ error : 'You do not have permission to send an invitation.' });
        }
    });
};

UserController.flushEmailQueue = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    // Do stuff here
};

UserController.confirmInvitation = function(userID, callback) {

    if (!userID) {
        return callback({error : 'Invalid arguments'});
    }


};

UserController.declineInvitation = function(userID, callback) {

    if (!userID) {
        return callback({error : 'Invalid arguments'});
    }


};

UserController.resetInvitation = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }


};

UserController.activate = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.active': true
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Activated user.');

        return callback(err, user);
    });
};

UserController.deactivate = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.active': false
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Deactivated user.');

        return callback(err, user);
    });
};

UserController.checkIn = function(adminUser, userID, page, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.checkedIn': true,
            'checkInTime' : Date.now()
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Checked In user.');

        return callback(err, User.filterSensitive(user, 2, page));
    });
};

UserController.checkOut = function(adminUser, userID, page, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.checkedIn': false
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Checked Out user.');

        return callback(err, User.filterSensitive(user, 2, page));
    });
};

UserController.waiverIn = function(adminUser, userID, page, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.waiver': true,
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Waiver flagged as on file for user.');
        return callback(err, User.filterSensitive(user, 2, page));
    });
};

UserController.waiverOut = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID
    }, {
        $set: {
            'status.waiver': false
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, user._id, 'Waiver flagged as not on file for user.');

        return callback(err, user);
    });
};

module.exports = UserController;