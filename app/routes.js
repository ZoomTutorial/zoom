module.exports = function (app,passport) {


//============================HOME PAGE============================
app.get('/', function (req,res) {
	res.render ('/views/index.handlebars'); //TODO load handlebars index templ
});



//============================LOGIN============================
app.get('/login', function (req,res) {
		//render page and pass flash data if exists
		res.render('login.handlebars', {
			message: req.flash ('loginMessage')});
});
//app.post('/login',do passport stuff here)



//============================SIGN UP============================
app.get('/signup', function (req,res) {
	//render page and pass flash data if exists
	res.render('signup.handlebars', {message: req.flash ('signupMessage')});
});

//
//signup form
//app.post ('/signup', do all passport stuff)



//============================MY ACCOUNT============================
//protected so you have to be logged in to visit
//route middleware to verify
app.get('/account', isLoggedIn, function (req,res) {
	res.render('account.handlebars', {
		user : req.user //get user our of sesh and pass to template
	})
})



//============================CONTENT============================
app.get('/content', function (req,res) {
	res.render('content.handlebars'); //check if need to send variables
});



//============================QUIZZ============================
app.get('/quizz', function (req,res) {
	res.render('quizz.handlebars'); //check if pass in variables
});



//============================PROGRESS============================
app.get('/progress', isLogeedIn, function (req,res) {
	res.render ('progress.handlebars'); //check if pass in var
});



//============================COURSE COMPLETE============================
app.get('/coursepass', isLoggedIn, function (req,res) {
	res.render('coursepass.handlebars');//check if pass in var
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