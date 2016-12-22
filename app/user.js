var mongoose = require ('mongoose');
var bcrypt = require ('bcrypt-node.js');

//define schema for user model
var userSchema = mongoose.Scheema ({
	local : {
	email:String;
	password:String;
	},
	// facebook : { //where use facebook?
	// 	id:String,
	// 	token:String,
	// 	email:String,
	// 	name:String,
	// },
	//twitter : {
	// 	id: String,
	// 	token: String,
	// 	email: String,
	// 	name: String,
	// }
	// google: {
	// 	id: String,
	// 	token: 
	// }
})

//functions======================================================
//generate hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync (password, bcrypt.genSaltSync(8), null);
}

//check if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync (password, this.local.password);
}

//create model for users and expose to our app
module.exports = mongoose.model('User', userSchema);