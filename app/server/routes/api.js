var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

module.exports = function(router) {
    router.use(express.json());

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