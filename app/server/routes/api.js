var jwt                = require('jsonwebtoken');
var validator          = require('validator');
var express            = require('express');

var User               = require('../models/User');
var UserController     = require('../controllers/UserController');
var SettingsController = require('../controllers/SettingsController');

var permissions        = require('../services/permissions');
var logger             = require('../services/logger');

require('dotenv').config({path: '../../../.env'});

JWT_SECRET             = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Developer
    // View system log
    router.post('/log', permissions.isDeveloper, function (req, res) {
        Logs.getLog(logger.defaultResponse(req, res));


    /*
    // Developer
    // Inject votes accept
    router.post('/injectVoteAdmit', permissions.isDeveloper, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.injectAdmitUser(adminID, userID, logger.defaultResponse(req, res));
    });

    // Developer
    // Inject votes reject
    router.post('/injectVoteReject', permissions.isDeveloper, function (req, res) {
        // Accept the hacker. Admin only
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.injectRejectUser(adminID, userID, logger.defaultResponse(req, res));
    });*/

    // Developer
    // Reset votes
    router.post('/voteReset', permissions.isDeveloper, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.resetVotes(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Force accept
    router.post('/forceAccept', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.admitUser(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Force reject
    router.post('/forceReject', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.rejectUser(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Reset admission state
    router.post('/resetAdmissionState', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.resetAdmissionState(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Flush email queue for user
    router.post('/flushEmailQueue', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        var userID = req.body.userID;

        UserController.flushEmailQueue(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Delete user
    router.post('/deleteUser', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.remove(adminID, userID, logger.defaultResponse(req, res));
    });

    // General
    // Change password
    router.post('/changePassword', permissions.isVerified, function (req, res) {

        var token = permissions.getToken(req);
        var newPassword = req.body.newPassword;
        var oldPassword = req.body.oldPassword;

        UserController.selfChangePassword(token, oldPassword, newPassword, logger.defaultResponse(req, res));
    });

    // Change password
    router.post('/adminChangePassword', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        var password = req.body.password;

        UserController.adminChangePassword(adminID, userID, password, logger.defaultResponse(req, res));
    });


    // Owner
    // Send admit emails
    router.post('/sendAcceptanceEmails', permissions.isOwner, function (req, res) {

    });

    // Owner
    // Send reject emails
    router.post('/sendRejectionEmails', permissions.isOwner, function (req, res) {

    });

    // Owner
    // Send reminder emails
    router.post('/sendReminderEmails', permissions.isOwner, function (req, res) {

    });

    // Owner
    // Reject everyone without status
    router.post('/rejectNoStates', permissions.isOwner, function (req, res) {

    });

    // Owner
    // Activate account
    router.post('/activateAccount', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.activate(adminID, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Deactivate account
    router.post('/deactivateAccount', permissions.isOwner, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.deactivate(adminID, userID, logger.defaultResponse(req, res));
    });

    // Reviewer
    // Votes admit
    router.post('/voteAdmit', permissions.isReviewer, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;

        UserController.voteAdmitUser(adminID, userID, logger.defaultResponse(req, res));
    });

    // Reviewer
    // Votes reject
    router.post('/voteReject', permissions.isReviewer, function (req, res) {
        // Accept the hacker. Admin only
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.voteRejectUser(adminID, userID, logger.defaultResponse(req, res));
    });

    // Checkin
    // Checkin user
    router.post('/checkIn', permissions.isCheckin, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.checkIn(adminID, userID, logger.defaultResponse(req, res));
    });

    // Checkin
    // Checkout user
    router.post('/checkOut', permissions.isCheckin, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.checkOut(adminID, userID, logger.defaultResponse(req, res));
    });

    // Checkin
    // Waiver in
    router.post('/waiverIn', permissions.isCheckin, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.waiverIn(adminID, userID, logger.defaultResponse(req, res));
    });

    // Checkin
    // Waiver out
    router.post('/waiverOut', permissions.isCheckin, function (req, res) {
        var adminID = req.body.adminID;
        var userID = req.body.userID;
        UserController.waiverOut(adminID, userID, logger.defaultResponse(req, res));
    });

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};