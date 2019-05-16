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
            //console.log(login_url)
            res.redirect(login_url);
        });
    });

    // Assert endpoint for when login completes
    router.post("/acs", encodedParser, function(req, res) {
        var options = {request_body: req.body};
        //console.log(options);
        sp.post_assert(idp, options, function(err, saml_response) {
            if (err != null)
                return res.send(500);

            if(saml_response.type == 'logout_request'){
                var name_id = saml_response.user.name_id;
                var session_index = saml_response.user.session_index;

               // console.log("remote slo logout!");
                UserController.samlLogout(name_id, session_index, function(err, message){
                    if (err)
                        return res.send(500);
                    return res.send(message)
                })
            }
            else if(saml_response.type == 'logout_response'){
                res.redirect("/finishLogout");
            }
            else{
                // Save name_id and session_index for logout
                // Note:  In practice these should be saved in the user session, not globally.
                name_id = saml_response.user.name_id;
                session_index = saml_response.user.session_index;

                UserController.loginWithSaml(name_id, session_index, function(err, user, token){
                    if (err || !user) {
                       // console.log(err);
                        return res.status(401).json(err);
                    }
                    //console.log(token);
                    return res.send(`
                    <HTML>
                    <HEAD>
                        <TITLE>MasseyHacks SAML Redirect</TITLE>
                    </HEAD>
                    <script>
                    localStorage.token="${token}";
                    localStorage.user=\`${JSON.stringify(user)}\`;
                    localStorage.userID = "${user._id}";
                    window.location.replace("/login");
</script>
                    <BODY>
                    <noscript>Please enable JavaScript to continue.</noscript>
                    </BODY>
                    </HTML>`);
                    return res.json({
                        token: token,
                        user: user
                    });
                }, getIp(req));
            }
        });


    });

    // Logout endpoint
    router.get("/logout", function(req, res) {
        var userToken = req.query.token;
        User.getByToken(userToken, function (err, user, sessionId){
            if(err || !user){
                res.redirect("/login");
            }
            if(sessionId){
                //SAML Logout, destroy session
                UserController.samlLogout(user.saml.name_id, sessionId, function(err){
                    if(err){
                        res.redirect("/login")
                    }
                    var options = {
                        name_id: user.saml.name_id,
                        session_index: sessionId
                    };
                    //console.log(options);

                    sp.create_logout_request_url(idp, options, function(err, logout_url) {
                        if (err != null)
                            return res.send(500);
                        res.redirect(logout_url);
                    });
                })

            }
            else{
                // plain old user, just log them out
                res.redirect("/finishLogout");
            }

        });

    });


};