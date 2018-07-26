var _              = require('underscore');
var User           = require('../models/User');
var Team           = require('../models/Team');
var Settings       = require('../models/Settings');

var jwt            = require('jsonwebtoken');
var uuidv4         = require('uuid/v4');

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

        logger.logAction(user._id, user._id, "Requested a verification email.");

        console.log(verificationToken);

        //send the email
        mailer.sendTemplateEmail(user.email,'verifyemails',{
            nickname: firstname,
            verifyUrl: "CHANGEME"
        },function(err){
            if(err) {
                return callback(err);
            }
        });


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

        mailer.sendTemplateEmail(user.email,'passwordchangedemails',{
            nickname: user.firstName,
            dashUrl: process.env.ROOT_URL
        },function(err){
            if(err) {
                return callback(err);
            }
        });

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
            var resetURL = process.env.ROOT_URL + "/reset/" + user.generateResetToken();

            logger.logAction(user._id.email, user._id, "Requested a password reset email.");

            console.log(resetURL);

            mailer.sendTemplateEmail(email,"passwordresetemails",{
                nickname: user.firstName,
                resetUrl: resetURL
            },function(error){
                if(error){
                    return callback(error);
                }
            });

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

            User({
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "password": User.generateHash(password),
                "passwordLastUpdated": Date.now(),
                "timestamp": Date.now()
            }, function (err, user) {
                if (err || !user) {
                    console.log(err);
                    return callback(err);
                } else {
                    var token = user.generateAuthToken();

                    //send the email
                    mailer.sendTemplateEmail(email,'verifyemails',{
                        nickname: firstname,
                        verifyUrl: "CHANGEME"
                    },function(err){
                        if(err) {
                            return callback(err);
                        }
                    });

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

UserController.teamAccept = function(adminUser, userID, callback) {
    User.getbyID(userID, function (err, user) {
        if (err || !user){
            if (err) {
                console.log(err)
            }
            return null
        } else {

            Team.getByCode(user.teamCode, function (err, team) {
                if (err || !team) {
                    if (err) {
                        console.log(err)
                    }
                    return null
                }

                logger.logAction(adminUser._id, -1, "Admitted team " + team.name);

                for (id in team.memberIDs) {
                    UserController.admitUser(adminUser, id, function (err, user) {
                        if (err || !user){
                            if (err) {
                                console.log(err)
                            }
                            return null
                        }
                    })
                }
            })
        }

    })
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
    }, 1000);
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

            /**
             * To-Do: Change confirm by to setting's confirmBy date
             */
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

        //send the email
        mailer.queueEmail(user.email,'acceptanceemails',function(err){
            if(err){
                return callback(err);
            }
        });

        return callback(err, user);

    });
};

UserController.rejectUser = function(adminUser, userID, callback) {

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

        mailer.queueEmail(user.email,'rejectionemails',function(err){
            if(err){
                return callback(err);
            }
        });

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

UserController.createTeam = function(id, teamName, callback) {

    if (!id || !teamName) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            return callback({error : 'Error: Unable to get user'});
        }

        if (user.teamCode && user.teamCode.length != 0) {
            return callback({error : 'Error: You are already in a team!'});
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
            logger.logAction(id, id, "Created the team: " + teamName + " (" + team.code + ")");
            return callback(null, { team : team.toJSON(), user : newUser });
        });
    });
};

UserController.joinTeam = function(id, teamCode, callback) {

    if (!id || !teamCode) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
       if (err || !user) {
           return callback({error : 'Error: Unable to get user'});
       }

       if (user.teamCode && user.teamCode.length != 0) {
           return callback({error : 'Error: You are already in a team!'});
       }

       Team.findOne({
           code : teamCode
       }, function (err, team) {
           if (err || !team) { // Team doesn't exist yet
               return callback({ error : 'Error: Team doesn\'t exist' });
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
                       return callback({ error : 'Error: Unable to join team' });
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
                           return callback({error : 'Error: Something went wrong' });
                       }
                       logger.logAction(id, id, "Joined the team: " + newTeam + " (" + team.code + ")");
                       return callback(null, { team : newTeam, user : newUser });
                   });
               });
           } else {
               return callback({ error : "Error: Team is full" });
           }
        });
    });
};

UserController.leaveTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
       if (err || !user) {
           if (err) {
               return callback(err);
           }

           return callback({error : 'Error: Unable to get user'});
       }

       if (user.teamCode.length == 0) {
           return callback({error : 'Error: You are not in a team'});
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
                if (err) {
                    return callback(err);
                }

                return callback({error: 'Error: Unable to leave team'});
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
                        logger.logAction(-1, -1, "Deleted the team: " + newTeam.name + " (" + user.teamCode + ")");
                    });
                }

                if (!newTeam) {
                    newTeam.name = "null";
                }

                logger.logAction(id, id, "Left the team: " + newTeam.name + " (" + user.teamCode + ")");
                return callback(null, newUser)
            });
        })
    });
};

UserController.getTeam = function(id, callback) {

    if (!id) {
        return callback({error : 'Error: Invalid arguments'});
    }

    User.getByID(id, function(err, user) {
        if (err || !user) {
            if (err) {
                return callback(err);
            }

            return callback({error : 'Error: Unable to get user'});
        }

        if (user.teamCode.length == 0) {
            return callback({error : 'Error: You are not in a team'});
        }

        Team.findOne({
            code : user.teamCode
        }, function (err, team) {
            if (err || !team) { // Team doesn't exist
                return callback({ error : 'Error: Team doesn\'t exist' });
            }

            return callback(null, team);
        });
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