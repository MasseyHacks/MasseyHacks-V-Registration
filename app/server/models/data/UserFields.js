require('dotenv').load();

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

var status = {
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    passwordSuspension: {
        type: Boolean,
        required: true,
        default: false
    },
    submittedApplication: {
        type: Boolean,
        required: true,
        default: false
    },
    sentConfirmation: {
        type: Boolean,
        required: true,
        default: false
    },
    waitlisted: {
        type: Boolean,
        required: true,
        default: false
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false
    },
    admittedBy: {
        type: String
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    waiver: {
        type: Boolean,
        required: true,
        default: false
    },
    declined: {
        type: Boolean,
        required: true,
        default: false
    },
    noConfirmation: {
        type: Boolean,
        required:true,
        default: false
    },
    rejected: {
        type: Boolean,
        required: true,
        default: false
    },
    checkedIn: {
        type: Boolean,
        required: true,
        default: false
    },
    checkInTime: {
        type: Number
    },
    confirmBy: {
        type: Number
    },
    statusReleased: {
        type: Boolean,
        default: false
    }
};

var hackerApplication = {

};

var mentorApplication = {

};

var workshopHost = {

};

var profile = {
    hacker: hackerApplication,
    mentor: mentorApplication,
    workshop: workshopHost
};

var confirmation = {

};

var userType = {
    hacker : {
        type: Boolean,
        required: true,
        default: true
    },
    mentor: {
        type: Boolean,
        required: true,
        default: false
    },
    workshopHost: {
        type: Boolean,
        required: true,
        default: false
    }
};

var permissions = {
    verified : {
        type: Boolean,
        required: true,
        default: false
    },
    checkin: {
        type: Boolean,
        required: true,
        default: false
    },
    reviewer: {
        type: Boolean,
        required: true,
        default: false
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    owner: {
        type: Boolean,
        required: true,
        default: false
    },
    developer: {
        type: Boolean,
        required: true,
        default: false
    }
};


var schema = {

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        validate: [
            validator.isEmail,
            'Invalid Email'
        ]
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    timestamp: {
        type: Number,
        required: true,
        default: 0
    },

    lastUpdated: {
        type: Number,
        default: 0
    },

    passwordLastUpdated: {
        type: Number,
        default: 0
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140
    },

    applicationAdmit: {
        type: [String]
    },

    applicationReject: {
        type: [String]
    },

    applicationVotes: {
        type: [String]
    },

    numVotes : {
        type: Number,
        default: 0
    },

    status: status,
    permissions : permissions,
    userType: userType,

    // Only parts user can update
    profile: profile,
    confirmation: confirmation
};

module.exports = schema;