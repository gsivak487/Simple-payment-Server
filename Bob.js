var sql = require('./db');
module.exports = (app) => {
    // Get All Vendors
    app.get('/getvendors', function (req, res) {
        // res.write("I am a new route")
        // res.end();
        var request = new sql.Request();
        request.query("exec sp_getvendors", function (err, data) {
            if (err) {
                res.send(err);
            }
            else {
                res.json(data.recordset);
            }
        });

    });

}