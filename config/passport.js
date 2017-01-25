//load what we need
//methods of logging in are strategies
var LocalStrategy = require ('passport-local').Strategy;
var User = require ('../app/models/user')


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
    	usernameField : 'email',
    	passwordField : 'password',
    	passReqToCallback : true, //pass back entire request to callback
    },

    function (req,email,password,done) {
    	//asynchronous
    	//User.findOne won't fire unless data is sent back
    	process.nextTick(function () {
    		//find user with same email as forms email
    		//see if user trying to login already exists
    		User.findOne({'local.email':email}, function (err,user) {
    			if(err) 
    				return done (err);

    			//check if there's already user with this email
    			if (user) {
    				return done(null,false,req.flash('signupMessage','email is already taken'));
    			} else {
    				//if no user with email create user
    				var newUser = new User();
                        // set the user's local credentials
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
    		})
    	})
    })) 
     
      // =========================================================================
        // LOCAL LOGIN =============================================================
        // =========================================================================
        // we are using named strategies since we have one for login and one for signup
        // by default, if there was no name, it would just be called 'local'

        passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));


      // =========================================================================
      // LOCAL CHANGE PASSWORD =============================================================
        // =========================================================================
    passport.use('local-changepassword', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            //usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },


        function(req, password, done) { // callback with email and password from our form
            console.log("hey i work");
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.password' :  password }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('changePasswordMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('changePasswordMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }));
};

