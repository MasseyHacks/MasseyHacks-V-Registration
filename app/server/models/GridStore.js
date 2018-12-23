const fs              = require('fs');
var gridfs            = require('gridfs-stream');

var gfs;

module.exports = {
    init : function(mongooseConnection) {
        gfs = gridfs(mongooseConnection, require('mongodb'));
    },

    write : function(filename, path) {
        var writestream = gfs.createWriteStream({ filename: filename });

        fs.createReadStream(path).pipe(writestream);

        writestream.on('close', (file) => {
            console.log('Stored File: ' + file.filename);
        });
    },

    read : function(filename, res) {
        gfs.exist({ filename: filename }, (err, file) => {
            if (err || !file) {
                console.log(err, file)

                res.status(404).send('File Not Found');
                return
            }

            var readstream = gfs.createReadStream({ filename: filename });
            readstream.pipe(res);
        });
    }
};
