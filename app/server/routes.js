module.exports = function(app) {

    app.get('/', function(req, res){
        res.sendfile('');
    });

    app.get('/login', function(req, res){
        res.sendfile('./app/client/views/login/index.html');
    });

    app.get('/register', function(req, res){
        res.sendfile('./app/client/register.html');
    });

    app.get('*', function(req, res){
        res.json({'error' : 'lol what are you doing here?'});
    });

};
