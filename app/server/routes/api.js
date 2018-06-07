var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

var onlineUsers = [];

setInterval(function () {
    onlineUsers = [];
}, 30000);


require('dotenv').config({path: '../../../.env'});

JWT_SECRET = process.env.JWT_SECRET;


module.exports = function(router) {
    router.use(express.json());

    router.get('/version', function (req, res) {
        res.sendfile('./app/client/version.json');
    });

    router.get('/messages/:token', function (req, res) {
        var token = req.params.token;

        UserController.getMessages(token, function (response) {
            res.json(response);
        })
    });

    router.post('/chat', function (req, res) {
        var token = req.body.token;
        var messsage = req.body.message;

        UserController.sendMessage(token, messsage, function (response) {
            return res.json(response);
        })
    });

    router.post('/shopItem', function (req, res) {

        var token = req.body.token;
        var type = req.body.type;
        var item = req.body.item;

        UserController.shopAction(token, type, item, function (response) {
            return res.json(response);
        });

    });

    // Admin update user stuff
    router.post('/update', function (req, res) {
        // user [username, +kills, +deaths, +matches, +action]

        var token = req.body.token;
        var username = req.body.username;
        var changes = req.body.changes;

        if (!token || !username || !changes) {
            return res.json({'error': 'Invalid parameters'});
        }

        UserController.updateProfile(token, username, changes, function (response) {
            return res.json(response);
        })

    });
    
    router.post('/updateZhekko', function (req, res) {
        var token = req.body.token;
        var username = req.body.username;
        var sender = req.body.sender;
        var amount = req.body.amount;

        UserController.giveZhekko(token, username, sender, amount, function (response) {
            return res.json(response);
        })
    });


    router.get('/shop', function (req, res) {
        res.sendfile('./app/client/shop.json')
    });

    router.get('/data/:username', function (req, res) {
        var username = req.params.username;

        if (!username) {
            return res.json({error: "Error: Invalid username"});
        }

        User.findOneByUsername(username).exec(function (err, user) {

            if (user) {
                user = user.toJSON();
                delete user.email;
                delete user.id;
                delete user.money;
                delete user._id;
                delete user.__v;

                for (var i = user.actions.length - 1; i > -1; i--) {
                    if (user.actions[i]["type"] == 'INFO') {
                        user.actions.splice(i, 1);
                    }
                }

                return res.json(user);
            } else {
                return res.json({error: "Error: Invalid username"});
            }

        });

    });

    router.get('/refresh/:token', function (req, res) {

        var token = req.params.token;

        console.log(token);

        if (!token) {
            return res.json({error: "Error: Invalid Token"});
        }

        User.getByToken(token, function (err, user) {

            if (user) {
                if (onlineUsers.indexOf(user.username) == -1) {
                    onlineUsers.push(user.username);
                }
            }

            return res.json({user: user, online : onlineUsers.length});
        });
    });

    router.get('/', function (req, res) {
        res.end("lol, what are you doing here?");
    })
};