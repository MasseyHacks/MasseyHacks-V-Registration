var _ = require('underscore');
var User = require('../models/User');
var Settings = require('../models/Settings');

var jwt       = require('jsonwebtoken');

var request = require('request');

var validator = require('validator');
var moment = require('moment');

var SettingsController = {};

SettingsController.getLog = function(callback) {

    return callback(null, {});

    //return callback(null, Settings.getLog());
};

SettingsController.getSettings = function(callback){
    Settings.getSettings(callback);
};

module.exports = SettingsController;