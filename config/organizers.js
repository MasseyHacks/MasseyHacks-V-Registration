const fs = require('fs');
var organizers = JSON.parse(fs.readFileSync('config/data/organizers.json', 'utf8'));

// Create a default OWNER user.
var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');
var Mailer = require('../app/server/services/email');

console.log("Trying to add organizers");

for(var key in organizers) {

    email      = organizers[key]['email'];
    firstName  = organizers[key]['firstName'];
    lastName   = organizers[key]['lastName'];

    permission = organizers[key]['permission'];

    makeOrganizer(email, firstName, lastName, permission);
}

function makeOrganizer(email, firstName, lastName,  permission) {
    User
        .getByEmail(email, function (err, user) {
            if (!user) {
                console.log("Adding: ", email, firstName, lastName, permission);

                var u = new User();
                console.log(u);

                u.email = email;
                u.firstName = firstName;
                u.lastName = lastName;
                u.fullName = firstName + " " + lastName;
                u.lowerCaseName = (firstName + " " + lastName).toLowerCase();
                u.password = User.generateHash(""); // Impossible password

                u.status.passwordSuspension = true;

                u.permissions.developer = permission.includes('developer');
                u.permissions.owner = permission.includes('owner');
                u.permissions.reviewer = permission.includes('reviewer');
                u.permissions.admin = permission.includes('admin');
                u.permissions.checkin = permission.includes('checkin');

                u.verified = true;
                u.status.admittedBy = "MasseyHacks Account Authority";
                //u.profile.submittedApplication = true;
                u.status.admitted = true;
                u.status.confirmed = true;
                u.status.statusReleased = true;

                console.log(u);

                UserController.sendPasswordResetEmail(email, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Email successful.");
                    }
                });

                //var token = u.generateTempAuthToken();
                //var callback = '';
                //console.log(callback);

                u.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });

}