const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const path = require('path');
const app = express();

const question = require('./route/cutit.js');

const p = path.join(
  __dirname,
  'css',
);

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(p));

app.set('view engine', 'ejs');

app.use('/', question);
app.listen(port, () => {
    console.log('Connection Established At PORT:', port);
});
