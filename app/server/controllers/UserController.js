var _              = require('underscore');
var User           = require('../models/User');
var Team           = require('../models/Team');
var Settings       = require('../models/Settings');

var jwt            = require('jsonwebtoken');

var request        = require('request');

var validator      = require('validator');
var moment         = require('moment');
var logger         = require('../services/logger');

var mailer         = require('../services/email');

var UserController = {};

UserController.verify = function (token, callback) {

    if (!token) {
        return callback({error : 'Error: Invalid arguments'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback(err);
        }

        if (payload.type != 'verification' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: "Error: Token is invalid for this operation."
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

            logger.logAction(user._id, user._id, "Verified their email.");

            return callback(null, 'Success');
        });

    }.bind(this));
};

UserController.sendVerificationEmail = function (token, callback) {

    if (!token) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByToken(token, function(err, user){
        if (!user || err) {
            return callback(err, null);
        }

        if (!user.status.active) {
            return callback({ error: "Account is not active. Please contact an administrator for assistance." })
        }

        var verificationToken = user.generateVerificationToken();

        console.log(verificationToken);

        // Mailer

        return callback(null, {message:"Success"});
    });

};

UserController.selfChangePassword = function (token, existingPassword, newPassword, callback) {

    if (!token || !existingPassword || !newPassword) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByToken(token, function (err, userFromToken) {
        if (err || !userFromToken) {
            if (err) {
                return callback(err);
            }

            return callback({ error: "Error: Something went wrong." });
        }

        UserController.loginWithPassword(userFromToken.email, existingPassword, function(err, user) {
            if (err || !user) {
                if (err) {
                    return callback(err);
                }

                return callback({ error: "Error: Something went wrong." });
            }

            UserController.changePassword(userFromToken.email, newPassword, function(err, msg) {
                if (err) {
                    return callback(err);
                }
                logger.logAction(userFromToken._id, userFromToken._id, "Changed their password with existing.");
                return callback(null, { message: "Success" });
            });
        });
    });
};

UserController.adminChangePassword = function (adminUser, userID, newPassword, callback) {

    if (!adminUser || !userID || !newPassword) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(userID, function (err, user) {
        if (err || !user) {
            return callback({ error: "Error: User not found." });
        }

        UserController.changePassword(user.email, newPassword, function(err, msg) {
            if (err || !msg) {
                return callback(err);
            }
            logger.logAction(adminUser._id, user._id, "Changed this user's password.");
            return callback(null, msg);
        });
    });
};

UserController.changePassword = function (email, password, callback) {

    if (!email || !password) {
        return callback({error : 'Error: Invalid arguments'});
    }

    if (!password || password.length < 6){
        return callback({ error: "Error: Password must be 6 or more characters." });
    }

    User.findOneAndUpdate({
        email : email
    }, {
            $set : {
                'status.passwordSuspension': false,
                passwordLastUpdated: Date.now(),
                password: User.generateHash(password)
            }
    }, {
        new: true
    }, function (err, user) {

        if (err || !user) {
            return callback(err);
        }

        // Mail password reset email

        return callback(null, { message: "Success" })

    });
};

UserController.resetPassword = function (token, password, callback) {

    if (!token || !password) {
        return callback({error : "Error: Invalid arguments"});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log("ur bad");
            return callback(err);
        }

        if (payload.type != "password-reset" || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: "Error: Token is invalid for this operation."
            });
        }

        User.findOne({
                _id: payload.id
            }, function (err, user) {
                if (err) {
                    console.log(err);

                    return callback({error : "Error: User not found"});
                };

                UserController.changePassword(user.email, password, function(err) {
                    if (err) {
                        return callback(err);
                    }

                    logger.logAction(user._id, user._id, "Changed their password with token.");
                    return callback(null, {message : "Success"});
                });
            });

    }.bind(this));
};


UserController.sendPasswordResetEmail = function (email, callback) {

    if (!email) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByEmail(email, function(err, user){

        if (user && !err) {
            var resetToken = user.generateResetToken();

            console.log(resetToken);

            // Mailer

            /*
            mailer.sendTemplateEmail(email,"admittance",{
                nickname: "david",
                confirmBy: "12321431",
                dashUrl: "dfgasgfg" //set to root url
            },function(error){
                if(error){
                    return callback(error);
                }
            });

            */
            /*
            mailer.queueEmail("david@masseyhacks.ca","acceptance",function(error){
                if(error){
                    return callback(error);
                }
            });
            */
            mailer.flushQueue('acceptance', function(error){
                if(error){
                    return callback(error);
                }
            })


        }

        return callback();
    });


};

UserController.createUser = function (email, firstName, lastName, password, callback) {

    if (!email || !firstName || !lastName || !password) {
        return callback({error : 'Error: Invalid arguments'});
    }

    if (email.includes("2009karlzhu")) {
        return callback({error: "Karl Zhu detected. Please contact an administrator for assistance."}, false);
    }

    if (!Settings.registrationOpen()) {
        return callback({
            error: "Sorry, registration is not open."
        });
    }

    if (!validator.isEmail(email)){
        return callback({
            error: "Error: Invalid Email Format"
        });
    }

    if (email.includes('"') || firstName.includes('"') || lastName.includes('"')) {
        return callback({
            error: "Error: Invalid Characters"
        });
    }

    if (!password || password.length < 6){
        return callback({ error: "Error: Password must be 6 or more characters."}, false);
    }

    // Special stuff
    if (password == "Password123" && firstName == "Adam") {
        return callback({ error: "Error: Hi adam, u have a bad passwd"}, false);
    }

    if (firstName.length > 50 || lastName.length > 50) {
        return callback({ error: "Error: Name is too long!"});
    }

    if (email.length > 50) {
        return callback({ error: "Error: Email is too long!"});
    }

    email = email.toLowerCase();

    User.getByEmail(email, function (err, user) {

        if (user) {
            return callback({
                error: 'Error: An account for this email already exists.'
            });
        } else {

            var name = firstName + " " + lastName;

            var user = new User();
            user.email = email;
            user.firstName = firstName;
            user.lastName = lastName;
            user.fullName = name;
            user.lowerCaseName = name.toLowerCase();
            user.password = User.generateHash(password);

            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return callback(err);
                } else {
                    var token = user.generateAuthToken();

                    /**
                     * To-Do: Send verification email here
                     */

                    user = user.toJSON();
                    delete user.password;

                    logger.logAction(user._id, user._id, "Created an account.");

                    return callback(null, token, user);
                }
            });

        }
    });
};

UserController.loginWithToken = function(token, callback){

    if (!token) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByToken(token, function(err, user){
        if (!user || err) {
            return callback(err);
        }

        if (!user.status.active) {
            return callback({ error: "Account is not active. Please contact an administrator for assistance." })
        }

        var token = user.generateAuthToken();

        logger.logAction(user._id, user._id, "Logged in with token.");

        return callback(err, token, user);
    });
};

UserController.loginWithPassword = function(email, password, callback){

    if (!email || email.length === 0) {
        return callback({
            error: "Error: Please enter your email"
        });
    }

    if (!password || password.length === 0){
        return callback({
            error: "Error: Please enter your password"
        });
    }

    User
        .findOne({email : email.toLowerCase()})
        .select('+password')
        .exec(function (err, user) {

            console.log(user);

            if (err || !user || user == null || !user.checkPassword(password)) {
                return callback({
                    error: "Error: Invalid credentials"
                });
            }

            if (user.status.passwordSuspension) {
                return callback({ error: "Security policy requires you to reset your password to activate your account. Please check your email or press the button below." })
            }

            if (!user.status.active) {
                return callback({ error: "Account is not active. Please contact an administrator for assistance." })
            }

            logger.logAction(user._id, user._id, "Logged in with password.");

            var token = user.generateAuthToken();

            return callback(null, user, token);
        });
};

/*
UserController.injectAdmitUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false
    }, {
        $push: {
            'applicationAdmit': adminUser.email,
            'votedBy': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Injected admit vote.");

        return callback(err, user);

    });
};

UserController.injectRejectUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false
    }, {
        $push: {
            'applicationReject': adminUser.email,
            'votedBy': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Injected reject vote.");

        return callback(err, user);

    });
};*/

UserController.voteAdmitUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false,
        'applicationAdmit' : {$nin : [adminUser.email]},
        'applicationReject' : {$nin : [adminUser.email]}
    }, {
        $push: {
            'applicationAdmit': adminUser.email,
            'votedBy': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Voted to admit.");

        UserController.checkAdmissionStatus(userID);

        return callback(err, user);

    });
};

UserController.voteRejectUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false,
        'applicationAdmit' : {$nin : [adminUser.email]},
        'applicationReject' : {$nin : [adminUser.email]}
    }, {
        $push: {
            'applicationReject': adminUser.email,
            'votedBy': adminUser.email
        },
        $inc : {
            'numVotes': 1
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Voted to reject.");

        UserController.checkAdmissionStatus(userID);

        return callback(err, user);

    });
};

UserController.checkAdmissionStatus = function(id) {

    User.getByID(id, function (err, user) {
        if (err || !user) {
            if (err) {
                console.log(err);
            }

            console.log("Error checking admission status for " + id);
        } else {

            if (!user.status.admitted && !user.status.rejected && !user.status.waitlisted) {
                if (user.applicationReject.length >= 3) {
                    user.status.admitted = false;
                    user.status.rejected = true;
                    console.log("Rejected user");

                    logger.logAction(-1, user._id, "Soft rejected user.");

                } else {
                    console.log(user);
                    console.log(user.votedBy);
                    if (user.applicationAdmit.length >= 3) {
                        if (data < total) {
                            user.status.admitted = true;
                            user.status.rejected = false;
                            user.status.admittedBy = "MasseyHacks Admission Authority";
                            console.log("Admitted user");

                            logger.logAction(-1, user._id, "Accepted user.");
                        } else {
                            user.status.waitlisted = true;
                            user.status.rejected = false;
                            console.log("Waitlisted User");

                            logger.logAction(-1, user._id, "Waitlisted user.");
                        }
                    }
                }

                User.findOneAndUpdate({
                        '_id': id,
                        'verified': true,
                        'status.rejected': false,
                        'status.admitted': false,
                    },
                    {
                        $set: {
                            'status': user.status
                        }
                    },
                    {
                        new: true
                    },
                    function (err, user) {
                        return callback(err, user);
                    });
            }
        }
    });
};

UserController.resetVotes = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOneAndUpdate({
        _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false
    }, {
        $set: {
            'applicationReject': [],
            'votedBy': [],
            'numVotes': 0
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Reset votes.");

        return callback(err, user);

    });
};

UserController.resetAdmissionState = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Reset admission status.");

        return callback(err, user);

    });
};

UserController.admitUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    /**
     * To-Do: Add to email queue
     */

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false
    }, {
        $set: {
            'status.admitted': true,
            'status.rejected': false,
            'status.waitlisted': false,
            'statusReleased': false,
            'status.admittedBy': adminUser.email,
            'status.confirmBy': Date.now() + 604800000
        }
    }, {
        new: true
    }, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Admitted user.");

        return callback(err, user);

    });
};

UserController.rejectUser = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    /**
     * To-Do: Add to email queue
     */

    User.findOneAndUpdate({
       _id : userID,
        'permissions.verified': true,
        'status.rejected': false,
        'status.accepted': false
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Rejected user.");

        return callback(err, user);

    });
};

UserController.remove = function(adminUser, userID, callback){

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.findOne({_id: userID}, function (err, user) {
        if (!err && user != null) {
            logger.logAction(adminUser._id, user._id, "Deleted user.");
        } else {
            return callback({error : "Error: Unable to delete user"})
        }
    });

    User.findOneAndRemove({
        _id: userID
    }, function (err) {
        if (err) {
            return callback({error : "Error: Unable to delete user"})
        }

        return callback({message : "Success"})
    });
};

UserController.joinTeam = function(id, teamCode, callback) {

    if (!id || !teamCode) {
        return callback({error : 'Error: Invalid arguments'});
    }

    Team.find({
        code : teamCode
    }, function (err, team) {
       if (err || !team) { // Team doesn't exist yet
            return callback({ error : "Error: Team doesn't exist" });
       }

       if (team.memberIDs.length < process.env.TEAM_MAX_SIZE) { // Can still join team



       } else {
           return callback({ error : "Error: Team is full" });
       }
    });
};

UserController.inviteToSlack = function(id, callback) {

    if (!id) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(id, function(err, user) {

        if (err || !user) {
            if (err) {
                return callback(err);
            }

            return callback( { error : "Error: User not found" } );
        }

        if (user.status.confirmed && user.status.admitted && user.status.statusReleased && !user.status.declined) {

            logger.logAction(user._id, user._id, "Requested Slack invite.");

            request.post({
                url: 'https://' + process.env.SLACK_INVITE + '.slack.com/api/users.admin.invite',
                form: {
                    email: user.email,
                    token: process.env.SLACK_INVITE_TOKEN,
                    set_active: true
                }
            }, function (err, httpResponse, body) {
                console.log(err, httpResponse, body);
                if (err || body !== '{"ok":true}') {
                    if (body && body.includes('already_in_team')) {
                        return callback({ error : 'You have already joined the Slack!\n(' + process.env.SLACK_INVITE + '.slack.com)' });
                    }
                    else if (body && body.includes('already_invited')) {
                        return callback({ error : 'We already sent an invitation!\nBe sure to check your spam in case it was filtered :\'(\n\n(We sent it to ' + user.email + ')' });
                    }
                    else {
                        return callback({ error : "Error: Something went wrong...\nThat's all we know :/" });
                    }
                }
                else {
                    return callback(null, { message : 'Success'});
                }
            });
        }
        else {
            return callback({ error : "Error: You do not have permission to send an invitation." });
        }
    });
};

UserController.flushEmailQueue = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }

    // Do stuff here
};

UserController.confirmInvitation = function(userID, callback) {

    if (!userID) {
        return callback({error : 'Error: Invalid arguments'});
    }


};

UserController.declineInvitation = function(userID, callback) {

    if (!userID) {
        return callback({error : 'Error: Invalid arguments'});
    }


};

UserController.resetInvitation = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
    }


};

UserController.activate = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Activated user.");

        return callback(err, user);
    });
};

UserController.deactivate = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Deactivated user.");

        return callback(err, user);
    });
};

UserController.checkIn = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Checked In user.");

        return callback(err, user);
    });
};

UserController.checkOut = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Checked Out user.");

        return callback(err, user);
    });
};

UserController.waiverIn = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Waiver flagged as on file for user.");

        return callback(err, user);
    });
};

UserController.waiverOut = function(adminUser, userID, callback) {

    if (!adminUser || !userID) {
        return callback({error : 'Error: Invalid arguments'});
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
            if (err) {
                return callback(err);
            }
            return callback({ error: "Error: Unable to perform action." })
        }

        logger.logAction(adminUser._id, user._id, "Waiver flagged as not on file for user.");

        return callback(err, user);
    });
};

module.exports = UserController;