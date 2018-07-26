module.exports = function(app) {
    app.get('/', function(req, res){
        res.sendfile('./app/client/index.html');
    });

    app.get('/login', function(req, res){
        res.sendfile('./app/client/views/login/index.html');
    });

    app.get('*', function(req, res){
        res.sendfile('./app/client/index.html');
    });
};
