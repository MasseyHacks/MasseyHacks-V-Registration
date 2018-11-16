const User   = require('../models/User');
const logger = require('../services/logger');

var globalUsersManager = {};

globalUsersManager.releaseAllStatus = function(adminUser, callback){
    User.updateMany({
        'status.statusReleased': false
    }, {
        $set: {
            'status.statusReleased': true
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Released all user status', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result);
    });
};

globalUsersManager.releaseAllAccepted = function(adminUser, callback){
    User.updateMany({
        'status.statusReleased': false,
        'status.admitted': true
    }, {
        $set: {
            'status.statusReleased': true
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Released all accepted user status', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result);
    });
};

globalUsersManager.releaseAllWaitlisted = function(adminUser, callback){
    User.updateMany({
        'status.statusReleased': false,
        'status.waitlisted': true
    }, {
        $set: {
            'status.statusReleased': true
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Released all waitlisted user status', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result);
    });
};

globalUsersManager.releaseAllRejected = function(adminUser, callback){
    User.updateMany({
        'status.statusReleased': false,
        'status.rejected': true
    }, {
        $set: {
            'status.statusReleased': true
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Released all rejected user status', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result);
    });
};

globalUsersManager.hideAllStatusRelease = function(adminUser, callback){
    User.updateMany({
        'status.statusReleased': true,
        $or : [
            {
                'permissions.reviewer': false
            },
            {
                'permissions.admin': false
            },
            {
                'permissions.owner': false
            },
            {
                'permissions.developer': false
            }
        ]
    }, {
        $set: {
            'status.statusReleased': false
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Hid all user status', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result);
    });
};
