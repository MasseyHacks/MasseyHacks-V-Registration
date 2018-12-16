const jwt = require('jsonwebtoken');
const validator = require('validator');
const express = require('express');
const request = require('request');
const exec = require('child_process').exec;
const crypto = require('crypto');
require('dotenv').load();

GITHUB_SECRET = process.env.GITHUB_SECRET;

module.exports = function (router) {
    router.use(express.json());

    //auto pull

    router.post('/pull', function (req, res) {
        req.on('data', function (chunk) {
            let sig = "sha1=" + crypto.createHmac('sha1', GITHUB_SECRET).update(chunk.toString()).digest('hex');

            if (req.headers['x-hub-signature'] === sig) {
                exec('cd ../../../' + ' && git pull');
                console.log("I PULLED!");
            }
        });

        res.end();
    })
};