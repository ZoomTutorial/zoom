module.exports = function (app,passport) {


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
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


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



//============================QUIZZ============================
app.get('/quizz', function (req,res) {
	res.render('quizz.ejs'); //check if pass in variables
});



//============================PROGRESS============================
app.get('/progress', isLoggedIn, function (req,res) {
	res.render ('progress.ejs'); //check if pass in var
});



//============================COURSE COMPLETE============================
app.get('/coursepass', isLoggedIn, function (req,res) {
	res.render('coursepass.ejs');//check if pass in var
});



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