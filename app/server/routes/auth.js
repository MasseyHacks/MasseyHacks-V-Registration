var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var UserController = require('../controllers/UserController');

module.exports = function(router) {
    router.use(express.json());

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
                    } else {
                        return res.json({error: "Error: Unable to process request"});
                    }
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
            UserController.loginWithToken(token, function (err, token, user) {
                if (err || !user) {
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
                    return res.json({error: "Error: Incorrect email or password"});
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