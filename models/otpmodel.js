const mongoose = require("mongoose");
const { Schema } = mongoose;


const otpSchema = new Schema({
  email: String,
  phonenumber: String,
  otp: String,
  expiresAt: Date
});

const otpmodel = mongoose.model("OTP", otpSchema);
module.exports={
    otpmodel
}