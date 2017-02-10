// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');

var nodemailer = require('nodemailer');
var passport = require('passport');
//var flash    = require('connect-flash');
var flash = require ('express-flash');
var session = require('express-session');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var sessionStore = new session.MemoryStore;

var configDB = require('./config/database.js');
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
var db = mongoose.connection;
//forgot pass
var crypto = require ('crypto');
var async = require ('async');

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ 
	store: sessionStore,
	saveUnitialized: 'true',
	resave: 'true',
	secret: 'secret' 
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
app.use(express.static('static', {redirect : false}));
require('./app/routes.js')(app, passport,async, crypto
, nodemailer); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);