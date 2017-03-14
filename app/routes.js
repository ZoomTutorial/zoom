module.exports = function (app,passport,async,crypto, nodemailer, fs) {

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
		message: req.flash ('changePassMessage')
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
		alertDiv  = alert;
		res.render('profile.ejs', {
			user: curUser,
			alertDiv: alert, 
			message: req.flash('changePassMessage') //CHECK
		})
	})
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
			var mailOptions = {
				to: user.local.email,
				subject: "Reset Password",
				html: 'Hello, <br> Follow the link to reset your password. <br>' +
				'<a href =' + link +'>'+'Click here to reset password. </a> <br>' +
				'If you did not request this, please ignore this email and your password will remain unchanged.'
			};
			smtpTransport.sendMail(mailOptions, function(error,response) {
				req.flash ('forgotPassMessage','An e-mail has been sent to ' + user.local.email + ' with further instructions.');
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
	// console.log(req.protocol+"://"+req.get('host'));
	// console.log("http://"+host);
	// console.log(req.query.token+" " + token);
	if((req.protocol+"://"+req.get('host'))==("http://"+host) && req.query.token !== undefined) {
		if(req.query.token==token) 		//res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
			res.render('forgotPassword/reset.ejs',{'token':token});
		else {
			req.flash ('msg', "Bad Request");
			res.render ('flashmsg.ejs', {
			color: '#C73C3C',
			message: req.flash ('msg')
			})
		}
	} else {
		req.flash('msg',"Request from unknown source");
		res.render ('flashmsg.ejs', {
			color: '#C73C3C',
			message: req.flash ('msg')
		})
	} 
})


app.post('/reset', function (req,res) {
	User.findOne({'local.resetPasswordToken':req.query.token}, function(err,user){
		if (!user) {
			res.render('forgotPassword/reset.ejs', {message: req.flash("No user found")});
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
		res.render('signup.ejs', {message: req.flash ('signupMessage', 'Error. Try again')});
	} else {
		req.flash('msg', 'Email sent to '+req.user.local.email+ " for confirmation");
		res.render('flashmsg.ejs', {
			color: '#26B275',
			message: req.flash('msg')
		});
	}
	});
});

app.get('/verify',function(req,res){
if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
	if(req.query.id==rand) 		//res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
		res.render('emailconfirm.ejs', {message: req.flash ('signupMessage')});
	else 
		res.render('emailconfirm.ejs', {message: req.flash('signupMessage', "Bad Request")});
	
} else 
	res.render('emailconfirm.ejs', {message: req.flash('signupMessage', "Request is from unknown source")});
});


//============================CONTENT============================
app.get('/content', isLoggedIn, function (req,res) {
	res.render('content.ejs'); //check if need to send variables
});

//============================CONTENT SECTION============================
//reg exp to recognize id in url
var count;
var all_Num = 8; //number of sections
app.get('/contentsection/:id([0-9]*)/', isLoggedIn, function(req,res) {
	initDisable();
	count = req.params.id;
	disableArray[0] = "active";
	res.render ('contentsection.ejs',{
		sectionNum: count,
		disable: disableArray,
	});
});

//array of booleans to disable sections in navbar
var disableArray = {};

function initDisable () {
	for (var i = 0; i < 8; i++) {
		disableArray[i] = "disabled";
	}
}

//TODO disable pages, that user doesn't have access to by passing a variable?
//reset active-disable nav links
app.post('/contentsection', isLoggedIn, disableNav, function (req,res) {

})


function disableNav () {
	count++
	disableArray[count] = "active";//set new section to active
}

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
//route middleware to make sure user is logged in
function isLoggedIn (req,res,next) {
	//if user auntheticated in sesh, carry on
    if (req.isAuthenticated ())
    	return next();

    //if not redirect them to home page
    res.redirect('/');
};
}