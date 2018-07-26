var fs = require('fs');
var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');
var Mailer = require('../app/server/services/email');

var organizers = JSON.parse(fs.readFileSync('config/data/organizers.json', 'utf8'));

console.log("Trying to add organizers");

for(var key in organizers) {
    email      = organizers[key]['email'];
    firstName  = organizers[key]['firstName'];
    lastName   = organizers[key]['lastName'];
    permission = organizers[key]['permission'];

    makeOrganizer(email, firstName, lastName, permission);
}

function makeOrganizer(email, firstName, lastName,  permission) {
    User.getByEmail(email, function (err, user) {
        if (!user) {
            console.log("Adding: ", email, firstName, lastName, permission);

            User.create({
                "email": email,
                "firstName": firstName,
                "lastName": lastName,
                "password": User.generateHash(""),
                "status.passwordSuspension": true,
                "status.admitted": true,
                "status.confirmed": true,
                "status.statusReleased": true,
                "status.admittedBy": "MasseyHacks Internal Authority",
                "permissions.developer": permission.includes('developer'),
                "permissions.owner": permission.includes('owner'),
                "permissions.reviewer": permission.includes('reviewer'),
                "permissions.admin": permission.includes('admin'),
                "permissions.checkin": permission.includes('checkin'),
                "verified": true
            }, function(err) {
                if (err) throw err;

                UserController.sendPasswordResetEmail(email, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Email successful.");
                    }
                });
            });
        }
    });
}