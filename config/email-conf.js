// email confirmation configuration
nev.configure({
    verificationURL: 'http://myawesomewebsite.com/email-verification/${URL}',
    persistentUserModel: User,
    tempUserCollection: 'myawesomewebsite_tempusers', //?
 
    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'myawesomeemail@gmail.com',
            pass: 'mysupersecretpassword'
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <myawesomeemail_do_not_reply@gmail.com>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
}, function(error, options){
});

// generating the model, pass the User model defined earlier 
nev.generateTempUserModel(User);
 
// using a predefined file 
var TempUser = require('./app/models/user');
nev.configure({
    tempUserModel: TempUser
}, function(error, options){
});