var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var morgan = require("morgan");
var jwt = require('jsonwebtoken');
var config = require('./config');


var app = express();
var port = process.env.PORT1 || 4000;
var srcpath = path.join(__dirname, '/public');
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

//DB Connection
var sql = require('./db');
var Bob = require('./Bob')(app);

// Get All Users
app.post('/checklogin', function (req, res) {
    var postBody = req.body;
    var eName = postBody.name;
    var epass = postBody.pass;
    console.log(eName);
    var request = new sql.Request();
    // query to the database and get the records
    var test = "select UserID,UserName,FirstName,LastName,EmailAddress,UserImage from Users WHERE Disabled = 0 and UserName='" + eName + "' and Password='" + epass + "'";
    request.query(test, function (err, data) {
        if (err) {
            res.send(err)
        }
        else {
            var token = jwt.sign({ id: data.recordset.ID }, 'secret', { expiresIn: 3600 });
            res.send({ user: data.recordset, token: token });
        }
    });
});

//Save Vendors
app.post('/savevendor', function (req, res, next) {
    var postBody = req.body.models;
    console.log(postBody);
    var vendorName = postBody[0].VendorName;
    var description = postBody[0].VendorName;
    var email = postBody[0].VendorEmail;
    var phone = postBody[0].Phone;
    var request = new sql.Request();
    request.query("INSERT INTO Vendors (VendorName,VendorDescription,VendorEmail,Phone) VALUES ('" + vendorName + "','" + description + "','" + email + "','" + phone + "')", function (err, rows) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });
});



//update vendor
app.post('/updatevendor', function (req, res, next) {
    var postBody = req.body.models;
    console.log(postBody);
    var vendorID = postBody[0].VendorID;
    var vendorName = postBody[0].VendorName;
    var email = postBody[0].VendorEmail;
    var phone = postBody[0].Phone;
    var request = new sql.Request();
    request.query("UPDATE Vendors SET VendorName='" + vendorName + "', VendorEmail='" + email + "', Phone='" + phone + "' WHERE VendorID='" + vendorID + "'", function (err, rows) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });

});

// Delete Vendors
app.post('/deletevendor', function (req, res, next) {
    var vid = req.body.models;
    console.log('Delete vendors ID: ' + vid[0].VendorID)
    vid = vid[0].VendorID;
    var request1 = new sql.Request();
    request1.query("UPDATE Vendors SET Disabled = 1 where VendorID='" + vid + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            //  console.log(data);         
            res.json({ data: "Record has been Deleted...!" });
        }
    });
});

app.listen(port, function () {
    console.log("server start on port: " + port);
});
