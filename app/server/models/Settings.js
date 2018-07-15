require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

var emailQueue = {
  acceptanceEmails : {
      type: [String]
  },
  rejectionEmails: {
      type: [String]
  },
  reminderEmails: {
      type: [String]
  }
};

var schema = new mongoose.Schema({
    emailQueue : emailQueue,
    schools: {
        type: [String]
    }
});

schema.statics.registrationOpen = function() {

    return true;

};

schema.statics.getSettings = function(callback){
    this
        .findOne({})
        .exec(callback);
};

module.exports = mongoose.model('Settings', schema);