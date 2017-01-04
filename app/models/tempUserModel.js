//user model for email verification

// get the credentials from request parameters or something 
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');



var tempUserSchema = User({
    email: email,
    password: password
});
 
nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
    // some sort of error 
    if (err)
        // handle error... 
 
    // user already exists in persistent collection... 
    if (existingPersistentUser)
        // handle user's existence... violently. 
 
    // a new user 
    if (newTempUser) {
        var URL = newTempUser[nev.options.URLFieldName];
        nev.sendVerificationEmail(email, URL, function(err, info) {
            if (err)
                // handle error... 
 
            // flash message of success 
        });
 
    // user already exists in temporary collection... 
    } else {
        // flash message of failure... 
    }
});

tempUserSchema.methods.generateHash = function(password) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
