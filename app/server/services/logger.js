const LogEvent        = require('../models/LogEvent');
const request         = require('request');
const Raven           = require('raven');
const permission      = require('../services/permissions');
const User            = require('../models/User');

// Get loggingTemplate
var loggingTemplate = LogEvent.getLoggingTemplate();

function buildLoggingCore(id, name, email) {
    var lt = loggingTemplate;

    lt.ID = id;
    lt.name = name;
    lt.email = email;

    return lt;
}

function buildLoggingData(id) {
    if (id == -1) {
        return buildLoggingCore(-1, 'MasseyHacks Internal Authority', 'internal@masseyhacks.ca');
    }

    //var user = User.getUser({_id : id}).exec();

    User.findOne({_id:id}, (err, user) => {
        console.log('lel', user)

        if (!user) {
            return buildLoggingCore(id, 'null name', 'null email');
        } else {
            return buildLoggingCore(id, user.fullName, user.email);
        }
    });
};


module.exports = {
    defaultResponse : function(req, res, responseJSON = true){
        return function(err, data){
            if (err){
                // Only send error to slack if in production
                // Keep everyone happy
                if (process.env.NODE_ENV === 'production'){

                    var data =  'Request: ' + req.method + ' ' + req.url +
                                '\n -------------------------- \n' +
                                'Body: \n ' +
                                JSON.stringify(req.body, null, 2) +
                                '\n -------------------------- \n' +
                                '\nError:\n' +
                                JSON.stringify(err, null, 2) +
                                '``` \n';

                    if (process.env.SERVER_RAVEN_KEY) {
                        Raven.captureMessage(data, {
                            level: 'error'
                        })
                    }

                    if (process.env.ERROR_SLACK_HOOK) {
                        console.log('Sending slack notification...');

                        request.post(process.env.ERROR_SLACK_HOOK,
                            {
                                form: {
                                    payload: JSON.stringify({
                                        'icon_emoji': ':happydoris:',
                                        'username': 'CrashBot',
                                        'text':
                                        'Hey! ' + process.env.ADMIN_UIDS + ' An issue was detected with the server.\n\n```' +
                                        data
                                    })
                                }
                            },
                            function (error, response, body) {
                                console.log('Message sent to slack');
                            }
                        );
                    }
                }

                return res.status(err.code ? err.code : 500).json(err);
            } else {
                if(responseJSON){
                    return res.json(data);
                }
                else{
                    return res.send(data);
                }
            }
        };
    },
    logAction : function (actionFrom, actionTo, message) {

        console.log(actionFrom, actionTo, message);

        /**
         * To-Do: Fix this bash...
         */

        dataFrom = buildLoggingData(actionFrom);

        console.log(dataFrom)

        dataTo = buildLoggingData(actionTo);
        console.log(dataTo)
        LogEvent.create({
            'to': dataTo,
            'from': dataFrom,
            'message': message,
            'timestamp': Date.now()
        }, function (err, event) {
            console.log(event);

            if (process.env.NODE_ENV === 'production' && process.env.AUDIT_SLACK_HOOK){
                console.log('Sending audit log...');

                request.post(process.env.AUDIT_SLACK_HOOK,
                    {
                        form: {
                            payload: JSON.stringify({
                                'icon_emoji': ':pcedoris:',
                                'username': 'AuditBot',
                                'text': '```' + event + '```'
                            })
                        }
                    },
                    function (error, response, body) {
                        console.log('Message sent to slack');
                    }
                );

            }
        });

    }
};