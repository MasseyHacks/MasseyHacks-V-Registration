var _ = require('underscore');
var User = require('../models/User');
var jwt       = require('jsonwebtoken');

var request = require('request');

var validator = require('validator');
var moment = require('moment');

var UserController = {};

UserController.createUser = function (email, username, password, callback) {

    if (typeof email !== "string" || !validator.isEmail(email)){
        return callback({
            error: "Error: Incorrect email format"
        });
    }

    if (email.includes('"') || username.includes('"') || username.includes('@')) {
        return callback({
            error: "Error: Username contains invalid Characters"
        });
    }

    if (!password || password.length < 6){
        return callback({ error: "Error: Password must be 6 or more characters."}, false);
    }

    if (password == "Password123") {
        return callback({ error: "Error: Hi adam, u have a bad passwd"}, false);
    }

    if (email.length > 50 || username.length > 20) {
        return callback({ error: "Error: Bro ur username too long bro"});
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

            User.findOne({$or : [{username : username}, {email : username.toLowerCase()}]}).exec(function (err, usr) {
                if (usr) {
                    return callback({
                        error: 'Error: An account for this username already exists.'
                    });
                }

                var u = new User();
                u.email = email;
                u.username = username;
                u.password = User.generateHash(password);
                u.save(function (err) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    } else {
                        var token = u.generateAuthToken();

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
            error: 'Error: Bro you need to enter an email'
        });
    }

    if (!password || password.length === 0){
        return callback({
            error: 'Error: Please enter a password'
        });
    }

    User
        .findOne({$or : [{email : email.toLowerCase()}, {username : email}]})
        .select('+password')
        .exec(function (err, user) {
            if (err || !user) {
                return callback({
                    error: "Error: Incorrect credentials"
                });
            }

            if (!user.checkPassword(password)) {

                return callback({
                    error: "Error: Incorrect credentials"
                });
            }

            // yo dope nice login here's a token for your troubles
            var token = user.generateAuthToken();

            return callback(null, token, user);
        });

};



UserController.createUser("karl@gmail.com", "karlz", "karlzhu", function (lol) {
    console.log(lol);
});

/*
User.findOneAndUpdate({"email":"karl@gmail.com"}, {$push: {'actions' : {"caption":"jason attacked", "date":Date.now(), "type":"KILL"}}}, {new: true}, function (err, user) {
    if (user) {
        console.log(user.actions[0].caption);
    }
});*/


module.exports = UserController;