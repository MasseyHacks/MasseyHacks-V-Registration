var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

//var SettingsController = require('../controllers/SettingsController');
//var UserController = require('../controllers/UserController');

module.exports = function(router) {
    router.use(express.json());

    router.post('/login', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        console.log("lol dis boi connected" + req.body.username);

        if (username == password) {
            return "Lol";
        }
        else {
            return "bro wtf?";
        }
    });
};