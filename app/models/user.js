//load what need
var mongoose = require ('mongoose');
var bcrypt = require ('bcrypt-nodejs');

//define schema for user
var userSchema = mongoose.Schema ({
	local: {
		email: String,
		password: String,
	}
	// facebook: {
	// 	id: String,
	// 	token : String,
	// 	email: String,
	// 	name: String,
	// }
})

///methods
//make hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync (password, bcrypt.genSaltSync (8), null);
};

//check if password valid
userSchema.methods.validPassowrd = function (password) {
	return bcrypt.compareSync (password, this.local.password);
}

//create model for users and expose it to our app
module.exports = mongoose.model ('User', userSchema);