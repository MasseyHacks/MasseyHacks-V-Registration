const mongoose = require('mongoose')
const User     = require('../models/User')

JWT_SECRET = process.env.JWT_SECRET

var dataPack = {
    ID : {
        type: String,
        required: true
    },
    Name : {
        type: String,
        required: true
    },
    Email : {
        type: String,
        required: true
    }
}

var schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    from : dataPack,
    to : dataPack,
    message : {
        type: String,
        required: true
    }
})

schema.set('toJSON', {
    virtuals: true
})

schema.set('toObject', {
    virtuals: true
})

schema.virtual('timestampHuman').get(function() {
    return new Date(this.timestamp)
})

module.exports = mongoose.model('LogEvent', schema)