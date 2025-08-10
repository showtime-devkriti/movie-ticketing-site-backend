const Router = require("express");
const authrouter = Router();
const nodemailer=require("nodemailer");

const { userregister, userlogin ,uservalidation, forgotpassword, verifyresettoken, resetpassword,verifyOTP} = require("../controllers/authcontroller");
authrouter.post("/register", userregister);
authrouter.post("/login", userlogin);
authrouter.get("/validate",uservalidation)
authrouter.post("/forgotpassword",forgotpassword)
authrouter.post("/verifytoken",verifyresettoken)
authrouter.post("/resetpassword",resetpassword)
authrouter.post("/verifyOTP",verifyOTP);




module.exports = {
authrouter
};