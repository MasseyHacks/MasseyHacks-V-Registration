const fs             = require('fs');
const User           = require('../app/server/models/User');
const UserController = require('../app/server/controllers/UserController');
const Mailer         = require('../app/server/services/email');

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
    User.getByEmail(email, function (err, user) {
        if (!user) {
            console.log('Adding: ', email, firstName, lastName, permission);

            User.create({
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'password': User.generateHash(''),
                'status.passwordSuspension': true,
                'status.admitted': true,
                'status.confirmed': true,
                'status.statusReleased': true,
                'status.timestamp': Date.now(),
                'status.admittedBy': 'MasseyHacks Internal Authority',
                'verified': true
            }, function(err, userNew) {

                if (err) throw err;

                userNew.setPermission(permission)

                /*
                UserController.sendPasswordResetEmail(email, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email successful.');
                    }
                });*/
            });
        }
    });
}