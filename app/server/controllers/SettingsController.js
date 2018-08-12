const _ = require('underscore');
const User = require('../models/User');
const Settings = require('../models/Settings');

const jwt       = require('jsonwebtoken');

const request = require('request');

const validator = require('validator');
const moment = require('moment');
const logger = require('../services/logger');

const SettingsController = {};

// Add school

// Search for schools

// Dynamic email magic goes here

// Get stats

SettingsController.getPendingSchools = function(callback) {
    Settings.findOne(
        {},
        function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to find settings'})
            }

            return settings.pendingSchools
        })
};

SettingsController.approvePendingSchool = function(adminUser, schoolName, callback) {
    Settings.findOneAndUpdate(
        {

        }, {
            $pull : {
                pendingSchools : schoolName
            },
            $push : {
                schools : schoolName
            }
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to find settings'})
            }

            logger.logAction(adminUser._id, -1, 'Accepted pending school ' + schoolName + '.');

            return callback(null, {'message':'Success'})
        })
};

SettingsController.rejectPendingSchool = function(adminUser, schoolName, callback) {
    Settings.findOneAndUpdate(
        {

        }, {
            $pull : {
                pendingSchools : schoolName
            }
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to find settings'})
            }

            logger.logAction(adminUser._id, -1, 'Rejected pending school ' + schoolName + '.');
            
            return callback(null, {'message':'Success'})
        })
};

SettingsController.requestSchool = function(user, schoolName, callback) {
    Settings.findOneAndUpdate(
        {

        }, {
            $push : {
                pendingSchools : schoolName
            }
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to add school ' + schoolName})
            }

            logger.logAction(user._id, -1, 'Requested to add school ' + schoolName + '.');

            return callback(null, {'message':'Success'})
        })
};

SettingsController.modifyTime = function(user, newTime, callback) {
    if (newTime.timeOpen > newTime.timeClose) {
        return callback({'error': 'Closing time is less than open time'})
    }

    if (newTime.timeConfirm < newTime.timeClose) {
        return callback({'error': 'Confirmation deadline before application close'})
    }

    Settings.findOneAndUpdate({},
        {
            timeOpen : newTime.timeOpen,
            timeClose : newTime.timeClose,
            timeConfirm : newTime.timeConfirm
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to update time'})
            }

            logger.logAction(user._id, -1, 'Modified time to ' + JSON.stringify(newTime) + '.');

            return callback(null, settings)
        })
};

SettingsController.getLog = function(callback) {
    return callback(null, Settings.getLog());
};

SettingsController.getSettings = function(callback){
    Settings.getSettings(callback);
};

module.exports = SettingsController;