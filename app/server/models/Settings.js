require('dotenv').load();

var mongoose = require('mongoose');
var userFields = require('../models/data/UserFields');

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
    pendingSchools : {
        type: [String],
        required: true
    },
    schools: {
        type: [String],
        required: true
    },
    timeOpen: {
        type: Number,
        default: Date.now(),
        required: true
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000,
        required: true
    },
    timeConfirm: {
        type: Number,
        default: Date.now() + 31104000000,
        required: true
    }
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.virtual('permissions').get(function() {
    return userFields.permissions;
});

schema.virtual('applications').get(function() {
    return Date.now() >= this.timeOpen ? userFields.profile : {"error":"Applications are not open yet"};
});

schema.virtual('registrationOpen').get(function() {
   return this.timeClose >= Date.now() && Date.now() >= this.timeOpen;
});

schema.statics.confirmationOpen = function() {
    return this.timeConfirm >= Date.now();
};

schema.statics.getSettings = function(callback){
    this.findOne({}, '-emailQueue -_id -__v -newSchools', callback);
};

module.exports = mongoose.model('Settings', schema);