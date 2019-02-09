const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const app = express();

const question = require('./route/cutit.js');
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use('/', question);
app.listen(port, () => {
    console.log('Connection Established At PORT:', port);
});
