var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');
var permissions    = require('../services/permissions');

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Register user
    router.post('/register', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;

        if (!email) {
            return res.status(400).json({error: "Error: No email provided"});
        }

        if (!password) {
            return res.status(400).json({error: "Error: No password provided"});
        }

        if (!firstName) {
            return res.status(400).json({error: "Error: No first name provided"});
        }

        if (!lastName) {
            return res.status(400).json({error: "Error: No last name provided"});
        }

        UserController.createUser(email, firstName, lastName, password, function (err, token, user) {
                if (err || !user) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    return res.status(500).json({error: "Error: Unable to process request"});
                }

                console.log(req.body.email + " registered.");

                return res.json({
                    token: token,
                    user: user
                });
        })
    });

    // Login and issue token
    router.post('/login', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var token = permissions.getToken(req);

        console.log(req.body.email + " attempting to login.");

        if (token) {

            console.log(token);

            UserController.loginWithToken(token, function (err, token, user) {
                if (err || !user || !token) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json(err);
                    }

                    return res.status(400).json({error: "Error: Invalid Token"});
                }
                return res.json({
                    token: token,
                    user: user
                });
            })
        } else {
            UserController.loginWithPassword(email, password, function (err, user, token) {

                if (err || !user) {
                    console.log(err);
                    return res.status(401).json(err);
                }

                return res.json({
                    token: token,
                    user: user
                });

            })
        }
    });

    // Password reset
    router.post('/reset', function (req, res) {
        var token = req.body.token;
        var password = req.body.password;

        if (!token) {
            return res.status(400).json({error: "Error: Invalid token"});
        }

        UserController.resetPassword(token, password, function (err, msg) {
            if (err || !msg) {
                if (err) {
                    return res.status(400).json(err);
                }

                return res.status(400).json({error: "Error: Invalid token"});
            }

            return res.status(400).json(msg);
        });
    });

    // Send password reset email
    router.post('/requestReset', function (req, res) {
        var email = req.body.email;

        console.log(req.body.email + " requesting reset email.");

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({error: "Error: Invalid email"});
        }

        UserController.sendPasswordResetEmail(email, function (err) {
            if (err) {
                return res.status(400).json({error: "Error: Something went wrong."});
            }

            return res.json({
                message: 'Success'
            });
        });
    });

    // Verify user
    router.post('/verify', function (req, res) {
        var token = req.body.token;

        if (!token) {
            return res.status(400).json({error: "Error: Invalid token"});
        }

        UserController.verify(token, function (err, msg) {
            if (err || !msg) {
                if (err) {
                    return res.status(400).json(err);
                }

                return res.status(400).json({error: "Error: Invalid token"});
            }

            return res.json({
                message: 'Success'
            });
        });
    });

    // Send verify email
    router.post('/requestVerify', function (req, res) {
        var token = req.body.token;

        if (!token) {
            return res.status(400).json({error: "Error: Invalid token"});
        }

        UserController.sendVerificationEmail(email, function (err) {
            if (err) {
                return res.status(400).json({error: "Error: Something went wrong."});
            }

            return res.json({
                message: 'Success'
            });
        });
    });

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};