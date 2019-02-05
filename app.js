require('dotenv').load();
const express         = require('express');
const cors            = require('cors');
const fs              = require('fs');

const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');
const morgan          = require('morgan');
const cookieParser    = require('cookie-parser');
const RateLimit       = require('express-rate-limit');
const cluster         = require('cluster');
const cpuCount        = require('os').cpus().length;

const mongoose        = require('mongoose');
const port            = process.env.PORT || 3005;
const database        = process.env.DATABASE || 'mongodb://localhost:27017';

const Waiver          = require('./app/server/models/GridStore');

// Start configuration
const organizers      = require('./config/organizers');
const settings        = require('./config/settings');

// Start services
const Raven           = require('raven');
const stats           = require('./app/server/services/stats');

Raven.config(process.env.SERVER_RAVEN_KEY).install();
Raven.context(function() {
    var app = express();
    console.log(database);
    mongoose.connect(database, {server: {auto_reconnect: true}})
        .then(() => {
            Waiver.init(mongoose.connection.db)
        })
        .catch(error => {
            console.log("DB CONNECTION ERROR");
            console.log(error)
        });
    stats.startService();

    app.enable('trust proxy'); // For reverse proxy

    if (!cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);

        for (let i = 0; i < cpuCount; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {

        console.log(`Worker ${process.pid} started`);

        // Start routers
        app.use(express.static('app/client/'));

        let githubRouter = express.Router();
        require('./app/server/routes/github')(githubRouter);
        app.use('/github', githubRouter);

        var apiRouter = express.Router();
        require('./app/server/routes/api')(apiRouter);
        app.use('/api', apiRouter);

        var authRouter = express.Router();
        require('./app/server/routes/auth')(authRouter);
        app.use('/auth', authRouter);

        require('./app/server/routes')(app);

        app.listen(port, function () {
            console.log('listening on *:' + port);
        });

    }

});
