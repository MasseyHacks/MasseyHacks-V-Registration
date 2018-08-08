var LogEvent    = require('../models/LogEvent');
var request = require('request');
var permission = require('permissions');

module.exports = {
    defaultResponse : function(req, res){
        return function(err, data){

            if (err){
                // Only send error to slack if in production
                // Keep everyone happy
                if (process.env.NODE_ENV === 'production'){
                    console.log('Sending slack notification...');

                    request.post(process.env.ERROR_SLACK_HOOK,
                        {
                            form: {
                                payload: JSON.stringify({
                                    "icon_emoji" : ":happydoris:",
                                    "username" : "CrashBot",
                                    "text":
                                    "Hey! " + process.env.ADMIN_UIDS + " An issue was detected with the server.\n\n```" +
                                    "Request: \n " +
                                    req.method + ' ' + req.url +
                                    "\n -------------------------- \n" +
                                    "Body: \n " +
                                    JSON.stringify(req.body, null, 2) +
                                    "\n -------------------------- \n" +
                                    "\nError:\n" +
                                    JSON.stringify(err, null, 2) +
                                    "``` \n"
                                })
                            }
                        },
                        function (error, response, body) {
                            console.log('Message sent to slack');
                        }
                    );
                }

                return res.json(err);
            } else {
                var token = permission.getToken(req);

                User.filterSensitive(token, data, function(err, data) {
                    if (err) {
                        return res.json(err);
                    } else {
                        return res.json(data);
                    }
                })
            }
        };
    },
    logAction : function (actionFrom, actionTo, message) {

        console.log(actionFrom, actionTo, message);

        /**
         * To-Do: Fix this bash...
         */

        // Creates log object
        LogEvent.buildLoggingData(actionFrom, function(dataFrom) {
            LogEvent.buildLoggingData(actionTo, function(dataTo) {

                LogEvent.create({
                    "to": dataTo,
                    "from": dataFrom,
                    "message": message,
                    "timestamp": Date.now()
                }, function (err, event) {
                    console.log(event);
                });

                if (process.env.NODE_ENV === 'production'){
                    console.log('Sending slack audit log...');

                    request.post(process.env.AUDIT_SLACK_HOOK,
                        {
                            form: {
                                payload: JSON.stringify({
                                    "icon_emoji" : ":pcedoris:",
                                    "username" : "AuditBot",
                                    "text": "```" + event + "```"
                                })
                            }
                        },
                        function (error, response, body) {
                            console.log('Message sent to slack');
                        }
                    );
                }
            });
        });
    }
};