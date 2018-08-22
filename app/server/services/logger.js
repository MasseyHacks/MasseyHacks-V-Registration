const LogEvent        = require('../models/LogEvent');
const request         = require('request');
const Raven           = require('raven');
const permission      = require('../services/permissions');
const User            = require('../models/User');

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
    logAction : function (actionFrom, actionTo, message, detailedMessage) {

        // Start bash

        console.log(actionFrom, actionTo, message, detailedMessage)

        LogEvent
            .create({
                'to.ID': actionTo,
                'from.ID': actionFrom,
                'message': message,
                'detailedMessage': detailedMessage,
                'timestamp': Date.now()
            }, function (err, e) {

                LogEvent
                    .findOne({_id: e._id})
                    .populate(actionFrom === -1 ? '' : 'fromUser') // Only populate if user exists
                    .populate(actionTo === -1 ? '' : 'toUser')
                    .exec(function (err, event) {

                        console.log(event)

                        if (event) {
                            LogEvent.findOneAndUpdate({
                                _id: event._id
                            }, {
                                'from.name': actionFrom === -1 ? 'MasseyHacks Internal Authority' : event.fromUser.fullName,
                                'from.email': actionFrom === -1 ? 'internal@masseyhacks.ca' : event.fromUser.email,
                                'to.name': actionTo === -1 ? 'MasseyHacks Internal Authority' : event.toUser.fullName,
                                'to.email': actionTo === -1 ? 'internal@masseyhacks.ca' : event.toUser.email
                            }, {
                                new: true
                            }, function (err, newEvent) {

                                console.log(newEvent)

                                if (process.env.NODE_ENV === 'production' && process.env.AUDIT_SLACK_HOOK) {
                                    console.log('Sending audit log...');

                                    request.post(process.env.AUDIT_SLACK_HOOK,
                                        {
                                            form: {
                                                payload: JSON.stringify({
                                                    'icon_emoji': ':pcedoris:',
                                                    'username': 'AuditBot',
                                                    'text': '```' + newEvent + '```'
                                                })
                                            }
                                        },
                                        function (error, response, body) {
                                            console.log('Message sent to slack');
                                        }
                                    );

                                }
                            })
                        } else {
                            console.log('Logging fail.')
                        }
                    });

            })
    }
};