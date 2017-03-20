var mysql = require('mysql');

exports.connection = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "test"
        });

//exports.end = connection.destroy();