const jwt                = require('jsonwebtoken');
const validator          = require('validator');
const express            = require('express');
const request            = require('request');

const User               = require('../models/User');
const UserFields         = require('../models/data/UserFields');
const Settings           = require('../models/Settings');
const LogEvent           = require('../models/LogEvent');
const UserController     = require('../controllers/UserController');
const SettingsController = require('../controllers/SettingsController');

const permissions        = require('../services/permissions');
const logger             = require('../services/logger');
const mailer             = require('../services/email');
const stats              = require('../services/stats');

require('dotenv').load();

JWT_SECRET             = process.env.JWT_SECRET;

module.exports = function(router) {
    router.use(express.json());

    // Admin
    // Get skill question
    router.get('/skill', permissions.isAdmin, function(req, res) {

        request.get({
            uri: "https://math.ly/api/v1/algebra/linear-equations.json?difficulty=beginner",
            json: true
        }, function (err, response, body) {
            if (err) {
                logger.defaultResponse(req,res)({message: "Something went wrong on our end :("});
            } else {
                logger.defaultResponse(req, res)(null, body)
            }
        });

    });

    // Owner
    // List emails
    router.get('/email/listTemplates', permissions.isOwner, function (req,res){
        mailer.listTemplates(logger.defaultResponse(req,res));
    });

    // Owner
    // Return emails
    router.get('/email/get/:templateName', permissions.isOwner, function (req,res){
        mailer.returnTemplate(req.params.templateName,logger.defaultResponse(req,res,false));
    });

    // Owner
    //Set emails
    router.post('/email/set/:templateName', permissions.isOwner, function (req,res){
        mailer.setTemplate(req.body.templateName,req.body.templateHTML,logger.defaultResponse(req,res));
    });

    // Admin
    // Get list of user fields
    router.get('/fields', permissions.isAdmin, function (req, res) {
        UserController.getUserFields(req.userExecute, logger.defaultResponse(req, res));
    });

    // Public
    // Get applications
    router.get('/applications', permissions.isVerified, function (req, res) {
        SettingsController.getApplications(req, logger.defaultResponse(req, res));
    });

    // Public
    // Get global settings
    router.get('/settings', function (req, res) {
        SettingsController.getSettings(logger.defaultResponse(req, res));
    });

    // Admin
    // View current stats
    router.get('/stats', permissions.isAdmin, function (req, res) {
        logger.defaultResponse(req, res)(null, stats.getStats())
    })

    // Owner
    // Get schools pending approval
    router.get('/pendingSchools', permissions.isOwner, function (req, res) {
        SettingsController.getPendingSchools(logger.defaultResponse(req, res))
    })

    // Owner
    // Approve pending school
    router.post('/approveSchool', permissions.isOwner, function (req, res) {
        var schoolName = req.body.schoolName;
        SettingsController.approvePendingSchool(req.userExecute, schoolName, logger.defaultResponse(req, res));
    });

    // Owner
    // Reject pending school
    router.post('/rejectSchool', permissions.isOwner, function (req, res) {
        var schoolName = req.body.schoolName;
        SettingsController.rejectPendingSchool(req.userExecute, schoolName, logger.defaultResponse(req, res));
    });

    // Owner
    // Modify application time
    router.post('/updateRegistrationTime', permissions.isOwner, function (req, res) {
        var newTimes = req.body;
        SettingsController.modifyTime(req.userExecute, newTimes, logger.defaultResponse(req, res));
    });

    // Owner
    // Modify application time
    router.post('/updateParticipantLimit', permissions.isOwner, function (req, res) {
        var limit = req.body;
        SettingsController.modifyLimit(req.userExecute, limit, logger.defaultResponse(req, res));
    });

    // Self or admin
    // Get self or user
    router.get('/user/:userID', permissions.isUser, function(req, res) {
        var userID = req.params.userID;
        User.getByID(userID, logger.defaultResponse(req, res), req.permissionLevel);
    });

    // Checkin
    // Data varies depending on permission
    // Get all users
    router.get('/users', permissions.isCheckin, function(req, res) {
        var query  = req.query;
        UserController.getByQuery(req.userExecute, query, logger.defaultResponse(req, res));
    });

    // Developer
    // Get all 2FA QR codes
    router.get('/getAdmins', permissions.isDeveloper, function (req, res) {
       UserController.getAdmins(logger.defaultResponse(req, res));
    });

    // Developer
    // View system log
    router.get('/systemLog', permissions.isDeveloper, function (req, res) {
        var query  = req.query;
        SettingsController.getLog(query, logger.defaultResponse(req, res));
    });

    // Developer
    // Refresh statistics
    router.post('/refreshStatistics', permissions.isDeveloper, function (req, res) {
        stats.refreshStats(logger.defaultResponse(req, res));
    });

    // Owner
    // Force accept
    router.post('/forceAccept', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.admitUser(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Force reject
    router.post('/forceReject', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.rejectUser(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Reset admission state
    router.post('/resetAdmissionState', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.resetAdmissionState(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Flush email queue for user
    router.post('/flushEmailQueue', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
       UserController.flushEmailQueue(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Delete user
    router.post('/deleteUser', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.remove(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // General
    // Send slack invite
    router.post('/slack', permissions.isVerified, function(req, res){
        var user = req.userExecute;

        UserController.inviteToSlack(user._id, function(err, data){
            if (err) {
                return logger.defaultResponse(req, res)(err);
            }

            return logger.defaultResponse(req, res)(null, data);
        });
    });

    // General
    // Create team
    router.post('/createTeam', permissions.isVerified, function(req, res){
        var user = req.userExecute;
        var teamName = req.body.teamName;

        UserController.createTeam(user._id, teamName, function(err, data){
            if (err || !data) {
                return logger.defaultResponse(req, res)( err ? err : { error : 'Unable to create team' } );
            }

            return logger.defaultResponse(req, res)(null, data);
        });
    });

    // General
    // Join team
    router.post('/joinTeam', permissions.isVerified, function(req, res){
        var user = req.userExecute;
        var teamCode = req.body.teamCode;

        UserController.joinTeam(user._id, teamCode, function(err, data){
            if (err || !data) {
                return logger.defaultResponse(req, res)( err ? err : { error : 'Unable to join team' } );
            }

            return logger.defaultResponse(req, res)(null, data);
        });
    });

    // General
    // Leave team
    router.post('/leaveTeam', permissions.isVerified, function(req, res){
        var user = req.userExecute;

        UserController.leaveTeam(user._id, function(err, data){
            if (err || !data) {
                return logger.defaultResponse(req, res)( err ? err : { error : 'Unable to leave team' } );
            }

            return logger.defaultResponse(req, res)(null, data);
        });
    });

    // General
    // Get team
    router.post('/getTeam', permissions.isVerified, function(req, res){
        var user = req.userExecute;

        UserController.getTeam(user._id, function(err, data){
            if (err || !data) {
                return logger.defaultResponse(req, res)( err ? err : { error : 'Unable to get team' } );
            }

            return logger.defaultResponse(req, res)(null, data);
        });
    });

    // Reviewer
    // Accept team
    router.post('/admitTeam', permissions.isReviewer, function (req, res) {
        var userID = req.body.userID;
        UserController.teamAccept(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // General
    // Update profile
    router.post('/updateProfile', permissions.isUser, function(req, res) {
        var userID = req.body.userID;
        var profile = req.body.profile;

        UserController.updateProfile(req.userExecute, userID, profile, logger.defaultResponse(req, res));
    });

    // General
    // Update confirmation
    router.post('/updateConfirmation', permissions.isUser, function(req, res) {
        var userID = req.body.userID;
        var confirmation = req.body.confirmation;

        UserController.updateConfirmation(req.userExecute, userID, confirmation, logger.defaultResponse(req, res));
    });

    router.post('/declineInvitation', permissions.isUser, function(req, res) {
        var userID = req.body.userID;

        UserController.declineInvitation(req.userExecute, userID, logger.defaultResponse(req, res));
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
        User.find({
            'permission.level': 1,
            'status.admitted': false,
            'status.rejected': false,
            'status.waitlisted' : false
        }, function(err, users) {
            console.log(users);

            logger.logAction(req.userExecute.email, user.email, 'Rejected everyone without state.');

            /**
             * To-Do: Add async for each here
             */
        });
    });

    // Owner
    // Activate account
    router.post('/activate', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.activate(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Owner
    // Deactivate account
    router.post('/deactivate', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        UserController.deactivate(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Developer
    // Reset votes
    router.post('/voteReset', permissions.isDeveloper, function (req, res) {
        var userID = req.body.userID;
        UserController.resetVotes(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Reviewer
    // Votes admit
    router.post('/voteAdmit', permissions.isReviewer, function (req, res) {
        var userID = req.body.userID;
        UserController.voteAdmitUser(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Reviewer
    // Votes reject
    router.post('/voteReject', permissions.isReviewer, function (req, res) {
        var userID = req.body.userID;
        UserController.voteRejectUser(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    // Checkin
    // Checkin user
    router.post('/checkIn', permissions.isCheckin, function (req, res) {
        var userID = req.body.userID;
        var appPage = req.body.appPage ? req.body.appPage : null;
        UserController.checkIn(req.userExecute, userID, appPage, logger.defaultResponse(req, res));
    });

    // Checkin
    // Checkout user
    router.post('/checkOut', permissions.isCheckin, function (req, res) {
        var userID = req.body.userID;
        var appPage = req.body.appPage ? req.body.appPage : null;
        UserController.checkOut(req.userExecute, userID, appPage, logger.defaultResponse(req, res));
    });

    // Checkin
    // Waiver in
    router.post('/waiverIn', permissions.isAdmin, function (req, res) {
        var userID = req.body.userID;
        var appPage = req.body.appPage ? req.body.appPage : null;
        UserController.waiverIn(req.userExecute, userID, appPage, logger.defaultResponse(req, res));
    });

    // Checkin
    // Waiver out
    router.post('/waiverOut', permissions.isCheckin, function (req, res) {
        var userID = req.body.userID;
        UserController.waiverOut(req.userExecute, userID, logger.defaultResponse(req, res));
    });

    router.get('*', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    });
};