var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Types of tokens:
    // authentication
    // game-auth
    // user-update
    // zhekko

    router.get('/checkGameAuth/:token', function (req, res) {

        var token = req.params.token;

        if (!token) {
            return res.json({message: 'false'});
        }

        jwt.verify(token, JWT_SECRET, function (err, payload) {
            if (err || !payload || payload.type != 'game-auth' || !payload.exp || Date.now() >= payload.exp * 1000) {
                return res.json({message: 'false'});
            } else {
                return res.json({message: 'true'});
            }
        }.bind(this))

    });

    router.get('/getGameAuth/:token/:server', function (req, res) {

        var token = req.params.token;
        var server = req.params.server;

        if (!token || !server) {
            return res.json({error: "Error: Invalid Token"});
        }

        User.getByToken(token, function (err, user) {

            if (err || !user) {
                if (err) {
                    return res.json(err);
                }

                return res.json({"error" : "Auth Error"});
            }

            return res.json(jwt.sign({type: "game-auth", username: user.username, server: server}, JWT_SECRET, {
                expiresIn: 360
            }));

        });
    });


    router.post('/register', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var username = req.body.username;

        console.log("lol dis boi connected " + req.body.email);

        if (!email) {
            return res.json({error: "Error: No email provided"});
        }

        if (!password) {
            return res.json({error: "Error: No password provided"});
        }

        if (!username) {
            return res.json({error: "Error: No username provided"});
        }

        UserController.createUser(email, username, password, function (err, token, user) {
                if (err || !user) {
                    if (err) {
                        return res.json(err);
                    }
                    return res.json({error: "Error: Unable to process request"});
                }
                return res.json({
                    token: token,
                    user: user
                });
        })

    });

    router.post('/login', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var token = req.body.token;

        console.log("lol dis boi connected " + req.body.email);

        if (token) {

            console.log(token);

            UserController.loginWithToken(token, function (err, token, user) {
                if (err || !user || !token) {
                    if (err) {
                        console.log(err);
                    }

                    return res.json({error: "Error: Invalid Token"});
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
                    return res.json(err);
                }
                return res.json({
                    token: token,
                    user: user
                });
            })
        }
    });

    router.get('/', function (req, res) {
        res.end("lol, what are you doing here?");
    })
};