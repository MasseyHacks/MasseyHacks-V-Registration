var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

var fs = require('fs');
var shopData = JSON.parse(fs.readFileSync('./app/client/shop.json', 'utf8'));


require('dotenv').config({path: '../../../.env'});

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    router.post('/shopItem', function (req, res) {

        var token = req.body.token;
        var type = req.body.type;
        var item = req.body.item;

        if (!token || !type || !item) {
            return res.json({'error': 'Invalid parameters'});
        }

        User.getByToken(token, function (err, user) {

            if (err || !user) {
                console.log(err);
                return res.json({error: "Error: User not found"});
            }

            var itemJSON = shopData[item];

            if (type == 'buy') {
                if (user.money - itemJSON['cost'] < 0) {
                    return res.json({error: "Error: Insufficient funds!"})
                }

                if (user.skins.indexOf(item) != -1) {
                    return res.json({error: "Error: Item already purchased!"})
                }

                user.money -= itemJSON.cost;
                user.skins.push(item);
            } else if (type == 'use') {
                if (user.skins.indexOf(item) != -1) {
                    user.skin = item;
                } else {
                    return res.json({error: "Error: Item not unlocked"});
                }
            } else {
                return res.json({error: "Error: Command not found"});
            }

            User.findOneAndUpdate(
                {
                    "_id" : user._id
                }, {
                    $set: user
                }, {
                    new: true
                }, function (err, user) {
                    if (err || !user) {
                        console.log(err);
                        return res.json({error: "Error: Unknown error occurred"});
                    }

                    return res.json({success: "ok"});
                }
            );
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

        console.log(token);

        jwt.verify(token, JWT_SECRET, function (err, payload) {

            if (err || !payload) {
                console.log('ur bad');
                if (err) {
                    return res.json({'error': err});
                } else {
                    return res.json({'error': 'Error: no payload bro'});
                }
            }

            if (payload.type != 'user-update' || !payload.exp || Date.now() >= payload.exp * 1000) {
                return res.json({
                    error: 'Error: Invalid token'
                });
            }

            var actions = {};
            var filteredChanges = {};
            var validChanges = ['kills', 'deaths', 'matches'];

            for (var i = 0; i < validChanges.length; i++) {
                if (validChanges[i] in changes && Number.isInteger(validChanges[i])) {
                    filteredChanges[validChanges[i]] = Math.max(changes[validChanges[i]], 0);
                }
            }

            if ("actions" in changes) {
                actions = changes["actions"];
            }

            console.log(filteredChanges);
            // Past this point = good

            if (filteredChanges != {}) {
                User.findOneAndUpdate(
                    {
                        "username": username
                    }, {
                        $inc: filteredChanges
                    }, {
                        new: true
                    }, function (err, user) {
                        if (err || !user) {
                            console.log(err);
                            return res.json({error: "Error: User not found"});
                        }
                    }
                );
            }

            if (actions != {}) {
                User.findOneAndUpdate(
                    {
                        "username": username
                    }, {
                        $push: {"actions": actions}
                    }, {
                        new: true
                    }, function (err, user) {
                        if (err || !user) {
                            console.log(err);
                            return res.json({error: "Error: User not found"});
                        }
                    }
                );
            }

            return res.json({message: "Success"});

        }.bind(this));

    });
    
    router.post('/updateZhekko', function (req, res) {
        var token = req.body.token;
        var username = req.body.username;
        var sender = req.body.sender;
        var amount = req.body.amount;

        if (!token || !username || !sender || !amount || amount <= 0) {
            return res.json({'error': 'Invalid parameters'});
        }

        jwt.verify(token, JWT_SECRET, function (err, payload) {
            if (err || !payload) {
                console.log('ur bad');
                return res.json({'error': err});
            }

            if (payload.type != 'zhekko' || !payload.exp || Date.now() >= payload.exp * 1000) {
                return res.json({
                    error: 'Error: Invalid token'
                });
            }

            // Past this point = good

            User.findOneAndUpdate(
                {
                    "username": username
                }, {
                    $push: {
                        'actions': {
                            "caption": sender + " sent you " + amount + " Zhekkos!",
                            "date":Date.now(),
                            "type":"INFO"
                        }
                    },
                    $inc: {
                        'money' : amount
                    }
                }, {
                    new: true
                }, function (err, user) {
                    if (err || !user) {
                        return res.json({error: "Error: User not found"});
                    }

                    return res.json({message: "Success"});
                }
            );

        }.bind(this));

        // [username, +zhekko]
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
            return res.json({user: user});
        });
    });

    router.get('/', function (req, res) {
        res.end("lol, what are you doing here?");
    })
};