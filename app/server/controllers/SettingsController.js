const _          = require('underscore');
const algebra    = require("algebra.js");
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

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function generateExpression(letter,otherCoef){
  var expr = new algebra.Expression(letter);
  var seed = Math.ceil(Math.random()*100);

  if(seed % 2 == 0 || true){
    expr = expr.subtract(Math.floor(Math.random()*20));
  }
  else{
    expr = expr.add(Math.floor(Math.random()*20));
  }

  seed = Math.floor(Math.random()*100);

  var coef = Math.floor(seed/20);
  if(coef == otherCoef){
    seed = Math.floor(Math.random()*100);
    if(seed % 2 && coef > 1){
      coef--;
    }
    else{
      coef = coef+=2;
    }
  }

  for(var i=0;i<coef;i++){
    expr = expr.add(letter);
  }
  return [expr,coef];
}

SettingsController.getVerificationProblem = function(callback){
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var returnData = {};

    var letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    returnData['instruction'] = `Solve for: ${letter}`;

    var expressionResult = generateExpression(letter);
    var expression1 = expressionResult[0];
    var oldCoef = expressionResult[1];

    var seed = Math.ceil(Math.random()*100);

    if(seed % 2 == 0){
      var eq = new algebra.Equation(expression1,Math.floor(Math.random()*20)); // Expression and constant
    } else{
      var eq = new algebra.Equation(expression1,generateExpression(letter,oldCoef)[0]); // Expression on both sides
    }

    returnData['question'] = eq.toString();

    console.log(eq.toString());
    try{
      returnData['answer'] = eq.solveFor(letter).toString();
    }
    catch(err){
      returnData = {
        instruction: 'Solve for `life`',
        question: 'What is the meaning of life?',
        answer: '42'
      }
    }

    return callback(null,returnData);
}

SettingsController.getPendingSchools = function(callback) {
    Settings.findOne(
        {},
        function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to find settings'})
            }

            return callback(null, settings.pendingSchools)
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
                schools : {
                    $each: [schoolName],
                    $sort: 1
                }
            }
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to perform action'})
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
                return callback({'error':'Unable to perform action'})
            }

            logger.logAction(adminUser._id, -1, 'Rejected pending school ' + schoolName + '.');

            return callback(null, {'message':'Success'})
        })
};

SettingsController.requestSchool = function(user, schoolName, callback) {

    if (schoolName === null) {
        return calllback({'error':'School is null'})
    }

    Settings.findOneAndUpdate(
        {
            schools: {
                $ne: schoolName
            },
            pendingSchools: {
                $ne: schoolName
            }
        }, {
            $push : {
                pendingSchools : schoolName
            }
        }, {
            new: true
        }, function(err, settings) {
            if (err || !settings) {
                return callback({'error':'Unable to add school (It\'s probably already on the list!)'})
            }

            logger.logAction(user._id, -1, 'Requested to add school.', schoolName);

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

            logger.logAction(user._id, -1, 'Modified global time settings.', JSON.stringify(newTime));

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

    var filter = query.filter ? query.filter : {};
    var page   = parseInt(query.page);
    var size   = parseInt(query.size);
    var or     = [];
    var and    = [];

    console.log('query', query)

    if (query.text) {
        var regex = new RegExp(escapeRegExp(query.text), 'i'); // filters regex chars, sets to case insensitive

        or.push({ 'message': regex });
        or.push({ 'detailedMessage': regex });
        or.push({ 'from.name': regex });
        or.push({ 'to.name': regex });
        or.push({ 'from.email': regex });
        or.push({ 'to.email': regex });
        or.push({ 'from._id': regex });
        or.push({ 'to._id': regex });
    }

    if (or && or.length) {
        if ('$or' in filter) {
            filter['$or'].concat(or)
        } else {
            filter['$or'] = or
        }
    }

    if (and && and.length) {
        if ('$and' in filter) {
            filter['$and'].concat(and)
        } else {
            filter['$and'] = and
        }
    }

    LogEvent.count(filter, function(err, count) {
        if (err) {
            console.log(err);
            return callback({error:err.message})
        }

        if (size === -1) {
            size = count
        }

        LogEvent
            .find(filter)
            .sort({'timestamp': -1})
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

                return callback(null, {
                    log : log,
                    totalPages: Math.ceil(count / size),
                    count: count
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
