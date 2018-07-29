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
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

var transporter = nodemailer.createTransport(smtpConfig);
const validTemplates = JSON.parse(fs.readFileSync('config/data/emailTemplates.json', 'utf8'));

module.exports = {
    sendTemplateEmail: function(recipient,templateName,dataPack,callback){//templated email
        templateName = templateName.toLowerCase();
        console.log("Sending template email! to:" +recipient+ " tempalte "+templateName+" dp "+dataPack);
        if(validTemplates[templateName]['queueName']){
            //compile the template

            var htmlTemplate = fs.readFileSync(validTemplates[templateName]['templateLocation'],"utf-8");
            var template = handlebars.compile(htmlTemplate);
            var htmlEmail = template(dataPack);
            var title = validTemplates[templateName]['emailTitle'];

            //start sending
            transporter.verify(function(error, success) {//verify the connection
                if (error) {
                    console.log(error);
                    return callback({error:"Cannot connect to SMTP server."});
                }
            });

            var email_message = {//construct the message
                from: process.env.EMAIL_CONTACT,
                to: recipient,
                subject: title,
                text: "Your email client-old does not support the viewing of HTML emails. Please consider enabling HTML emails in your settings, or downloading a client-old capable of viewing HTML emails.",
                html: htmlEmail
            };

            transporter.sendMail(email_message, function(error,response){//send the email
                if(error){
                    console.log(error,response);
                    return callback({error:"Something went wrong when we attempted to send the email."});
                }
                else{
                    console.log("email sent");
                    return callback(null, {message:"Success"});
                }
            });
        }
        else{
            return callback({error:"Invalid email queue!"});
        }
    },

    sendBoringEmail : function(recipient,title,message,callback){//plaintext email

        transporter.verify(function(error, success) {//verify the connection
            if (error) {
                console.log(error);
                return callback({error:"Cannot connect to SMTP server."});
            }
        });

        var email_message = {//construct the message
            from: process.env.EMAIL_HOST,
            to: recipient,
            subject: title,
            text: message
        };

        transporter.sendMail(email_message, function(error,response){//send the email
            if(error){
                console.log(error,response);
                return callback({error:"Something went wrong when we attempted to send the email."});
            }
            else{
                return callback(null, {message:"Success"});
            }
        });
    },

    queueEmail : function(recipient,queue,callback){

        queue = queue.toLowerCase();//just in case

        //check if the given queue is valid
        if(validTemplates[queue] === null){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
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
                    return callback({error:"Cannot add email to the queue."});
                }
                else{
                    return callback(null,{message:"Success"});
                }
            });
        }


    },

    flushQueue : function(queue,callback){
        queue = queue.toLowerCase();

        console.log("Attempting queue flush");

        //check if the given queue is valid
        if(!queue || validTemplates[queue]['queueName'] === null || !validTemplates[queue]['canQueue']){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            //return all emails from that queue
            Settings.findOne({}, function(err, settings) {
                if(err){
                    return callback({error:"Cannot find the email queue."});
                }
                else {
                    console.log('Flushing Queue...', settings.emailQueue[validTemplates[queue]['queueName']]);//debug

                    //get pending emails from database
                    var emailPendingList = settings.emailQueue[validTemplates[queue]['queueName']];

                    //loop through each
                    emailPendingList.forEach(function (element) {

                        //return user properties and send email
                        User.getByEmail(element, function (error, user) {
                            if (error) {
                                return callback({error: "The provided email does not correspond to a user."});
                            }
                            else {
                                //define the dates
                                date.setTime(settings.timeConfirm);
                                const confirmByString = date.toLocaleDateString("en-US", {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });

                                date.setTime(settings.timeClose);
                                const submitByString = date.toLocaleDateString("en-US", {
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
                                module.exports.sendTemplateEmail(element, queue, dataPack, function (err) {
                                    if (err) {
                                        console.log(err);
                                        return callback({error: "Cannot send email when flushing queue."});
                                    }
                                });

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


                                /*
                                Settings.findOneAndUpdate({},{
                                    $pull:pullObj
                                },{multi:false});*/
                            }

                        })

                    });

                    return callback(null, {message: "Success"});

                }

            });
        }
    }
};