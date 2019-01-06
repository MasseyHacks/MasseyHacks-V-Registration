require('dotenv').load();
const nodemailer = require('nodemailer');
const fs         = require('fs');
const handlebars = require('handlebars');
const Settings   = require('../models/Settings');



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
let validTemplates = JSON.parse(fs.readFileSync('config/data/emailTemplates.json', 'utf8'));

module.exports = {
    assembleTemplate : function(queueName){
        let templateHTML = fs.readFileSync(validTemplates[queueName]['templateLocation'],'utf8');
        let baseHTML = fs.readFileSync(validTemplates['base']['templateLocation'],'utf8');

        let template = baseHTML.replace('{{emailData}}',templateHTML);
        //console.log(template);
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

    returnTemplate : function(templateName,callback){
        templateName = templateName.toLowerCase();
        if(!templateName || validTemplates[templateName] == null){//invalid
            console.log('Invalid email queue!');
            return callback({error: 'Invalid email template!'});
        }
        else{
            fs.readFile(validTemplates[templateName]['templateLocation'],'utf8',function(err, data) {
                if (err){
                    return callback({error: 'File read failed'});
                } else {
                    return callback(null, {email: data})
                }
            });
        }
    },

    listTemplates : function(callback){
        var response = {
            validTemplates: Object.keys(validTemplates)
        };
        return callback(null,response);
    },

    setTemplate : function(templateName,templateBody,callback){
        templateName = templateName.toLowerCase();
        if(!templateName || validTemplates[templateName] == null){//invalid
            console.log('Invalid email queue!');
            return callback('Invalid email template!');
        }
        else{
            fs.writeFile(validTemplates[templateName]['templateLocation'],templateBody,function (err){
                if(err){
                    return callback({error:err});
                }

                return callback(null,{message:'Success'});
            });
        }
    }
};
