const mongoose = require('mongoose');
const User     = require('../models/User');

JWT_SECRET = process.env.JWT_SECRET;

var loggingTemplate = {
    ID : {
        type: String,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    }
}

var schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    from : loggingTemplate,
    to : loggingTemplate,
    message : {
        type: String,
        required: true
    }
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.statics.getLoggingTemplate = function() {
    return loggingTemplate
};

schema.virtual('timestampHuman').get(function() {
    return new Date(this.timestamp)
});

module.exports = mongoose.model('LogEvent', schema)