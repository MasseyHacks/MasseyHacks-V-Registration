const jwt = require('jsonwebtoken');
const validator = require('validator');
const express = require('express');
const request = require('request');
const spawn = require('child_process').spawn;
const crypto = require('crypto');
const logger = require('../services/logger');
require('dotenv').load();

GITHUB_SECRET = process.env.GITHUB_SECRET;
console.log(GITHUB_SECRET);

module.exports = function (router) {
    router.use(express.json());

    //auto pull

    router.post('/pull', function (req, res) {


        let sig = "sha1=" + crypto.createHmac('sha1', GITHUB_SECRET).digest('hex');


        console.log(req.headers['x-hub-signature'], sig)
        if (req.headers['x-hub-signature'] == sig) {

            var child = spawn('./pull.sh');

            child.stdout.on('data', function(data) {
                console.log('child stdout:\n' + data);

                logger.logAction(-1, -1, 'Webhook source update successful', 'STDOUT: ' + data);
            });

            res.send("me has pulled");
            console.log("I PULLED!");
        } else {
            logger.logAction(-1, -1, 'Webhook source update rejected', 'IP: ' + (req.headers['x-forwarded-for'] || req.connection.remoteAddress) + ' Headers: ' + (req.rawHeaders).toString());

            res.send("lmao u can't do that");
            console.log("ew hmac failed");
        }

        res.end();
    })
};