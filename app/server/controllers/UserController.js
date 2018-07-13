var _ = require('underscore');
var User = require('../models/User');
var Settings = require('../models/Settings');

var jwt       = require('jsonwebtoken');

var request = require('request');

var validator = require('validator');
var moment = require('moment');

var UserController = {};

UserController.verify = function (token) {

};

UserController.sendVerificationEmail = function (token) {

};

UserController.selfChangePassword = function (email, existingPassword, newPassword) {
    
};

UserController.changePassword = function (email, password) {
    
};

UserController.resetPassword = function (token, password) {

};

UserController.sendPasswordResetEmail = function (email, callback) {
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
            error: 'Error: Invalid Email Format'
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


module.exports = UserController;