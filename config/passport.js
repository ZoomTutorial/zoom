//load what we need
//methods of logging in are strategies
var LocalStrategy = require ('passport-local').Strategy;

//load user model
var User = require ('../app/models/user');

//expose function to app
module.exports = function (passport) {
//============================passport sesh setup============================
//required for persistent login seshs
//serialize and underialize users out of sesh

//serialize user for sesh
passport.serializeUser(function(user,done) {
	done (null,user.id);
});

//deserialize user 
passport.deserializeUser (function (id,done) {
	User.findById(id, function (err,user) {
		done (err, user);
	});
});

//============================LOCAL SIGNUP============================
//use named strategies: one for login and one for signup
passport.use ('local-signup', new LocalStrategy({
	//by default, local strategy uses username and password, we will override with email
	userNameField : 'email',
	passwordField : 'password',
	passReqToCallback : true, //pass back entire request to callback
},

function (req,email,password,done) {
	//asynchronous
	//User.findOne won't fire unless data is sent back
	process.nextTick(function () {
		//find user with same email as forms email
		//see if user trying to login already exists
		User.finOne({'local.email':email}, function (err,user) {
			if(err) 
				return done (err);

			//check if there's already user with this email
			if (user) {
				return done(null,false,req.flash('signupMessage','email is already taken'));
			} else {
				//if no user with email create user
				var newUser = new User();
			}
		})
	})
})) 
}