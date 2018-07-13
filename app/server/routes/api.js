var jwt            = require('jsonwebtoken');
var validator      = require('validator');
var express        = require('express');

var User           = require('../models/User');
var UserController = require('../controllers/UserController');

require('dotenv').config({path: '../../../.env'});

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Slack error reporting
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
        var token = req.headers['x-access-token'];

        if (!token) {
            token = req.body.token;
        }

        return token;
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

    function isCheckin(req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 2) {
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
    router.post('/log', isDeveloper, function (req, res) {
        return SettingController.getLog();
    });

    // Developer
    // Inject votes accept
    router.post('/injectVoteAdmit', isDeveloper, function (req, res) {
        
    });

    // Developer
    // Inject votes reject
    router.post('/injectVoteReject', isDeveloper, function (req, res) {

    });

    // Developer
    // Reset votes
    router.post('/voteReset', isDeveloper, function (req, res) {

    });

    // Owner
    // Force accept
    router.post('/forceAccept', isOwner, function (req, res) {

    });

    // Owner
    // Force reject
    router.post('/forceReject', isOwner, function (req, res) {

    });

    // Owner
    // Reset admission state
    router.post('/resetAdmissionState', isOwner, function (req, res) {

    });

    // Owner
    // Flush email queue for user
    router.post('/flushEmailQueue', isOwner, function (req, res) {

    });

    // Owner
    // Delete user
    router.post('/deleteUser', isOwner, function (req, res) {

    });

    // Owner
    // Change password
    router.post('/changePassword', isOwner, function (req, res) {

    });

    // Owner
    // Send admit emails
    router.post('/sendAcceptanceEmails', isOwner, function (req, res) {

    });

    // Owner
    // Send reject emails
    router.post('/sendRejectionEmails', isOwner, function (req, res) {

    });

    // Owner
    // Send reminder emails
    router.post('/sendReminderEmails', isOwner, function (req, res) {

    });

    // Owner
    // Reject everyone without status
    router.post('/rejectNoStates', isOwner, function (req, res) {

    });

    // Owner
    // Activate account
    router.post('/activateAccount', isOwner, function (req, res) {

    });

    // Owner
    // Deactivate account
    router.post('/deactivateAccount', isOwner, function (req, res) {

    });

    // Checkin
    // Checkin user
    router.post('/checkIn', isCheckin, function (req, res) {

    });

    // Checkin
    // Checkout user
    router.post('/checkOut', isCheckin, function (req, res) {

    });

    // Checkin
    // Waiver in
    router.post('/waiverIn', isCheckin, function (req, res) {

    });

    // Checkin
    // Waiver out
    router.post('/waiverOut', isCheckin, function (req, res) {

    });

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};