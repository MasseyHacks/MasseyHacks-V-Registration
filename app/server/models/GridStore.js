require('dotenv').load();

const fs              = require('fs');
const jwt             = require('jsonwebtoken');
var gridfs            = require('gridfs-stream');

JWT_SECRET = process.env.JWT_SECRET;
var gfs;

module.exports = {
    init : function(mongooseConnection) {
        gfs = gridfs(mongooseConnection, require('mongodb'));
    },

    write : function(owner, filename, path) {
        var writestream = gfs.createWriteStream({
            filename: filename,
            metadata: owner
        });

        fs.createReadStream(path).pipe(writestream);

        writestream.on('close', (file) => {
            console.log('Stored File: ' + file.filename);
        });
    },

    authorize : function(user, filename, callback) {

        gfs.files.findOne({ filename: filename }, (err, file) => {
            if (err || !file) {
                return callback({
                    error: 'File not found',
                    code: 404
                });
            }

            if (file.metadata != user._id && !(user.permissions.level >= 3)) {
                return callback({
                    error: 'Access Denied',
                    code: 403
                });
            }

            return callback(null, process.env.ROOT_URL + '/api/getResource?token=' + jwt.sign({id: user._id, filename: filename, type: 'resource'}, JWT_SECRET, {
                expiresIn: 3600
            }));
        });

    },

    read : function(token, res) {

        jwt.verify(token, JWT_SECRET, function (err, payload) {
            if (err || !payload) {
                res.status(403).send('Invalid Token');
            }

            if (payload.type != 'resource' || !payload.exp || Date.now() >= payload.exp * 1000) {
                res.status(403).send('Invalid Token');
            }

            gfs.files.findOne({ filename: payload.filename }, (err, file) => {
                console.log(err, file)

                if (err || !file) {
                    res.status(404).send('File Not Found');
                    return
                }

                var readstream = gfs.createReadStream({ filename: payload.filename });
                readstream.pipe(res);
            });

        });


    }
};
