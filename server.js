var express = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var app = express();
// var path = require('path');
// var formidable = require('formidable');
// var conn = require('./connection.js');

var question = require('./route/cutit.js');

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use('/', question);

app.listen(port, () => {
    console.log('Connection Established At PORT:', port);
});