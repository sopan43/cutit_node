var mysql = require('mysql');

var connection = mysql.createConnection({
    user: process.env.USER_CUTIT,
    password: process.env.PASS_CUTIT,
    database: process.env.DB_CUTIT,
    host: process.env.HOST_CUTIT

});

connection.connect(function(error) {
    if (error) {
        console.error('error connecting: ' + error.stack);
        return;
    }
    console.log('Connecting.... ');
});

module.exports = connection;

