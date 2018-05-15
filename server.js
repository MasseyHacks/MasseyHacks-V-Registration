var app = require('express')();
var express = require('express');
var http = require('http').Server(app);

app.use('/static', express.static('static'));

app.get("/", function(req,res){

    res.sendFile(__dirname + "/pages/index.html");

});

http.listen(3001, function(){
    console.log('listening on *:3001');
});