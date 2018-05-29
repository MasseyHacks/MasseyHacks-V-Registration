require('dotenv').config({path: '../../../.env'});

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

var schema = new mongoose.Schema({

    username: {
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

    kills: {
        type: Number,
        required: true,
        default: 0
    },

    deaths: {
        type: Number,
        required: true,
        default: 0
    },

    rank: {
        type: Number,
        require: true,
        default: 1
    },

    matches: {
        type: Number,
        required: true,
        default: 0
    },

    money: {
        type: Number,
        required: true,
        default: 0
    },

    actions: {
        type: Array,
        required: true,
        default: []
    },

    skins: {
        type: Array,
        required: true,
        default: ['PENGUIN']
    },


    skin: {
        type: String,
        default: 'PENGUIN'
    }
});

schema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

schema.methods.generateAuthToken = function () {
    return jwt.sign({id: this._id, type: 'authentication'}, JWT_SECRET, {
        expiresIn: 60 * 10080
    });
};

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

schema.statics.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.statics.getByToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {
        if (err || !payload) {
            console.log('ur bad');
            return callback(err);
        }

        if (payload.type != 'authentication' || !payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                message: 'bro ur token is invalid.'
            });
        }

        this.findOne({_id: payload.id}, callback);
    }.bind(this));
};

schema.statics.findOneByUsername = function (username) {
    return this.findOne({
        username:  username
    });
};


schema.statics.findOneByEmail = function (email) {
    return this.findOne({
        email:  email ? email.toLowerCase() : email
    });
};

module.exports = mongoose.model('User', schema);