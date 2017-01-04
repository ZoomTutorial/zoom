// // email confirmation configuration
// module.exports = function (nev, User) {
    
//     //configure options


//     //=========create user model=========
//     // generating the model, pass the User model defined earlier 
//     nev.generateTempUserModel(User);
     

//     //=========hash user password=========
//    User.methods.generateHash = function(User.password) {
//     vat hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// }
module.exports = function () {
 nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "xle2@u.rochester.edu",
        pass: "Apply2usa"
    }
 });
};
