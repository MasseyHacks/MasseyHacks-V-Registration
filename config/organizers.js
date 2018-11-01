const fs             = require('fs');
const User           = require('../app/server/models/User');
const UserController = require('../app/server/controllers/UserController');
const mailer         = require('../app/server/services/email');
const speakeasy      = require('speakeasy');
const QRCode         = require('qrcode');

const organizers     = JSON.parse(fs.readFileSync('config/data/organizers.json', 'utf8'));

console.log('Trying to add organizers');

for(const key in organizers) {
    email      = organizers[key]['email'];
    firstName  = organizers[key]['firstName'];
    lastName   = organizers[key]['lastName'];
    permission = organizers[key]['permission'];

    makeOrganizer(email, firstName, lastName, permission);
}

function makeOrganizer(email, firstName, lastName,  permission) {
    var authSecret = speakeasy.generateSecret({length: 100, name: 'MasseyHacks V | GOOSE (' + email + ')', issuer: 'MasseyHacks V Platform Division'});
    QRCode.toDataURL(authSecret.otpauth_url, function(err, data_url) {
        User.getByEmail(email, function (err, user) {
            if (!user) {
                console.log('Adding: ', email, firstName, lastName, permission);

                var password = "";
                var suspension = true;

                if (process.env.NODE_ENV === 'dev') {
                    password = "123456";
                    suspension = false;
                }

                User.create({
                    'email': email,
                    'firstName': firstName,
                    'lastName': lastName,
                    'password': User.generateHash(password),
                    'status.passwordSuspension': suspension,
                    'status.admitted': true,
                    'status.confirmed': true,
                    'status.submittedApplication': true,
                    'status.waiver': true,
                    'status.statusReleased': true,
                    'status.timestamp': Date.now(),
                    'status.admittedBy': 'MasseyHacks Internal Authority',
                    'verified': true,
                    'QRCode': data_url,
                    'authSecret': authSecret.base32
                }, function (err, userNew) {

                    if (err) throw err;

                    userNew.setPermission(permission)

                    if (userNew.permissions.developer) {
                        var token = userNew.generateMagicToken()
                        User.findOneAndUpdate({
                                _id: userNew.id
                            },
                            {
                                $set: {
                                    'magicJWT': token
                                }
                            },
                            {
                                new: true
                            }, function (err, user) {
                                console.log(userNew.email + ': ' + process.env.ROOT_URL + '/magic?token=' + token)
                                //send the email
                                if (process.env.NODE_ENV !== 'dev') {
                                    mailer.sendTemplateEmail(user.email, 'magiclinkemails', {
                                        nickname: userNew.firstName,
                                        magicURL: process.env.ROOT_URL + '/magic?token=' + token
                                    });
                                }
                            })
                    }

                    if (process.env.NODE_ENV !== 'dev') {
                        UserController.sendPasswordResetEmail(email, function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Email successful.');
                            }
                        });
                    }
                });
            }
        });
    })
}