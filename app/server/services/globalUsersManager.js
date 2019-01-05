const User   = require('../models/User');
const logger = require('../services/logger');
const async  = require('async');
const UserController = require('../controllers/UserController');

var globalUsersManager = {};

globalUsersManager.pushBackRejected = function(adminUser, callback){
    User.updateMany({
        $and: [
            {
                'status.statusReleased': false
            },
            {
                'status.rejected': true
            }
        ]
    }, {
        $set: {
            'status.rejected': false
        },
        $inc: {
            'lastUpdated': 10000000
        }
    }, function(err, result){
        if (err || !result) {
            return callback(err ? err : { error: 'Unable to perform action.', code: 500})
        }

        logger.logAction(adminUser._id, -1, 'Unrejected all rejected users without status release', 'EXECUTOR IP: ' + adminUser.ip);

        return callback(err, result.nModified);
    });
}

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

        return callback(err, result.nModified);
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

        return callback(err, result.nModified);
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

        return callback(err, result.nModified);
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

        return callback(err, result.nModified);
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

        return callback(err, result.nModified);
    });
};


globalUsersManager.flushAllEmails = function (adminUser, callback) {
    User.find({}, function (err, users) {
        console.log('Users to be flushed.', users, err);

        logger.logAction(adminUser._id, -1, 'Flushed all emails from queue.', 'EXECUTOR IP: ' + adminUser.ip);

        async.each(users, function (user, callback) {
            UserController.flushEmailQueue(adminUser, user._id, (err, msg) => {
                console.log(user.fullName, err, msg ? 'Success' : 'Fail');

                return callback()
            });

        }, function () {
            return callback(null, users.length)
        });
    });
};


module.exports = globalUsersManager;
