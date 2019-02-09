const mysql = require('mysql2');

const pool = mysql.createPool({
    user: process.env.USER_CUTIT,
    password: process.env.PASS_CUTIT,
    database: process.env.DB_CUTIT,
    host: process.env.HOST_CUTIT
});
module.exports = pool.promise();