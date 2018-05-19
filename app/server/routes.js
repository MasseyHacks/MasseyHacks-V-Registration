module.exports = function(app) {

    app.get('/', function(req, res){
        res.sendfile('./app/client/index.html');
    });

    app.get('*', function(req, res){
        res.sendfile('./app/client/index.html');
    });

};
