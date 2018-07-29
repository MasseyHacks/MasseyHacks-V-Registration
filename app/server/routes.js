module.exports = function(app) {
    app.get('/', function(req, res){
        res.sendfile('./app/client/index.html');
    });

    /*
    app.get('/login', function(req, res){
        res.sendfile('./app/client-old/views/login/login.html');
    });*/

    app.get('*', function(req, res){
        res.sendfile('./app/client/index.html');
    });
};
