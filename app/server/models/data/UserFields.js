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
        default: true,
        caption: "Account Active"
    },
    passwordSuspension: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Suspended until password change"
    },
    submittedApplication: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Submitted Application"
    },
    sentConfirmation: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Confirmation Email Sent"
    },
    waitlisted: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Waitlisted"
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false,
        condition: 'status.statusReleased',
        caption: "Admitted"
    },
    admittedBy: {
        type: String,
        permission: ADMIN,
        caption: "Admitted By"
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Confirmed Invitation"
    },
    waiver: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Waiver on File"
    },
    declined: {
        type: Boolean,
        required: true,
        default: false,
        caption: "Declined Invitation"
    },
    noConfirmation: {
        type: Boolean,
        required:true,
        default: false,
        caption: "Failed to Confir,"
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
        default: false,
        caption: "Checked In"
    },
    checkInTime: {
        type: Number,
        caption: "Time of last checkin",
        time: true
    },
    confirmBy: {
        type: Number,
        condition: 'status.statusReleased',
        caption: "Confirmation Deadline",
        time: true
    },
    statusReleased: {
        type: Boolean,
        default: false,
        permission: ADMIN,
        caption: "Status Released"
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
        mandatory: false,
        precaption: 'BASIC INFORMATION'
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
        question: 'What school do you go to?',
        maxlength: 100,
        mandatory: true
    },


    dietaryRestrictions: {
        type: [String],
        questionType: 'multicheck',
        question: 'Please indicate any dietary restrictions.',
        note: 'If your restrictions are not included here, please let us know in the free comment section at the bottom.',
        enum: {
            values: 'Vegetarian|Vegan|Halal|Kosher|Nut Allergy|Gluten Free'
        },
        mandatory: false
    },

    departure: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'What city are you travelling from?',
        mandatory: true,
        precaption: 'TRAVEL'
    },

    bus: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Will you be travelling on our Toronto/Waterloo bus? (If funding permits)',
        mandatory: true
    },

    reimbursement: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Do you need travel reimbursement? (If funding permits)',
        mandatory: true
    },

    github: {
        type: String,
        maxlength: 100,
        questionType: 'shortAnswer',
        question: 'GitHub',
        mandatory: false,
        precaption: 'EXPERIENCE'
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

    fullResponse1: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Tell us about a recent project you worked on, computer science-related or not. It’ll help get us an idea of your skills and what you’re all about.',
        mandatory: true
    },

    fullResponse2: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'What entices you about hacking? What do you gain out of it or like about it?',
        mandatory: true
    },

    fullResponse3: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Why do you want to attend MasseyHacks?',
        mandatory: true
    },

    discovery: {
        type: String,
        questionType: 'dropdown',
        question: 'How did you find us?',
        enum: {
            values: ' |MLH|Social Media|Word of mouth|Other'
        },
        mandatory: true,
        precaption: 'FINAL QUESTIONS'
    },

    termsAndConditions: {
        type: String,
        questionType: 'contract',
        question: 'I agree to MLH Contest Terms and Conditions.',
        mandatory: true,
        warning: 'You must agree to MLH Contest Terms and Conditions.'
    },

    codeOfConduct: {
        type: String,
        questionType: 'contract',
        question: 'I agree to MLH Code of Conduct.',
        mandatory: true,
        warning: 'You must agree to MLH Code of Conduct.'
    },

    tabsOrSpaces: {
        type: String,
        questionType: 'multiradio',
        question: 'Tabs or spaces?',
        enum: {
            values: 'Tabs|Spaces'
        },
        mandatory: false
    },

    comment: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Anything else you want to let us know?',
        mandatory: false,
        precaption: 'FREE COMMENT'
    }
};

var mentorApplication = {

};

var workshopHost = {

};

var confirmation = {
    bus: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Will you be travelling on our Toronto/Waterloo bus?',
        mandatory: true,
        precaption: 'TRANSPORTATION'
    },

    additionalNotes: {
        type: String,
        questionType: 'fullResponse',
        question: 'Is there anything else you\'d like us to know?',
        mandatory: false,
        precaption: 'ADDITIONAL NOTES'
    }
};

var profile = {
    hacker: hackerApplication,
    mentor: mentorApplication,
    workshop: workshopHost,
    confirmation: confirmation,
    signature: {
        type: Number,
        default: -1
    }
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
    admin: {
        type: Boolean,
        required: true,
        default: false,
        permissionLevel: 3
    },
    reviewer: {
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
        maxlength: 100,
        caption: "First Name"
    },

    lastName: {
        type: String,
        required: true,
        maxlength: 100,
        caption: "Last Name"
    },

    email: {
        type: String,
        required: true,
        maxlength: 100,
        validate: [
            validator.isEmail,
            'Invalid Email'
        ],
        caption: "Email"
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
        default: 0,
        caption: "Creation Time",
        time: true
    },

    lastUpdated: {
        type: Number,
        default: 0,
        caption: "Profile Last Updated",
        time: true
    },

    confirmedTimestamp: {
        type: Number,
        default: 0,
        caption: "Confirmation Last Updated",
        time: true
    },

    passwordLastUpdated: {
        type: Number,
        default: 0,
        caption: "Password Last Updated"
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140,
        caption: "Team Code"
    },

    applicationAdmit: {
        type: [String],
        permission: OWNER,
        caption: "Votes to Admit"
    },

    applicationReject: {
        type: [String],
        permission: OWNER,
        caption: "Votes to Reject"
    },

    applicationVotes: {
        type: [String],
        permission: ADMIN,
        caption: "Application Votes"
    },

    emailsFlushed: {
        type: [String],
        permission: ADMIN,
        caption: "Emails Flushed from Queue"
    },

    numVotes : {
        type: Number,
        default: 0,
        permission: ADMIN,
        caption: "Number of Votes"
    },

    skillRequest : {
        type: Number,
        default: 0,
        permission: ADMIN,
        caption: "Number of skill questions requested"
    },
    skillPass : {
        type: Number,
        default: 0,
        permission: ADMIN,
        caption: "Number of skill questions passed"
    },
    skillFail : {
        type: Number,
        default: 0,
        permission: ADMIN,
        caption: "Number of skill questions failed"
    },
    status: status,
    permissions : permissions,
    userType: userType,

    // Only parts user can update
    profile: profile
};

module.exports = schema;