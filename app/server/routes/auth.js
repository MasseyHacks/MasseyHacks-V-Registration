var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var UserController = require('../controllers/UserController');

module.exports = function(router) {
    router.use(express.json());

    router.post('/login', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        console.log("lol dis boi connected " + req.body.username);

        if (username == password) {
            res.end("Lol dis ur token");
        }
        else {
            res.end("Error: Incorrect username or password");
        }
    });

    router.get('/', function (req, res) {
        res.end("lol, what are you doing here?");
    })
};