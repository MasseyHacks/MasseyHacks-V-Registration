var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Register user
    router.post('/register', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;

        console.log(req.body.email + " registered.");

        if (!email) {
            return res.status(500).json({error: "Error: No email provided"});
        }

        if (!password) {
            return res.status(500).json({error: "Error: No password provided"});
        }

        if (!firstName) {
            return res.status(500).json({error: "Error: No first name provided"});
        }

        if (!lastName) {
            return res.status(500).json({error: "Error: No first name provided"});
        }

        UserController.createUser(email, firstName, lastName, password, function (err, token, user) {
                if (err || !user) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    return res.status(500).json({error: "Error: Unable to process request"});
                }
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
        var token = req.body.token;

        console.log(req.body.email + " attempting to login.");

        if (token) {

            console.log(token);

            UserController.loginWithToken(token, function (err, token, user) {
                if (err || !user || !token) {
                    if (err) {
                        console.log(err);
                    }

                    return res.status(400).json({error: "Error: Invalid Token"});
                }
                return res.json({
                    token: token,
                    user: user
                });
            })
        } else {
            UserController.loginWithPassword(email, password, function (err, token, user) {
                if (err || !user) {
                    console.log(err);
                    return res.status(400).json(err);
                }
                return res.json({
                    token: token,
                    user: user
                });
            })
        }
    });

    // Password reset

    // Send password reset email

    // Verify user

    // Send verify email

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};