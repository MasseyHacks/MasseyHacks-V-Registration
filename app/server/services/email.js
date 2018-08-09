require('dotenv').load();
var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');
var mongoose = require('mongoose');
var Settings = require('../models/Settings');
var User = require('../models/User');
var date = new Date();


var smtpConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

var transporter = nodemailer.createTransport(smtpConfig);
const validTemplates = JSON.parse(fs.readFileSync('config/data/emailTemplates.json', 'utf8'));

module.exports = {
    assembleTemplate : function(queueName){
        const templateHTML = fs.readFileSync(validTemplates[queueName]['templateLocation'],'utf8');
        const baseHTML = fs.readFileSync('./app/server/templates/base.hbs','utf8');

        const template = baseHTML.replace('{{emailData}}',templateHTML);
        console.log(template);
        return template;

    },

    sendTemplateEmail: function(recipient,templateName,dataPack,templateHTML=null){//templated email
        templateName = templateName.toLowerCase();
        console.log('Sending template email! to:' +recipient+ ' template '+templateName+' dp '+dataPack);
        if(validTemplates[templateName]['queueName']){
            //compile the template

            var htmlTemplate;
            if(templateHTML){
                //passed HTML
                htmlTemplate = templateHTML;
            }
            else{
                //assemble it
                htmlTemplate = module.exports.assembleTemplate(templateName);
            }

            var template = handlebars.compile(htmlTemplate);
            var htmlEmail = template(dataPack);
            var title = validTemplates[templateName]['emailTitle'];

            //start sending
            transporter.verify(function(error, success) {//verify the connection
                if (error) {
                    console.log(error);
                }
            });

            var email_message = {//construct the message
                from: process.env.EMAIL_CONTACT,
                to: recipient,
                subject: title,
                text: 'Your email client does not support the viewing of HTML emails. Please consider enabling HTML emails in your settings, or downloading a client capable of viewing HTML emails.',
                html: htmlEmail
            };

            transporter.sendMail(email_message, function(error,response){//send the email
                if(error){
                    console.log(error,response);
                }
                else{
                    console.log('email sent');
                }
            });
        }
    },

    queueEmail : function(recipient,queue,callback){

        queue = queue.toLowerCase();//just in case

        //check if the given queue is valid
        if(validTemplates[queue] === null){//invalid
            console.log('Invalid email queue!');
            return callback({error: 'Invalid email queue.'});
        }
        else{//valid
            var pushObj = {};
            //kinda sketchy
            pushObj['emailQueue.'+validTemplates[queue]['queueName']] = recipient;

            Settings.findOneAndUpdate({},{
                $push: pushObj
            },{
                new: true
            }, function(err,settings){
                if(err){
                    console.log(err);
                    return callback({error: 'Cannot add email to the queue.'});
                }
                else{
                    return callback(null,{message:'Success'});
                }
            });
        }


    },

    flushQueue : function(queue,callback){
        queue = queue.toLowerCase();

        console.log('Attempting queue flush');

        //check if the given queue is valid
        if(!queue || validTemplates[queue]['queueName'] === null || !validTemplates[queue]['canQueue']){//invalid
            console.log('Invalid email queue!');
            return callback({error: 'Invalid email queue.'});
        }
        else{//valid
            //return all emails from that queue
            Settings.findOne({}, function(err, settings) {
                if(err){
                    return callback({error: 'Cannot find the email queue.'});
                }
                else {
                    console.log('Flushing Queue...', settings.emailQueue[validTemplates[queue]['queueName']]);//debug

                    //get pending emails from database
                    var emailPendingList = settings.emailQueue[validTemplates[queue]['queueName']];

                    //Assemble the template
                    const emailHTML = module.exports.assembleTemplate(queue);

                    //loop through each
                    emailPendingList.forEach(function (element) {

                        //return user properties and send email
                        User.getByEmail(element, function (error, user) {
                            if (error) {
                                return callback({error: 'The provided email does not correspond to a user.'});
                            }
                            else {
                                //define the dates
                                date.setTime(settings.timeConfirm);
                                const confirmByString = date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });

                                date.setTime(settings.timeClose);
                                const submitByString = date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });

                                //fill dataPack
                                var dataPack = {
                                    nickname: user['firstName'],
                                    confirmBy: confirmByString,
                                    dashUrl: process.env.ROOT_URL,
                                    submitBy: submitByString
                                };

                                console.log(dataPack.dashURL);

                                //send the email
                                module.exports.sendTemplateEmail(element, queue, dataPack,emailHTML);

                                var pullObj = {};
                                //kinda sketchy too
                                pullObj['emailQueue.'+validTemplates[queue]['queueName']] = element;
                                //remove it from the queue

                                console.log(pullObj);

                                Settings.findOneAndUpdate({}, {
                                    $pull : pullObj
                                }, {

                                }, function(err, settings) {
                                    console.log(err, settings.emailQueue);
                                });

                            }

                        })

                    });

                    return callback(null, {message: 'Success'});

                }

            });
        }
    },

    flushQueueUser : function(userEmail,callback){

        console.log('Attempting user queue flush');

        //check if the given queue is valid
        Settings.findOne({},function(err,settings){
            if(err){
                return callback(err);
            }
            else{
                for(var emailQueue in settings.emailQueue){
                    if(typeof settings.emailQueue[emailQueue] !== 'function'){
                        for(var i=0; i < settings.emailQueue[emailQueue].length; i++){
                            console.log(emailQueue + ' ' + userEmail);
                        }
                    }
                }
            }
        })
    }
};