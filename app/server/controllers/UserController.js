var _ = require('underscore');
var User = require('../models/User');

var request = require('request');

var validator = require('validator');
var moment = require('moment');
var shuffleSeed = require('shuffle-seed');

var UserController = {};

var fs = require('fs');
var shopData = JSON.parse(fs.readFileSync('./app/client/shop.json', 'utf8'));

var messageQueue = [];
var messageLimiter = {};
var messageCap = 30;

function purgeMessageQueue() {
    messageLimiter = {};
    if (messageQueue.length > 10) {
        messageQueue = messageQueue.slice(messageQueue.length - 10, messageQueue.length);
    } else if (messageQueue.length > 0) {
        messageQueue.shift();
    }
}

setInterval(function () {
    purgeMessageQueue();
}, 30000);

UserController.getMessages = function (token, callback) {

    if (!token) {
        return callback({'error': 'Invalid parameters'});
    }

    User.getByToken(token, function (err, user) {
        if (err || !user) {
            return callback({'error' : 'Invalid token'});
        }

        return callback({'messages':messageQueue});
    })

};

UserController.sendMessage = function (token, message, callback) {
    if (!token || !message || message.length > 100) {
        return callback({'error': 'Invalid parameters'});
    }

    User.getByToken(token, function (err, user) {
        if (err || !user) {
            return callback({'error' : 'Invalid token'});
        }

        if (token in messageLimiter) {
            if (messageLimiter[token] > messageCap) {
                return callback({'error' : 'Message limit reached'});
            }

            messageLimiter[token]++;
        } else {
            messageLimiter[token] = 1;
        }

        messageQueue.push({'message' : '[' + user.username + '] ' + message, 'time' : Date.now()});

        return callback({'messages': messageQueue});
    })
};

UserController.giveZhekko = function (token, username, sender, amount, callback) {
    if (!token || !username || !sender || !amount || amount <= 0) {
        return callback({'error': 'Invalid parameters'});
    }

    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback({'error': err});
        }

        if (payload.type != 'zhekko' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
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
                    return callback({error: "Error: User not found"});
                }

                return callback({message: "Success"});
            }
        );

    }.bind(this));  
};

UserController.updateProfile = function (token, user, changes, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {

        if (err || !payload) {
            console.log('ur bad');
            if (err) {
                return callback({'error': err});
            } else {
                return callback({'error': 'Error: no payload bro'});
            }
        }

        if (payload.type != 'user-update' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
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
                        return callback({error: "Error: User not found"});
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
                        return callback({error: "Error: User not found"});
                    }
                }
            );
        }

        return callback({message: "Success"});

    }.bind(this));
};

UserController.shopAction = function (token, type, item, callback) {

    if (!token || !type || !item) {
        return callback({'error': 'Invalid parameters'});
    }

    User.getByToken(token, function (err, user) {

        if (err || !user) {
            console.log(err);
            return callback({error: "Error: User not found"});
        }

        var itemJSON = shopData[item];

        if (type == 'buy') {
            if (user.money - itemJSON['cost'] < 0) {
                return callback({error: "Error: Insufficient funds!"})
            }

            if (user.skins.indexOf(item) != -1) {
                return callback({error: "Error: Item already purchased!"})
            }

            user.money -= itemJSON.cost;
            user.skins.push(item);
        } else if (type == 'use') {
            if (user.skins.indexOf(item) != -1) {
                user.skin = item;
            } else {
                return callback({error: "Error: Item not unlocked"});
            }
        } else {
            return callback({error: "Error: Command not found"});
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
                    return callback({error: "Error: Unknown error occurred"});
                }

                return callback({success: "ok"});
            }
        );
    });
};

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
                        console.log("Error: Something went wrong...");
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
        if (!user || !user.active) {
            return callback(err, token, null);
        }

        return callback(err, token, user);
    });
};

function login(err, user) {
    if (err) {
        return callback(err);
    }
    if (!user) {
        return callback({
            error: "Error: Incorrect email or password"
        });
    }

    if (!user.checkPassword(password)) {

        return callback({
            error: "Error: Incorrect username or password"
        });
    }

    // yo dope nice login here's a token for your troubles
    var token = user.generateAuthToken();

    return callback(null, token, user);
}

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
            if (err) {
                return callback(err);
            }
            if (!user) {
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