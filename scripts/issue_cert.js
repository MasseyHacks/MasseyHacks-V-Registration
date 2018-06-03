require('dotenv').config({path: '../.env'});

var jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

generateAuthToken = function (type, name, expire) {
    return jwt.sign({type: type, name: name}, JWT_SECRET, {
        expiresIn: expire
    });
};

var stdin = process.openStdin();

console.log("RASTERA DEV | CERTIFICATE AUTHORITY");
console.log("[type] [name] [expire]");

stdin.addListener("data", function(d) {

    var input = d.toString().trim().split(" ");
    var token = generateAuthToken(input[0], input[1], parseInt(input[2]));

    console.log(token);
});