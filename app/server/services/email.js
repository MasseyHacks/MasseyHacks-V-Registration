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
    acceptance: "acceptanceEmails",
    acceptanceemails: "acceptanceEmails",
    admittance: "acceptanceEmails",
    admittanceemails: "acceptanceEmails",
    confirm: "confirmEmails",
    confirmemails: "confirmEmails",
    decline: "declineEmails",
    declineemails: "declineEmails",
    laggar: "laggarEmails",
    laggaremails: "laggarEmails",
    laggarconfirm: "laggarConfirmEmails",
    laggarconfirmemails: "laggarConfirmEmails",
    passwordchanged: "passwordChangedEmails",
    passwordchangedemails: "passwordChangedEmails",
    passwordreset: "passwordResetEmails",
    passwordresetemails: "passwordResetEmails",
    qr: "qrEmails",
    qremails: "qrEmails",
    reject: "rejectionEmails",
    rejection: "rejectionEmails",
    rejectionemails: "rejectionEmails",
    verify: "verificationEmails",
    verification: "verificationEmails",
    verificationemails: "verificationEmails"

};

module.exports = {
    sendTemplateEmail: function(recipient,templateName,dataPack,callback){//templated email
        templateName = templateName.toLowerCase();

        //compile the template
        var htmlTemplate,htmlEmail,template,title;

        switch(validQueues[templateName]){
            case "acceptanceEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-admittance/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "applicationEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-application/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "confirmationEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-confirmation/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "declineEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-decline/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "laggarEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-laggar/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "laggarConfirmEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-laggar-confirmation/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "passwordChangedEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-password-changed/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "passwordResetEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-password-reset/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "qrEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-qr/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "rejectionEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-reject/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            case "verifyEmails":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-verify/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(dataPack);
                title = "You have been admitted!";
                break;
            default:
                console.log('The specified template does not exist');
                return callback({error:"The specified template does not exist."});
        }

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