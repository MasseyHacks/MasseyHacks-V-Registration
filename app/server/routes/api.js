var jwt            = require('jsonwebtoken');
var validator      = require('validator');
var express        = require('express');

var User           = require('../models/User');
var UserController = require('../controllers/UserController');

var permissions    = require('../services/permissions');

require('dotenv').config({path: '../../../.env'});

JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Developer
    // View system log
    router.post('/log', permissions.isDeveloper, function (req, res) {
        return SettingController.getLog();
    });

    // Developer
    // Inject votes accept
    router.post('/injectVoteAdmit', permissions.isDeveloper, function (req, res) {
        var id = req.params.id;
        var user = req.user;

        UserController.injectAdmitUser(id, user, defaultResponse(req, res));
    });

    // Developer
    // Inject votes reject
    router.post('/injectVoteReject', permissions.isDeveloper, function (req, res) {
        // Accept the hacker. Admin only
        var id = req.params.id;
        var user = req.user;
        UserController.injectRejectUser(id, user, defaultResponse(req, res));
    });

    // Developer
    // Reset votes
    router.post('/voteReset', permissions.isDeveloper, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.resetVotes(id, user, defaultResponse(req, res));
    });

    // Owner
    // Force accept
    router.post('/forceAccept', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;

        UserController.admitUser(id, user, defaultResponse(req, res));
    });

    // Owner
    // Force reject
    router.post('/forceReject', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;

        UserController.rejectUser(id, user, defaultResponse(req, res));
    });

    // Owner
    // Reset admission state
    router.post('/resetAdmissionState', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.resetAdmissionState(id, user, defaultResponse(req, res));
    });

    // Owner
    // Flush email queue for user
    router.post('/flushEmailQueue', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.flashEmailQueue(id, user, defaultResponse(req, res));
    });

    // Owner
    // Delete user
    router.post('/deleteUser', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.remove(id, user, defaultResponse(req, res));
    });

    // Owner
    // Change password
    router.post('/changePassword', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.remove(id, user, defaultResponse(req, res));
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
        var id = req.params.id;
        var user = req.user;
        UserController.activate(id, user, defaultResponse(req, res));
    });

    // Owner
    // Deactivate account
    router.post('/deactivateAccount', permissions.isOwner, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.deactivate(id, user, defaultResponse(req, res));
    });

    // Reviewer
    // Votes admit
    router.post('/injectVoteAdmit', permissions.isReviewer, function (req, res) {
        var id = req.params.id;
        var user = req.user;

        UserController.voteAdmitUser(id, user, defaultResponse(req, res));
    });

    // Reviewer
    // Votes reject
    router.post('/injectVoteReject', permissions.isReviewer, function (req, res) {
        // Accept the hacker. Admin only
        var id = req.params.id;
        var user = req.user;
        UserController.voteRejectUser(id, user, defaultResponse(req, res));
    });

    // Checkin
    // Checkin user
    router.post('/checkIn', permissions.isCheckin, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.checkIn(id, user, defaultResponse(req, res));
    });

    // Checkin
    // Checkout user
    router.post('/checkOut', permissions.isCheckin, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.checkOut(id, user, defaultResponse(req, res));
    });

    // Checkin
    // Waiver in
    router.post('/waiverIn', permissions.isCheckin, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.waiverIn(id, user, defaultResponse(req, res));
    });

    // Checkin
    // Waiver out
    router.post('/waiverOut', permissions.isCheckin, function (req, res) {
        var id = req.params.id;
        var user = req.user;
        UserController.waiverOut(id, user, defaultResponse(req, res));
    });

    router.get('/', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};