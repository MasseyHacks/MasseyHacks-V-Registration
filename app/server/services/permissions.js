var User = require('../models/User');

// Permission Validation
//
// 0 - Hacker Unverified
// 1 - Hacker
// 2 - Check In
// 3 - Admin
// 4 - Review
// 5 - Owner
// 6 - Developer

function getToken (req)
{
    var token = req.headers['x-access-token'];

    if (!token) {
        token = req.body.token;
    }

    return token;
}

module.exports = {

    isVerified : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level > 0) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    },

    isCheckin : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 2) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    },

    isAdmin : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 3) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    },

    isReviewer : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 4) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    },

    isOwner : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level >= 5) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    },

    isDeveloper : function (req, res, next) {
        var token = getToken(req);

        User.getByToken(token, function (err, user) {

            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.permissions.level == 6) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: 'Access Denied'
            });
        });
    }
};