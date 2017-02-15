module.exports = function (app,passport,async,crypto, nodemailer) {


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


//============================PROFILE============================
//protected so you have to be logged in to visit
//route middleware to verify
app.get('/profile', isLoggedIn, function (req,res) {
	res.render('profile.ejs', {
		user : req.user, //get user our of sesh and pass to template
		alertDiv: '',
		message: req.flash ('changePasswordMessage')
	});
});

app.post('/profile', function (req,res){
	var success = 1;
	var alert = "";
	var changePassMessage = '';
	if (!(req.body.newPassword === req.body.confirmPassword))  {
		changePassMessage = ' Password Confirmation doesn\'t match new Password';
		success = 0;
		alert = "alert-danger"; 
	} 
	var curPassword = req.body.password;
	var newPassword = req.body.newPassword;
	var curUser = req.user;
	req.login(curUser, function(err) {
		console.log(arguments);
		if (!curUser.validPassword(curPassword)) {
			changePassMessage = ' Oops! Wrong Password. ';
			success = 0;
			alert ="alert-danger";
		}
		if (err) {
			changePassMessage = ''+ err;
			success = 0;
			alert = "alert-danger";
		}
		if (success == 1) {
			changePassMessage = 'Yaaay! Successfully updated password';
			alert = "alert-success";
			curUser.local.password = curUser.generateHash(newPassword);
			curUser.save(function(err) {
                if (err)
                    throw err;
            });			
		}
		//render profile page with flash message
		req.flash('changePassMessage', changePassMessage);
		res.render('profile.ejs', {
			user: curUser,
			alertDiv: alert, 
			message: req.flash('changePassMessage') //CHECK
	})})
});


//============================FORGOT PASSWORD============================
app.get('/forgotpass', function (req,res) {
	res.render('forgotPassword/forgotpass.ejs', {
		alertType: '',
		message:req.flash('forgotPassMessage')});
})

var User = require ('../app/models/user');
var token;
//TODO what's next?
app.post('/forgotpass', function (req,res, next) {
	async.waterfall ([
		//generate random token for password reset
		function (done) {
			//buf is buffer containing generated buf
			crypto.randomBytes(20, function(err, buf) {
				token = buf.toString('hex');
				done (err, token);
			})
		},
		//verify if email exists
		function (token, done) {
			User.findOne({'local.email':req.body.email}, function (err, user) {
				if (!user) {
					req.flash('forgotPassMessage','No account with that email address exists');
					return res.render('forgotPassword/forgotpass.ejs', {
						message: req.flash('forgotPassMessage'),
						alertType: 'alert-danger'
					})				
				}
				user.local.resetPasswordToken = token;
				user.local.resetPasswordExpires = Date.now() + 3600000;//1 hour

				user.save(function(err) {
					done (err,token, user); //save user with token
				});
			});
		},
		//send email with token
		function(token,user,done) {
			link="http://"+req.get('host')+"/reset?token="+token;
			console.log(link);
			var mailOptions = {
				to: user.local.email,
				subject: "Reset Password",
				html: 'Hello, <br> Follow the link to reset your password. <br>' +
				'<a href =' + link +'>'+'Click here to reset password. </a> <br>' +
				'If you did not request this, please ignore this email and your password will remain unchanged.'
			};
			smtpTransport.sendMail(mailOptions, function(error,response) {
				req.flash ('forgotPassMessage','An e-mail has been sent to ' + user.email + ' with further instructions.');
        		done(error, 'done');
			});
		}
	], function (err) {
		if(err) return next(err);
		res.render('forgotPassword/forgotpass.ejs',{
			message: req.flash('forgotPassMessage'),
			alertType: 'alert-success'
		});
	});
});


app.get('/reset', function (req,res) {
	console.log(req.protocol+"://"+req.get('host'));
	console.log("http://"+host);
	if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
		if(req.query.token==token) 		//res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
			res.render('forgotPassword/reset.ejs',{'token':token});
		else 
			res.end("<h1>Bad Request</h1>");
	} else {
		res.end ("<h1>Request from unknown source </h1>");
	} 
})


app.post('/reset', function (req,res) {
	User.findOne({'local.resetPasswordToken':req.query.token}, function(err,user){
		if (!user) {
			res.end("No user found");
		}
		if (err)
			return err;
		user.local.password = user.generateHash(req.body.password);
		user.save(function(err) {
	        if (err)
	            throw err;
	        else
	        	res.redirect('/content');
   		});
	});
	console.log(arguments);
});

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
var rand,link, mailOptions;
var host = exports.host;

app.get('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
	link="http://"+req.get('host')+"/verify?id="+rand;
	mailOptions={
		to : req.user.local.email, 
		subject : "Please confirm your Email account",
		html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
	}	
	smtpTransport.sendMail(mailOptions, function(error, response){
   	if(error){
        console.log(error);
		res.end("error");
	} else
		res.end("sent");
	});
});

app.get('/verify',function(req,res){
if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
	console.log("Domain is matched. Information is from Authentic email");
	if(req.query.id==rand) 		//res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
		res.render('emailconfirm.ejs', {message: req.flash ('signupMessage')});
	else 
		res.end("<h1>Bad Request</h1>");
	
} else 
	res.end("<h1>Request is from unknown source");
});



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

//============================ABOUT============================
app.get('/about', function (req, res) {
	res.render('about.ejs');
});


//============================LOGOUT=================================
app.get('/logout', function (req,res) {
	req.logout();
	res.redirect('/');
});

//============================FLASH=================================
// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
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