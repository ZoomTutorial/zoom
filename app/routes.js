module.exports = function (app,passport, nodemailer) {


//============================HOME PAGE============================
app.get('/', function (req,res) {
	res.render ('index.ejs'); //TODO load handlebars index templ
});



//============================LOGIN============================
app.get('/login', function (req,res) {
		//render page and pass flash data if exists
		res.render('login.ejs', {
			message: req.flash ('loginMessage')});
});


 // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/content', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
//============================SIGN UP============================
app.get('/signup', function (req,res) {
	//render page and pass flash data if exists
	res.render('signup.ejs', {message: req.flash ('signupMessage')});
});

// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/send', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


//===========================EMAIL VERIFICATION===========================
//send email to input email
var exports = require ('../config/exports.js'); //TODO check if exports work
var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",
	auth : {
		'user':exports.auth.user,
		'pass':exports.auth.pass
	}
 });

//var host = '192.168.56.101:8080';
var rand,link, mailOptions;
var host = exports.host;

app.get('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
	link="http://"+req.get('host')+"/verify?id="+rand;
	//test
	console.log("host is: "+host);
	console.log("auth is: "+ exports.auth);
	mailOptions={
		to : req.user.local.email, //is that working?
		subject : "Please confirm your Email account",
		html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
	}
	console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function(error, response){
   	 if(error){
        console.log(error);
		res.end("error");
	 }else{
        console.log("Message sent: " + response.message);
		res.end("sent");
    	 }
});
});

app.get('/verify',function(req,res){
console.log(req.protocol+"://"+req.get('host'));
console.log("http://"+host)
if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
	console.log("Domain is matched. Information is from Authentic email");
	if(req.query.id==rand) {
		console.log("email is verified");
		res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
	} else {
		console.log("email is not verified");
		res.end("<h1>Bad Request</h1>");
	}
} else {
	res.end("<h1>Request is from unknown source");
}
});


//============================PROFILE============================
//protected so you have to be logged in to visit
//route middleware to verify
app.get('/profile', isLoggedIn, function (req,res) {
	res.render('profile.ejs', {
		user : req.user //get user our of sesh and pass to template
	})
})



//============================CONTENT============================
app.get('/content', isLoggedIn, function (req,res) {
	res.render('content.ejs'); //check if need to send variables
});



// //============================QUIZZ============================
// app.get('/quizz', function (req,res) {
// 	res.render('quizz.ejs'); //check if pass in variables
// });



// //============================PROGRESS============================
// app.get('/progress', isLoggedIn, function (req,res) {
// 	res.render ('progress.ejs'); //check if pass in var
// });



// //============================COURSE COMPLETE============================
// app.get('/coursepass', isLoggedIn, function (req,res) {
// 	res.render('coursepass.ejs');//check if pass in var
// });



//============================LOGOUT=================================
app.get('/logout', function (req,res) {
	req.logout();
	res.redirect('/');
});



//route middleware to make sure user is logged in
function isLoggedIn (req,res,next) {
	//if user auntheticated in sesh, carry on
    if (req.isAuthenticated ())
    	return next();

    //if not redirect them to home page
    res.redirect('/');
};
}