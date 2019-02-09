const mysql = require('mysql2');

const pool = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'cutit',
    host: 'localhost'
});

// connection.connect(function(error) {
//     if (error) {
//         console.error('error connecting: ' + error.stack);
//         return;
//     }
//     console.log('Connecting.... ');
// });

module.exports = pool.promise();