const Imap     = require('imap');
const inspect  = require('util').inspect;
const Users    = require('../models/User');
const Settings = require('../models/Settings');

const imap     = new Imap({
    user: process.env.waiverEmail,
    password: process.env.waiverPassword,
    host: process.env.waiverAddress,
    port: process.env.waiverPort,
    tls: true
});

function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
    fetch_email();

    imap.on('mail', function () {
        fetch_email()
    })
});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
});

const fetch_email = function() {
    openInbox(function() {
        imap.search([ 'UNSEEN'], function(err, results) {
            if (!err && results.length !== 0) {

                const f = imap.fetch(results, {
                    bodies: 'HEADER.FIELDS (FROM SUBJECT)',
                    markSeen: true,
                    struct: true
                });
                f.on('message', function (msg) {
                    msg.on('body', function (stream) {
                        var buffer;
                        stream.on('data', function (chunk) {
                            buffer = chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            buffer = buffer.split('\r\n');

                            if (buffer[0] === 'From: HelloSign <noreply@mail.hellosign.com>') {
                                console.log(buffer[1]);
                                const process = buffer[1].split(' ');
                                if (process[process.length-1] === 'by') {
                                    process = [buffer[2].slice(1)];
                                }

                                Users.findOneAndUpdate({
                                        'email': process[process.length-1]
                                    },
                                    {
                                        $set: {
                                            'status.waiver': true
                                        }
                                    }, {
                                        new: true
                                    },
                                    function(err, user) {
                                        if (user) {
                                            console.log(user.email + '\'s waiver has been received');
                                            addToLog(user.email + '\'s waiver has been received', null);
                                        } else {
                                            addToLog('broooo da sheit? dis bois (' + process[process.length-1] + ') has da non existianting email bro')
                                        }
                                    });
                            }
                        });
                    });

                });
                f.once('error', function (err) {
                    console.log('imap error ' + err);
                });
            }
        });
    });
};

imap.connect();