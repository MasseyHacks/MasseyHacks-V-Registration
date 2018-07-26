require('dotenv').load();

var express = require('express');
var cors = require('cors')

var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3005;
var database        = process.env.DATABASE || "mongodb://localhost:27017";

// Start configuration
var organizers      = require('./config/organizers');
var settings        = require('./config/settings');

// Start services
var autoRemove         = require('./app/server/services/autoRemove');
var waiverReceiver     = require('./app/server/services/waiverReceiver');

var app = express();
mongoose.connect(database);

// Start routers
app.use(express.static('app/client/'));

var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use('/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use('/auth', authRouter);

require('./app/server/routes')(app);

app.listen(port, function(){
    console.log('listening on *:' + port);
});