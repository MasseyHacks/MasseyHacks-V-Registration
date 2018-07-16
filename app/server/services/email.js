require('dotenv').load();
var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');
var mongoose = require('mongoose');
var Settings = require('../models/Settings');


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

module.exports = {
    sendTemplateEmail: function(recipient,templateName,datapack,callback){//templated email
        templateName = templateName.toLowerCase();

        //compile the template
        var htmlTemplate,htmlEmail,template,title;

        switch(templateName){
            case "admittance":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-admittance/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(datapack);
                title = "You have been admitted!";
                break;
            case "application":
                htmlTemplate = fs.readFileSync("./app/server/templates/email-application/html.hbs","utf-8");
                template = handlebars.compile(htmlTemplate);
                htmlEmail = template(datapack);
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
        const validQueues = {
            acceptance: "acceptanceEmails",
            rejection: "rejectionEmails"
        };

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
        const validQueues = ['acceptance','rejection'];
        queue = queue.toLowerCase();

        //check if the given queue is valid
        if(validQueues.indexOf(queue) == -1){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            //return all emails from that queue
            Settings.find({}, function(err, settings) {
                console.log(settings.emailQueue);
            })
        }
    }
};