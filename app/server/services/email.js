require('dotenv').load();
var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');
var mongoose = require('mongoose');
var Settings = require('../models/Settings');
var User = require('../models/User');


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

const validQueues = {
    acceptanceemails: {
        queueName: "acceptanceEmails",
        templateLocation: "email-admittance",
        emailTitle: "You have been admitted!"
    },
    applicationemails: {
        queueName: "applicationEmails",
        templateLocation: "email-application",
        emailTitle: "You have applied!"
    },
    basicemails: {
        queueName: "basicEmails",
        templateLocation: "email-basic",
        emailTitle: "Ur basic"
    },
    confirmationemails: {
        queueName: "confirmEmails",
        templateLocation: "email-confirmation",
        emailTitle: "You have been confirmed!"
    },
    declineemails: {
        queueName: "declineEmails",
        templateLocation: "email-decline",
        emailTitle: "You have declined your invitation. :("
    },
    laggeremails: {
        queueName: "laggerEmails",
        templateLocation: "email-lagger",
        emailTitle: "WhY u LaG liKe mienCraft oN the scKool coMputEr"
    },
    laggerconfirmemails:{
        queueName: "laggerConfirmEmails",
        templateLocation: "email-lagger-confirmation",
        emailTitle: "WhY u LaG liKe mienCraft oN the scKool coMputEr conFiRm"
    },
    passwordchangedemails: {
        queueName: "passwordChangedEmails",
        templateLocation: "email-password-changed",
        emailTitle: "Your password has been changed!"
    },
    passwordresetemails: {
        queueName: "passwordResetEmails",
        templateLocation: "email-password-reset",
        emailTitle: "You requested to changed your password"
    },
    qremails: {
        queueName: "qrEmails",
        templateLocation: "email-qr",
        emailTitle: "Your QR code for admittance"
    },
    rejectionemails: {
        queueName: "rejectionEmails",
        templateLocation: "email-reject",
        emailTitle: "You have been rejected. :("
    },
    verifyemails:{
        queueName: "verifyEmails",
        templateLocation: "email-verify",
        emailTitle: "Please verify your email address!"
    }

};

module.exports = {
    sendTemplateEmail: function(recipient,templateName,dataPack,callback){//templated email
        templateName = templateName.toLowerCase();

        if(validQueues[templateName]['queueName']){
            //compile the template
            var htmlTemplate,htmlEmail,template,title;

            htmlTemplate = fs.readFileSync("./app/server/templates/"+ validQueues[templateName]['templateLocation'] +"/html.hbs","utf-8");
            template = handlebars.compile(htmlTemplate);
            htmlEmail = template(dataPack);
            title = validQueues[templateName]['emailTitle'];

            //start sending
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
                text: "Your email client does not support the viewing of HTML emails. Please consider enabling HTML emails in your settings, or downloading a client capable of viewing HTML emails.",
                html: htmlEmail
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
        if(validQueues[queue] === null){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            var pushObj = {};
            pushObj['emailQueue.'+validQueues[queue]] = recipient;

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

        console.log(validQueues);

        //check if the given queue is valid
        if(validQueues[queue] === null){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            //return all emails from that queue
            Settings.findOne({}, function(err, settings) {
                if(err){
                    return callback({error:"Cannot find the email queue."});
                }
                else{
                    console.log(settings.emailQueue[validQueues[queue]]);//debug

                    //get pending emails from database
                    var emailPendingList = settings.emailQueue[validQueues[queue]];

                    //loop through each
                    emailPendingList.forEach(function(element){
                        console.log(validQueues[queue]);//debug

                        //return user properties and send email
                        User.getByEmail(element,function(error,user){
                            if(error){
                                return callback({error:"The provided email does not correspond to a user."});
                            }
                            else{

                                //setup the datapack
                                var dataPack = null;

                                //depending on the queue, fill dataPack
                                switch(validQueues[queue]){
                                    case "acceptanceEmails":
                                        dataPack = {
                                            nickname: user['firstName'],
                                            confirmBy: "lol",
                                            dashURL: process.env.ROOT_URL
                                        }
                                }

                                //send the email
                                module.exports.sendTemplateEmail(element,queue,dataPack,function(err){
                                    if(err){
                                        console.log(err);
                                        return callback({error:"Cannot send email when flushing queue."});
                                    }else{
                                        return callback(null,{message:"Success"});
                                    }
                                })
                            }

                        })

                    });
                }

            })
        }
    }
};