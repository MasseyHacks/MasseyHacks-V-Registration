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
        type: [String]
    },
    timeOpen: {
        type: Number,
        default: Date.now()
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000
    },
    timeConfirm: {
        type: Number,
        default: Date.now() + 31104000000
    }
});

schema.statics.registrationOpen = function() {
    return this.timeClose >= Date.now() && Date.now() >= this.timeOpen;
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