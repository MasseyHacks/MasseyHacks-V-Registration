var _ = require('underscore');
var User = require('../models/User');
var request = require('request');

var validator = require('validator');
var moment = require('moment');
var shuffleSeed = require('shuffle-seed');

var UserController = {};

var u = new User();
u.email = "lol@hemadil.com";
u.password = User.generateHash("lol");
u.save(function (err) {
    if (err) {
        console.log("You are screwed " + err);
    } else {
        console.log("lol ur in bud");
    }
});

User.findOne({email:"lol@hemadil.com"}, 'password', function (err, user) {
    console.log(user);
})

module.exports = UserController;