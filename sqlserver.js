var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var morgan = require("morgan");
var multer = require('multer');
var jwt = require('jsonwebtoken');
var verifyToken = require('./VerifyToken')


var app = express();
var port = process.env.PORT1 || 3000;
var srcpath = path.join(__dirname, '/public');
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Get SQL DB Connection
var sql = require('./sqldbcon');

// Get All Users
app.post('/checklogin', function (req, res) {
    var postBody = req.body;
    var eName = postBody.name;
    var epass = postBody.pass;
    console.log("UserNAME:" + eName);
    var request = new sql.Request();
    var loginQuery = "select UserID,UserName,FirstName,LastName,EmailAddress,UserImage from Users WHERE Disabled = 0 and UserName='" + eName + "'";
    // and Password='" + epass + "'";
    request.query(loginQuery, function (err, user) {
        if (err) {
            res.send(err)
        }
        else {
            if(user.recordset.length > 0){
                var token = jwt.sign({ id: user.recordset[0].UserID }, 'secret', { expiresIn: 3600 });
                 res.send({loginuserdata:user.recordset,token:token});
            } else{
                res.send({loginuserdata:null});
            }
            
        }
    });
});

//Register User
app.post('/saveuser', function (req, res, next) {
    var postBody = req.body;
    var UserName = postBody.UserName;
    var FirstName = postBody.FirstName;
    var LastName = postBody.LastName;
    var Email = postBody.Email;
    var RoleID = 3;
    var request = new sql.Request();
    request.query("INSERT INTO Users (UserName,FirstName,LastName,EmailAddress,RoleID) VALUES ('" + UserName + "','" + FirstName + "','" + LastName + "','" + Email + "','" + RoleID + "')", function (err, rows) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "User Registered Successfully..!!" });
        }
    });
});

//Update User
app.post('/updateuser', function (req, res, next) {
    var postBody = req.body;
    var userid = postBody.userID;
    var FirstName = postBody.FirstName;
    var LastName = postBody.LastName;
    var Email = postBody.Email;
    var request = new sql.Request();
    request.query("UPDATE Users SET FirstName='" + FirstName + "',LastName='" + LastName + "',EmailAddress='" + Email + "' where UserID='" + userid + "'", function (err, rows) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Updated..!!" });
        }
    });
});

// Get All Users
app.get('/getallusers', function (req, res) {
    var request = new sql.Request();
    request.query("select * from Users where Disabled = 0", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });
});
// Delete User
app.post('/deleteusers', function (req, res, next) {
    var postBody = req.body;
    var userid = postBody.userID;
    var request1 = new sql.Request();
    request1.query("UPDATE Users SET Disabled = 1 where UserID='" + userid + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Deleted...!" });
        }
    });
});


// Get All Tansactions
app.get('/getTransactions', function (req, res) {
    var request = new sql.Request();
    request.query("exec sp_getAllTrans", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

//  GetAllInvoiceItemsForUser
app.post('/getallinvoiceitemsforuser',verifyToken, function (req, res) {
    //var getBody = req.body;
    var userID = req.userId;
    var request = new sql.Request();
    request.query("exec sp_GetAllInvoiceItemsForUser @UserID = '" + userID + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

//  GetAllInvoiceDetailes
app.post('/getallinvoicedetailes',verifyToken, function (req, res) {
    var getBody = req.body;
    var invoiceID = getBody.invoiceID;
    var request = new sql.Request();
    request.query("exec sp_getInvoiceDetails_Model @InvoiceID = '" + invoiceID + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

//  GetAllInvoiceDetailesListView
app.post('/getallinvoicedetaileslist',verifyToken, function (req, res) {
    var getBody = req.body;
    var invoiceID = getBody.invoiceID;
    var request = new sql.Request();
    request.query("exec sp_getInvoiceItemsList @ViewState='null', @InvoiceID = '" + invoiceID + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

//  SAVE INVOIVE Detailes
app.post('/saveinvoicedetailes', function (req, res) {
    var getBody = req.body;
    var name = getBody.name;
    var no = getBody.no;
    var date = getBody.date;
    var gstin = getBody.gstin;
    var amount = getBody.amount;
    console.log(amount);
    var amount = parseFloat(amount).toFixed(2)
    console.log(amount);
    var userID = getBody.userID;
    var request = new sql.Request();
    request.query("INSERT INTO InVoice (InvoiceNumber,InvoiceDate,GSTIN,InvoiceAmount) VALUES ('" + no + "','" + date + "','" + gstin + "','" + amount + "')", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json({ data: 'Invoice Detailes Saved' });
        }
    });

});

//  SAVE INVOICE ITEMS LIST
app.post('/saveinvoiceitemslist', function (req, res) {
    var getBody = req.body;
    var name = getBody.name;
    var no = getBody.no;
    var date = getBody.date;
    var gstin = getBody.gstin;
    var amount = getBody.amount;
    var userID = getBody.userID;
    var request = new sql.Request();
    request.query("INSERT INTO InVoice (InvoiceNumber,InvoiceDate,GSTIN,InvoiceAmount,CurrentUserID) VALUES ('" + no + "','" + date + "','" + gstin + "','" + amount + "','" + userID + "')", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json({ data: 'Invoice Items List Saved' });
        }
    });

});


//  GetAllInvoiceItemsForUser
app.get('/spgetinvoicedetailsmodel', function (req, res) {
    var getBody = req.body;
    var userID = getBody.userid;
    var request = new sql.Request();
    request.query("   exec sp_getInvoiceDetails_Model @InvoiceId= 15497;", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

// Get All Vendors
app.get('/getvendors', function (req, res) {
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
app.post('/getvendordetails', function (req, res, next) {
    var vid = req.body.id;
    var request1 = new sql.Request();
    request1.query("select * from vendors where VendorID='" + vid + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
             console.log(data.recordset);         
            res.json(data.recordset);
        }
    });
});
// Get All Products
app.get('/getproducts', function (req, res) {
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.query("select * from products where IsActive = 1 ", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(data.recordset);
        }
    });

});

//Save Vendors
app.post('/savevendor', function (req, res, next) {
    var postBody = req.body;
    var vendorName = postBody.name;
    var description = postBody.desp;
    var email = postBody.email;
    var phone = postBody.phone;
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

//Save Products
app.post('/saveproducts', function (req, res, next) {
    var postBody = req.body;
    var productname = postBody.name;
    var description = postBody.desp;
    var price = postBody.price;
    var request = new sql.Request();
    request.query("INSERT INTO products (itemName,itemDescription,Price) VALUES ('" + productname + "','" + description + "','" + price + "')", function (err, rows) {
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
    var vid = req.body.id;
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

// Delete Products
app.post('/deleteproducts', function (req, res, next) {
    var pid = req.body.id;
    var request1 = new sql.Request();
    request1.query("UPDATE products SET IsActive = 0 where Productid='" + pid + "'", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            //  console.log(data);         
            res.json({ data: "Record has been Deleted...!" });
        }
    });
});

//update product
app.post('/api/updatedept', function (req, res, next) {
    con.getConnection(function (err, connection) {
        var postBody = req.body;
        var deptId = postBody.id
        var deptName = postBody.name;
        var deptDesp = postBody.desp;
        connection.query("UPDATE departments SET DepartmentName='" + deptName + "', DeparmentDescreption='" + deptDesp + "' WHERE ID='" + deptId + "'", function (err, rows) {
            if (rows.affectedRows) {
                connection.query("SELECT * FROM departments WHERE ID='" + deptId + "'", function (err, data) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send({ data: "Record has been Updated...!" });
                    }
                });
            }
        });
    });
});

//DropDown Values in register
app.get('/getregidropdown', function (req, res) {
    var request = new sql.Request();
    request.query("Select ID,RoleName from Roles", function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data.recordset);
        }
    });
});

//For Saveing the image Name in database 
app.post('/profile', function (req, res, next) {
    var postBody = req.body;
    console.log(postBody);
    var userID = postBody.userID;
    var userImg = postBody.userImg;
    var request = new sql.Request();
    request.query("UPDATE Users SET UserImage='" + userImg + "' WHERE ID='" + userID + "'", function (err, rows) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Updated..!!" });
        }
    });
});

//For Saveing the image file  
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/sivakumar.g/Documents/React/IQ-Invoice-V3/imgs/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage }).single("file");

app.post('/saveprofileimg', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.send({ err: "file not uploded" });
            return
        }
        res.send({ res: "file uploded" });
    })
});

app.get("/", function (req, res) {
    res.sendFile(srcpath + '/index.html');
});

app.listen(port, function (err, res) {
    if(err) {
        console.log('Error  :'+err);
    }else{
        console.log(`server start on port: ${port}`);
    }
});