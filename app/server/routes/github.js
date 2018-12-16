const jwt = require('jsonwebtoken');
const validator = require('validator');
const express = require('express');
const request = require('request');
const exec = require('child_process').exec;
const crypto = require('crypto');
require('dotenv').load();

GITHUB_SECRET = process.env.GITHUB_SECRET;
console.log(GITHUB_SECRET);

module.exports = function (router) {
    router.use(express.json());

    //auto pull

    router.post('/pull', function (req, res) {
        exec('cd ../../../' + ' && git pull');
        res.send("me has pulled");
        // console.log("made it this far lol");
        // let sig = "sha1=" + crypto.createHmac('sha1', GITHUB_SECRET).update(req.toString()).digest('hex');
        // console.log(req.headers['x-hub-signature'], sig)
        // if (req.headers['x-hub-signature'] == sig) {
        //     exec('cd ../../../' + ' && git pull');
        //     res.send("me has pulled");
        //     console.log("I PULLED!");
        // } else {
        //     res.send("lmao u can't do that");
        //     console.log("ew hmac failed");
        // }

        res.end();
    })
};