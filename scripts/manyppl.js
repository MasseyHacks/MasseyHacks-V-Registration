require('dotenv').load();

//const fs             = require('fs');
const User           = require('../app/server/models/User');
//const UserController = require('../app/server/controllers/UserController');
//const mailer         = require('../app/server/services/email');
//const speakeasy      = require('speakeasy');
//const QRCode         = require('qrcode');

const database        = process.env.DATABASE || 'mongodb://localhost:27017';
const mongoose        = require('mongoose');

mongoose.connect(database);

for(var i = 100; i < 400; i++) {
    email      = 'xujames007+' + i + '@gmail.com';
    firstName  = 'first' + i;
    lastName   = 'last' + i;

    makeOrganizer(email, firstName, lastName);
}

function makeOrganizer(email, firstName, lastName) {
    //var authSecret = speakeasy.generateSecret({length: 100, name: 'MasseyHacks V | GOOSE (' + email + ')', issuer: 'MasseyHacks V Platform Division'});

    User.getByEmail(email, function (err, user) {
        if (!user) {
            console.log('Adding: ', email, firstName, lastName);

            var password = "123456";
            var suspension = false;

            var hacker = {
                "dietaryRestrictions": [],
                "shirt": "L",
                "hackathonExperience": "I want to Hack the North.",
                "school": "I go to the University of Waterloo",
                "departure": "I will depart from Waterloo",
                "bus": true,
                "reimbursement": true,
                "github": "https://github.com/karlzhu",
                "devpost": "https://devpost.com/karlzhu",
                "website": "http://karlzhu.com/",
                "resume": "https://karlzhu.com/resume",
                "fullResponse1": "I don't actually want to come.",
                "fullResponse2": "this is beautiful response",
                "q3": "much nice.",
                "tc": true,
                "cc": true /*,
                "gender": "Male",
                "grade": "<=8"*/
            }

            var profile = {"hacker" : hacker}

            User.create({
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'password': User.generateHash(password),
                'status.passwordSuspension': suspension,
                'status.submittedApplication': true,
                'status.statusReleased': false,
                'status.timestamp': Date.now(),
                'permissions.verified': true,
                'verified': true,
                'profile' : profile
            }, function (err, userNew) {

                if (err) throw err;

                console.log('Created user', i)
            });
        }
    });

}