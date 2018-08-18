require('dotenv').load();

const mongoose          = require('mongoose');
const bcrypt            = require('bcrypt-nodejs');
const validator         = require('validator');
const jwt               = require('jsonwebtoken');

const UNVERIFIED_HACKER = 0;
const HACKER            = 1;
const CHECK_IN          = 2;
const ADMIN             = 3;
const REVIEW            = 4;
const OWNER             = 5;
const DEVELOPER         = 6;
const INTERNAL          = 99999;

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
        default: false,
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
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false,
        condition: 'status.statusReleased'
    },
    admittedBy: {
        type: String,
        permission: ADMIN
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
        default: false,
        condition: 'status.statusReleased'
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
        default: false,
        permission: ADMIN
    }
};

var hackerApplication = {
    whyUWannaCome: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Why do you want to come to MasseyHacks V?',
        mandatory: true
    },

    name: {
        type: String,
        maxlength: 10,
        questionType: 'shortAnswer',
        question: 'First Name',
        mandatory: true
    },

    skillQuestion: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Are bananas yellow?',
        mandatory: true
    },

    grade: {
        type: String,
        questionType: 'dropdown',
        question: 'What grade are you in?',
        enum: {
            values: '<=8 9 10 11 12'
        },
        mandatory: true
    },

    school: {
        type: String,
        questionType: 'schoolSearch',
        question: 'Please select your school:',
        maxlength: 100,
        mandatory: true
    },

    testradio: {
        type: String,
        questionType: 'multiradio',
        question: 'What is 1 + 1?',
        enum: {
            values: '1 2 4 5'
        },
        mandatory: true
    },
    testcheck: {
        type: String,
        questionType: 'multicheck',
        question: 'What is 2 + 1?',
        enum: {
            values: '2^2 1 4 3'
        },
        mandatory: true
    }

    /*
    multies:

    enum: {
        options: {
            lol: {
                id: id
                text: text to be shown in label
            }
        }
    }
     */
};

var mentorApplication = {

};

var workshopHost = {

};

var profile = {
    hacker: hackerApplication,
    mentor: mentorApplication,
    workshop: workshopHost,
    signature: {
        type: Number,
        default: -1
    }
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
        select: false,
        permission: INTERNAL
    },

    authSecret: {
        type: String,
        select: false,
        permission: INTERNAL
    },

    QRCode: {
        type: String,
        select: false,
        permission: INTERNAL
    },

    magicJWT: {
        type: String,
        select: false,
        permission: INTERNAL
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
        type: [String],
        permission: OWNER
    },

    applicationReject: {
        type: [String],
        permission: OWNER
    },

    applicationVotes: {
        type: [String],
        permission: ADMIN
    },

    numVotes : {
        type: Number,
        default: 0,
        permission: ADMIN
    },

    status: status,
    permissions : permissions,
    userType: userType,

    // Only parts user can update
    profile: profile,
    confirmation: confirmation
};

module.exports = schema;