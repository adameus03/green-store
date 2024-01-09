var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var expressLayouts = require('express-ejs-layouts'); 


var indexRouter = require('./routes/index');

const accessAPI = require('./modules/access_api/routes/api.js');
//const accessUsers = require('./modules/access_api/routes/users.js'); //garbage

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(expressLayouts);

app.engine('html', require('ejs').renderFile);
app.set("views", "./public");
app.set('view engine', 'ejs');

//app.use("/access/users", accessUsers.router); //garbage
//app.use(accessUsers.checkLogin); //garbage

app.use('/', indexRouter);
app.use("/access/api", accessAPI.router);

module.exports = app;
