var sql = require('mssql');
var config = {
    user: 'sa',
    password: 'iqss',
    server: 'localhost\\SQLEXPRESS',
    database: 'TestDB'
};

sql.connect(config, function (err) {
    if (err) 
        console.log("ERROR IS ********: " + err);
    else
        console.log('DATABASE CONNECTED')
});
module.exports = sql;