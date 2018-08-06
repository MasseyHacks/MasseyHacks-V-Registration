var mongoose = require('mongoose');

var emailTemplateList = {
    acceptanceemails: {
        queueName: 'acceptanceEmails',
        canQueue: true
    },
    applicationemails: {
        queueName: 'applicationEmails',
        canQueue: false
    },
    confirmationemails: {
        queueName: 'confirmEmails',
        canQueue: false
    },
    declineemails: {
        queueName: 'declineEmails',
        canQueue: false
    },
    laggeremails: {
        queueName: 'laggerEmails',
        canQueue: true
    },
    laggerconfirmemails: {
        queueName: 'laggerConfirmEmails',
        canQueue: true
    },
    passwordchangedemails: {
        queueName: 'passwordChangedEmails',
        canQueue: false
    },
    passwordresetemails: {
        queueName: 'passwordResetEmails',
        canQueue: false
    },
    qremails: {
        queueName: 'qrEmails',
        canQueue: false
    },
    rejectionemails: {
        queueName: 'rejectionEmails',
        canQueue: true
    },
    verifyemails: {
        queueName: 'verifyEmails',
        canQueue: false
    }
};

var emailTemplates = {
    acceptanceemails: {
        emailTitle: 'You have been admitted!',
        emailHTML: '<html><body>template test</body></html>'
    },
    applicationemails: {
        emailTitle: 'You have applied!',
        emailHTML: '<html><body>template test</body></html>'
    },
    confirmationemails: {
        emailTitle: 'You have been confirmed!',
        emailHTML: '<html><body>template test</body></html>'
    },
    declineemails: {
        emailTitle: 'You have declined your invitation. :(',
        emailHTML: '<html><body>template test</body></html>'
    },
    laggeremails: {
        emailTitle: 'WhY u LaG liKe mienCraft oN the scKool coMputEr',
        emailHTML: '<html><body>template test</body></html>'
    },
    laggerconfirmemails: {
        emailTitle: 'WhY u LaG liKe mienCraft oN the scKool coMputEr conFiRm',
        emailHTML: '<html><body>template test</body></html>'
    },
    passwordchangedemails: {
        emailTitle: 'Your password has been changed!',
        emailHTML: '<html><body>template test</body></html>'
    },
    passwordresetemails: {
        emailTitle: 'You requested to changed your password',
        emailHTML: '<html><body>template test</body></html>'
    },
    qremails: {
        emailTitle: 'Your QR code for admittance',
        emailHTML: '<html><body>template test</body></html>'
    },
    rejectionemails: {
        emailTitle: 'You have been rejected. :(',
        emailHTML: '<html><body>template test</body></html>'
    },
    verifyemails: {
        emailTitle: 'Please verify your email address!',
        emailHTML: '<html><body>template test</body></html>'
    }
};

var schema = new mongoose.Schema({
    templateList : emailTemplateList,
    templates: emailTemplates
});

module.exports = mongoose.model('Templates', schema);