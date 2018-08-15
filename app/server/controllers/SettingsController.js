const _          = require('underscore');
const User       = require('../models/User');
const Settings   = require('../models/Settings');
const LogEvent   = require('../models/LogEvent');
const UserFields = require('../models/data/UserFields')

const jwt        = require('jsonwebtoken');

const request    = require('request');

const validator  = require('validator');
const moment     = require('moment');
const logger     = require('../services/logger');

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

SettingsController.modifyLimit = function(user, limit, callback) {
    if (!limit.maxParticipants) {
        return callback({'error': 'Data not found'})
    }

    Settings.findOneAndUpdate({},
        {
            maxParticipants : limit.maxParticipants,
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to update limit'})
            }

            logger.logAction(user._id, -1, 'Modified participant limit to ' + limit.maxParticipants + '.');

            return callback(null, settings)
        })
};

SettingsController.getLog = function(query, callback){

    var filter = {};
    var page = 0;
    var size = 10000000000;

    console.log('query', query)

    if (query) {
        //filter = query.filter ? query.filter : {};
        page = parseInt(query.page);
        size = parseInt(query.size);
    }

    LogEvent.count(filter, function(err, count) {
        if (err) {
            console.log(err)
            return callback({error:err.message})
        }

        LogEvent
            .find(filter)
            .skip((page - 1) * size)
            .limit(size)
            .exec(function (err, log) {
                if (err || !log) {
                    if (err) {
                        console.log(err)
                        return callback({error:err.message})
                    }
                    return callback(null, {
                        log : [],
                        count: 0
                    });
                }

                console.log(log, filter)

                return callback(null, {
                    log : log,
                    totalPages: Math.ceil(count / size)
                });
            });
    });

};

SettingsController.getApplications = function(req, callback) {
    Settings.getSettings(function(err, settings) {
        if (err || !settings) {
            return callback({error:'Unable to get Settings', code: 500})
        }

        if (!req.userExecute.permissions.admin && !settings.applicationsReleased) {
            return callback({error:'Access Denied', code:403})
        }

        return callback(null, UserFields.profile)
    });
};

SettingsController.getSettings = function(callback) {
    Settings.getSettings(callback);
};

module.exports = SettingsController;