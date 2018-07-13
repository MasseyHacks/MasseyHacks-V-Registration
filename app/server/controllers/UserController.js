var _ = require('underscore');
var User = require('../models/User');
var Settings = require('../models/Settings');

var jwt       = require('jsonwebtoken');

var request = require('request');

var validator = require('validator');
var moment = require('moment');

var UserController = {};

UserController.verify = function (token, callback) {

    if (!token) {
        return callback({error : 'Error: Invalid token'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback(err);
        }

        if (payload.type != 'verification' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                error: 'bro ur token is invalid.'
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
        }, function (err) {
            if (err) {
                console.log(err);

                return callback(err);
            };

            return callback(null, 'Success');
        });

    }.bind(this));
};

UserController.sendVerificationEmail = function (token, callback) {
    // Call the mailer
    return callback();
};

UserController.selfChangePassword = function (email, existingPassword, newPassword, callback) {
    
};

UserController.changePassword = function (email, password, callback) {

    if (!password || password.length < 6){
        return callback({ error: "Error: Password must be 6 or more characters." });
    }

    User.findOneAndUpdate({
        email : email
    }, {
        passwordLastUpdated: Date.now(),
        password: User.generateHash(password)
    }, {
        new: true
    }, function (err, user) {

        if (err || !user) {
            return callback({ error: "Error: Password must be 6 or more characters." });
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
                message: "bro ur token is invalid."
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

                    return callback(null, {message : "Success"});

                });
            });

    }.bind(this));
};

UserController.sendPasswordResetEmail = function (email, callback) {
    // Call the mailer
    return callback();
};

UserController.createUser = function (email, firstName, lastName, password, callback) {

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

    User.findOneByEmail(email).exec(function (err, user) {

        if (err) {
            return callback(err);
        }

        if (user) {
            return callback({
                error: 'Error: An account for this email already exists.'
            });
        } else {

            var name = firstName + " " + lastName;

            User.findOne({email : email}).exec(function (err, usr) {
                if (usr) {
                    return callback({
                        error: 'Error: An account for this username already exists.'
                    });
                }

                var u = new User();
                u.email = email;
                u.firstName = firstName;
                u.lastName = lastName;
                u.fullName = name;
                u.lowerCaseName = name.toLowerCase();
                u.password = User.generateHash(password);

                u.save(function (err) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    } else {
                        var token = u.generateAuthToken();

                        /**
                         * To-Do: Send verification email here
                         */

                        u = u.toJSON();
                        delete u.password;

                        return callback(null, token, u);
                    }
                });

            });
        }
    });
};

UserController.loginWithToken = function(token, callback){
    User.getByToken(token, function(err, user){
        if (!user || err) {
            return callback(err, null, null);
        }

        var token = user.generateAuthToken();

        return callback(err, token, user);
    });
};

UserController.loginWithPassword = function(email, password, callback){

    if (!email || email.length === 0) {
        return callback({
            error: 'Error: Please enter your email'
        });
    }

    if (!password || password.length === 0){
        return callback({
            error: 'Error: Please enter your password'
        });
    }

    User
        .findOne({email : email.toLowerCase()})
        .select('+password')
        .exec(function (err, user) {

            console.log(user);

            if (err || !user || user == null || !user.checkPassword(password)) {
                return callback({
                    error: "Error: Incorrect credentials"
                });
            }

            var token = user.generateAuthToken();

            return callback(null, token, user);
        });
};

UserController.injectAdmitUser = function(id, user, callback) {

};


module.exports = UserController;