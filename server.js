//require dependencies
var express = require ('express');
var app = express();
var port = 8000;
var mongoose = require('mongoose');
var passport = require ('passport');
var flash = require ('connect-flash');

var morgan = require ('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require ('body-parser');
var session = require('express-session');

var configDB = require ('./config/database.js');

//configuration =================================
mongoose.connect (configDB.url); //connect to database
require ('./config/passport') (passport);//pass passport for config

//setup our express app
app.use (morgan('dev')); //log all requests to console
app.use(cookieParser()); //read cookies (needed for auth)
app.use (bodyParser()); //get info from html forms

app.set('view engine', 'handlebars'); //fill in name for template engine


//for passport
app.use(session({secret: 'secret session in work'}));//secret sesh
app.use(passport.initialize());
app.use(passport.session());//persistent login sessions
app.use(flash());//use connect-flash for flash message stored in session

//routes ============================================
require.('./app/routes.js')(app,passport); //load routes and pass in app with configured passport
//set static files location
app.use(express.static('../public'));


//launch ============================================
app.listen (port);
console.log ('On port ' + port);