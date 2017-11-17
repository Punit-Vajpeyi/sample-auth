var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_NAME
});

// connection.connect();

connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    const users =  "CREATE TABLE IF NOT EXISTS users(" +
        "user_id INT AUTO_INCREMENT PRIMARY KEY," +
        "username VARCHAR(40) NOT NULL UNIQUE," +
        "password BINARY(60) NOT NULL," +
        "email VARCHAR(255) NOT NULL UNIQUE" +
        ")";

    connection.query(users, function (err, results, fields) {
        if (err) {
            console.log(err.message);
        } else {
            console.log("users table is created");
        }
    });
});

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
// });

module.exports = connection;