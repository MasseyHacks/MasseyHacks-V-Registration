require('dotenv').load();

const jwt                = require('jsonwebtoken');
const validator          = require('validator');
const express            = require('express');
const bodyParser         = require('body-parser');

const User               = require('../models/User');
const UserController     = require('../controllers/UserController');

const permissions        = require('../services/permissions');
const logger             = require('../services/logger');

const saml2              = require('saml2-js');
const fs                 = require('fs');

JWT_SECRET = process.env.JWT_SECRET;

const encodedParser = bodyParser.urlencoded({
    extended: true
});

// Create service provider
var sp_options = {
    entity_id: process.env.ROOT_URL+"/saml/metadata.xml",
    private_key: fs.readFileSync(process.env.SAML_SP_KEYPATH).toString(),
    certificate: fs.readFileSync(process.env.SAML_SP_CERTPATH).toString(),
    assert_endpoint: process.env.ROOT_URL+"/saml/acs",
    sign_get_request: true,
    allow_unencrypted_assertion: true,
};
var sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
    sso_login_url: process.env.SAML_IDP_SSOURL,
    sso_logout_url: process.env.SAML_IDP_SLOURL,
    certificates: [fs.readFileSync(process.env.SAML_IDP_CERTPATH).toString()]
};
var idp = new saml2.IdentityProvider(idp_options);


module.exports = function(router) {
    router.use(express.json());

    function getIp(req) {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }

    router.get("/metadata.xml", function(req, res) {
        res.type('application/xml');
        res.send(sp.create_metadata());
    });

    router.get("/login", encodedParser, function(req, res) {
        sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
            if (err != null)
                return res.send(500);
            console.log(login_url)
            res.redirect(login_url);
        });
    });

    // Assert endpoint for when login completes
    router.post("/acs", encodedParser, function(req, res) {
        var options = {request_body: req.body};
        console.log(options);
        sp.post_assert(idp, options, function(err, saml_response) {
            if (err != null)
                return res.send(500);

            if(saml_response.type == 'logout_request'){
                name_id = saml_response.user.name_id;
                session_index = saml_response.user.session_index;

                //TODO: perform the logout here
            }
            else if(saml_response.type == 'logout_response'){
                sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
                    if (err != null)
                        return res.send(500);
                    console.log(login_url)
                    res.redirect(login_url);
                });
            }
            else{
                sp.post_assert(idp, options, function(err, saml_response) {
                    console.log(saml_response)
                    if (err != null)
                        return res.send(500);

                    // Save name_id and session_index for logout
                    // Note:  In practice these should be saved in the user session, not globally.
                    //TODO: LOGIN USER
                    name_id = saml_response.user.name_id;
                    session_index = saml_response.user.session_index;

                    UserController.loginWithSaml(name_id, session_index, function(err, user, token){
                        if (err || !user) {
                            console.log(err);
                            return res.status(401).json(err);
                        }
                        console.log(token)
                        return res.json({
                            token: token,
                            user: user
                        });
                    }, getIp(req));
                });
            }
        });


    });


    // Login and issue token
    router.post('/login', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;

        console.log(req.body.email + ' attempting to login.');

        UserController.loginWithPassword(email, password, function (err, user, token) {

            if (err || !user) {
                console.log(err);
                return res.status(401).json(err);
            }

            return res.json({
                token: token,
                user: user
            });

        }, getIp(req));

    });


    // Register user
    router.post('/dsflogin', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;

        if (!email) {
            return res.status(400).json({error: 'No email provided'});
        }

        if (!password) {
            return res.status(400).json({error: 'No password provided'});
        }

        if (!firstName) {
            return res.status(400).json({error: 'No first name provided'});
        }

        if (!lastName) {
            return res.status(400).json({error: 'No last name provided'});
        }

        UserController.createUser(email, firstName, lastName, password, function (err, token, user) {
            if (err || !user) {
                return res.status(500).json(err ? err : {error: 'Unable to process request'});
            }

            console.log(req.body.email + ' registered.');

            return res.json({
                token: token,
                user: user
            });
        }, getIp(req))
    });
};