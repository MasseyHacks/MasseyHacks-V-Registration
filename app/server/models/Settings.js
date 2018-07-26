require('dotenv').load();

var mongoose = require('mongoose'),

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

schema.statics.registrationOpen = function() {
    return true;
    return this.findOne({}).timeClose >= Date.now() && Date.now() >= this.findOne({}).timeOpen;
};

schema.statics.confirmationOpen = function() {
    return this.timeConfirm >= Date.now();
};

schema.statics.getSettings = function(callback){
    this
        .findOne({})
        .exec(callback);
};

module.exports = mongoose.model('Settings', schema);