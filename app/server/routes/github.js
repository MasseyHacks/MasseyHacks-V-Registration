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

    router.post('/pull', function (req, res) {
        if (GITHUB_SECRET) {

            let sig = "sha1=" + crypto.createHmac('sha1', GITHUB_SECRET).update(JSON.stringify(req.body)).digest('hex');

            console.log(req.headers['x-hub-signature'], sig)
            if (req.headers['x-hub-signature'] == sig) {

                var child = spawn('./pull.sh ' + process.env.GITHUB_ORIGIN +  ' ' + process.env.GITHUB_BRANCH);

                child.stdout.on('data', function (data) {
                    console.log('child stdout:\n' + data);

                    logger.logAction(-1, -1, 'Webhook source update successful. Commit: ' + req.body['head_commit']['message'], data);
                });

                res.send("me has pulled");
                console.log("I PULLED!");
            } else {
                logger.logAction(-1, -1, 'Webhook source update rejected', 'IP: ' + (req.headers['x-forwarded-for'] || req.connection.remoteAddress) + ' Headers: ' + (req.rawHeaders).toString());

                res.send("lmao u can't do that");
                console.log("Pull failed.");
            }

        }

        res.end();
    })
};