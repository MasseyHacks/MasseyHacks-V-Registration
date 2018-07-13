var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

require('dotenv').config({path: '../../../.env'});

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Slack error reporting
    /**
     * Default response to send an error and the data.
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    function defaultResponse(req, res){
        return function(err, data){
            if (err){
                // Only send error if in production
                // Keep everyone happy
                if (process.env.NODE_ENV === 'production'){
                    request
                        .post(process.env.SLACK_HOOK,
                            {
                                form: {
                                    payload: JSON.stringify({
                                        "text":
                                        process.env.ADMIN_UIDS + "\nAn issue was detected with the server.\n\n``` \n" +
                                        "Request: \n " +
                                        req.method + ' ' + req.url +
                                        "\n ------------------------------------ \n" +
                                        "Body: \n " +
                                        JSON.stringify(req.body, null, 2) +
                                        "\n ------------------------------------ \n" +
                                        "\nError:\n" +
                                        JSON.stringify(err, null, 2) +
                                        "``` \n"
                                    })
                                }
                            },
                            function (error, response, body) {
                                return res.status(500).send({
                                    message: "Your error has been recorded, we'll get right on it!"
                                });
                            }
                        );
                } else {
                    return res.status(500).send(err);
                }
            } else {
                console.log(data);
                return res.json(data);
            }
        };
    }

    // Permission Validation
    //
    // 0 - Hacker Unverified
    // 1 - Hacker
    // 2 - Check In
    // 3 - Admin
    // 4 - Review
    // 5 - Owner
    // 6 - Developer

    function getToken(req){
        return req.headers['x-access-token'];
    }

    function isVerified(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level > 0) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }

    function isAdmin(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 3) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }

    function isReviewer(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 4) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }

    function isOwner(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 5) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }

    function isDeveloper(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level == 6) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }

    // Developer
    // View system log

    // Developer
    // Inject votes accept

    // Developer
    // Inject votes reject

    // Developer
    // Reset votes

    // Owner
    // Force accept

    // Owner
    // Force reject

    // Owner
    // Reset admission state

    // Owner
    // Flush email queue for user

    // Owner
    // Delete user

    // Owner
    // Change password

    // Owner
    // Send password reset

    // Owner
    // Send admit emails

    // Owner
    // Send reject emails

    // Owner
    // Reject everyone without status

    // Owner
    // Send reminder emails

    // Owner
    // Activate account

    // Owner
    // Deactivate account

    // Checkin
    // Checkin user

    // Checkin
    // Checkout user

    // Checkin
    // Waiver in

    // Checkin
    // Waiver out

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};