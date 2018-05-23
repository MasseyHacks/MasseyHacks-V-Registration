var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');
JWT_SECRET = 'lol'; //process.env.JWT_SECRET;

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
    }
});

schema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

schema.methods.generateAuthToken = function () {
    return jwt.sign({id: this._id, type: 'authentication'}, JWT_SECRET, {
        //expiresInMinutes: 10080
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

schema.statics.findOneByEmail = function (email) {
    return this.findOne({
        email:  email ? email.toLowerCase() : email
    });
};

module.exports = mongoose.model('User', schema);