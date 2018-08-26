require('dotenv').load();

const mongoose   = require('mongoose');
const userFields = require('../models/data/UserFields');

JWT_SECRET = process.env.JWT_SECRET;

var emailQueue = {
  acceptanceEmails : {
      type: [String]
  },
  rejectionEmails: {
      type: [String]
  },
  waitlistEmails: {
      type: [String]
  },
  laggerConfirmEmails: {
      type: [String]
  },
  laggerEmails: {
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
    },
    maxParticipants: {
        type: Number,
        default: 300,
        required: true
    }
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.virtual('maxMembers').get(function() {
    return process.env.TEAM_MAX_SIZE;
});

schema.virtual('permissions').get(function() {
    return userFields.permissions;
});

/*
schema.virtual('applications').get(function() {
    return Date.now() >= this.timeOpen ? userFields.profile : {'error':'Applications are not open yet'};
});*/

// If applications are publicly available
schema.virtual('applicationsReleased').get(function() {
   return Date.now() >= this.timeOpen;
});

schema.virtual('registrationOpen').get(function() {
   return this.timeClose >= Date.now() && Date.now() >= this.timeOpen;
});

schema.statics.requestSchool = function(schoolName, callback) {
    this.findOneAndUpdate({

    }, {
        $push: {
            pendingSchools: schoolName
        }
    }, {
        new: true
    }, function(err, settings) {
        if (err || !settings) {
            return callback(err ? err : {error: 'Unable to add school to pending list', code: 500})
        }

        return callback(null, {message: 'Success'})
    })
}

schema.statics.confirmationOpen = function() {
    return this.timeConfirm >= Date.now();
};

schema.statics.getSettings = function(callback){
    this.findOne({}, '-emailQueue -_id -__v -newSchools', callback);
};

module.exports = mongoose.model('Settings', schema);