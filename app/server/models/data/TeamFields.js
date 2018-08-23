require('dotenv').load();

const mongoose          = require('mongoose');
const bcrypt            = require('bcrypt-nodejs');
const validator         = require('validator');
const jwt               = require('jsonwebtoken');

schema = {
    name : {
        type: String,
        required: true,
        maxlength: 50
    },
    code : {
        type: String,
        required: true
    },
    memberIDs : {
        type: [String],
        select: false
    }
}

module.exports = schema