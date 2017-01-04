//create SMTP transport that sends email 
module.exports = function () {
 nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "xle2@u.rochester.edu",
        pass: "Apply2usa"
    }
 });
};
