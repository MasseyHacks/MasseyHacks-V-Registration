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

    gender: {
        type: String,
        questionType: 'dropdown',
        question: 'What gender do you identify as?',
        enum: {
            values: ' |Male|Female|Other|I prefer not to answer'
        },
        mandatory: false
    },

    grade: {
        type: String,
        questionType: 'dropdown',
        question: 'What grade are you in?',
        enum: {
            values: ' |<=8|9|10|11|12'
        },
        mandatory: true
    },

    dietaryRestrictions: {
        type: [String],
        questionType: 'multicheck',
        question: 'Please indicate any dietary restrictions.',
        note: 'If your restrictions are not included here, please let us know in the free comment section at the bottom.',
        enum: {
            values: '5|1|4|3'
        },
        mandatory: false
    },

    shirt: {
        type: String,
        questionType: 'multiradio',
        question: 'What is your shirt size?',
        enum: {
            values: 'XS|S|M|L|XL'
        },
        mandatory: true
    },

    hackathonExperience: {
        type: String,
        maxlength: 500,
        questionType: 'fullResponse',
        question: 'Which hackathons have you attended? (If any)',
        mandatory: false
    },

    school: {
        type: String,
        questionType: 'schoolSearch',
        question: 'Please select your school:',
        maxlength: 100,
        mandatory: true
    },

    departure: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'What city are you travelling from?',
        mandatory: true
    },

    bus: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Will you be travelling on our Toronto/Waterloo bus? (If funding permits)',
        mandatory: false
    },

    reimbursement: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Do you need travel reimbursement? (If funding permits)',
        mandatory: false
    },

    github: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'GitHub',
        mandatory: false
    },

    devpost: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'Devpost',
        mandatory: false
    },

    website: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'Personal Website',
        mandatory: false
    },

    resume: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'Link to resume',
        mandatory: false
    },

    q1: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Tell us about a recent project you worked on, computer science-related or not. It’ll help get us an idea of your skills and what you’re all about.',
        mandatory: true
    },

    q2: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'What entices you about hacking? What do you gain out of it or like about it?',
        mandatory: true
    },

    q3: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Why do you want to attend MasseyHacks?',
        mandatory: true
    },

    tc: {
        type: Boolean,
        questionType: 'boolean',
        question: 'I agree to MLH Contest Terms and Conditions.',
        mandatory: true
    },

    cc: {
        type: Boolean,
        questionType: 'boolean',
        question: 'I agree to MLH Code of Conduct.',
        mandatory: true
    }
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