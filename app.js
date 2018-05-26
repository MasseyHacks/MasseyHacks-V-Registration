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

var app = express();
mongoose.connect(database);

app.use(express.static('app/client/'));
app.use(cors());

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