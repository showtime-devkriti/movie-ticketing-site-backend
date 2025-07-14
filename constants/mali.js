const nodemailer = require("nodemailer");
require("dotenv").config(); // MUST come before anything else


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,    
    pass: process.env.MAIL_PASS      
  }
});

module.exports = {transporter};
