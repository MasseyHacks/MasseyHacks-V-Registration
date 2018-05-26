module.exports = function(app) {

    app.get('/', function(req, res){
        res.sendfile('./app/client/index.html');
    });

    app.get('/login', function(req, res){
        res.sendfile('./app/client/login.html');
    });

    app.get('/register', function(req, res){
        res.sendfile('./app/client/register.html');
    });

    app.get('*', function(req, res){
        res.end('lol what are you doing here?');
    });

};
