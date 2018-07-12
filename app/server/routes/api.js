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


    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};