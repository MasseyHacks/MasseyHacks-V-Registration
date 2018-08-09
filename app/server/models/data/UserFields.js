require('dotenv').load();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const UNVERIFIED_HACKER = 0;
const HACKER = 1;
const CHECK_IN = 2;
const ADMIN = 3;
const REVIEW = 4;
const OWNER = 5;
const DEVELOPER = 6;

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
        default: false,
        permission: ADMIN
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
    whyUWannaCome: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Why do you want to come to MasseyHacks V?'
    },

    skillQuestion: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Are bananas yellow?'
    },

    grade: {
        type: String,
        questionType: 'dropdown',
        enum: {
            values: '<=8 9 10 11 12'
        }
    }
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
        default: false,
        permissionLevel: 1
    },
    checkin: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 2
    },
    reviewer: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 3
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 4
    },
    owner: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 5
    },
    developer: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 6
    }
};


var schema = {

    firstName: {
        type: String,
        required: true,
        maxlength: 100
    },

    lastName: {
        type: String,
        required: true,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        maxlength: 100,
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