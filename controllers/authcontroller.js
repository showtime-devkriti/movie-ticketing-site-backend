const { usermodel } = require("../config/db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");
const { usermiddleware } = require("../middlewares/authmiddleware");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const authmiddleware = require("../middlewares/authmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");
const {transporter} = require("../constants/mali");
const { sendOTP } = require("../constants/twilio");
const userregister= async function (req, res) {
  const requiredbody = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8) 
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/), 
    username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/),
    phonenumber: z.string().regex(/^[6-9]\d{9}$/),
    fullname: z.string().max(30)
    
  });

  const parsed = requiredbody.safeParse(req.body); 

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.issues);
    const firstError = parsed.error.issues[0];
    res.status(400).json({
      msg: firstError.message || "Invalid input",
    });
    return;
  }

  const { email, password, phonenumber, fullname, username } = req.body;
  const conflict = await usermodel.findOne({
$or: [{ email }, { phonenumber }, { username }]
});
if (conflict) {
if (conflict.email === email) {
return res.status(409).json({ msg: "Email already registered" });
} else if (conflict.phonenumber === phonenumber) {
return res.status(409).json({ msg: "Phone number already registered" });
} else {
return res.status(409).json({ msg: "Username already taken" });
}
}
 
  try {
    const hashedpassword = await bcrypt.hash(password, 5);
    await usermodel.create({
      email: email,
      password: hashedpassword,
      fullname: fullname,
      phonenumber: phonenumber,
      username: username,
    });
    return res.status(201).json({ message: "Signup succeeded" });
  } catch (e) {
     console.error("Signup error:", e);
    res.status(500).json({
      message: "Signup failed. Try again.",
    });
    
  }

 
};

const userlogin= async function (req, res) {
    const userloginschema= z.object({
check: z.string().min(3),
password: z.string().min(8)
});
const parsed = userloginschema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ msg: "Invalid login input" });
}
try{
  const { check, password } = req.body;
  let user = await usermodel.findOne({
  $or: [
    { email: check },
    { phonenumber: check },
    { username: check }
  ]
});
  if (!user) {
    return res.status(404).json({
      msg: "user with the given credentials does not exist",
    });
  }

  const passwordmatch = await bcrypt.compare(password, user.password);
  if (!passwordmatch) {
      return res.status(403).json({
        msg: "Incorrect credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_USER_PASS,
      { expiresIn: "7d" }
    );

    // ✅ Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "Strict", // Or "Lax" depending on your frontend
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  return res.status(200).json({
  token,
  status: "success",
  message: "Login successful"
});
}catch (err) {
console.error("Login error:", err);
return res.status(500).json({
message: "Internal server error. Please try again later."
});
}
};

const uservalidation=async function(req,res){
  
   const authheader= req.headers.authorization;
   
    if(!authheader||!authheader.startsWith("Bearer ")){
        return res.status(401).json({ message: "Missing or invalid token" });
    }
    const token = authheader.split(" ")[1];
    try{
         const decode = jwt.verify(token,JWT_USER_PASS)
         req.user=decode;
         return res.status(200).json({
          message:"Valid token"
         })

    }catch(e){
        return res.status(403).json({
            message:"Invalid or expired token"
        })
}}

const forgotpassword=async function(req,res){
  const { method, email, phonenumber } = req.body;
  try {
    let user;

    if (method === "email") {
      if (!email) return res.status(400).json({ message: "Email is required" });
      user = await usermodel.findOne({ email });
    } else if (method === "sms") {
      if (!phonenumber) return res.status(400).json({ message: "Phone number is required" });
      user = await usermodel.findOne({ phonenumber }); 
    } else {
      return res.status(400).json({ message: "Invalid method selected" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   const token = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: "15m" });
 if (method === "email") {
     const resetLink = `http://localhost:5173/reset-password/${token}`;


await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 minutes.</p>`
  });

  return res.status(200).json({ message: "Reset link sent to email" });
}
  if (method === "sms") {
    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);

      const resetMessage = `Reset your password using this token:\n${token}\nToken valid for 15 mins.`;
      await sendOTP(phonenumber, resetMessage);

      return res.status(200).json({ message: "Reset token sent via SMS" });
    }
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyresettoken = async function(req,res){
  const {token}=req.body;
  try {
    const decoded=jwt.verify(token,process.env.JWT_RESET_SECRET);
    
    res.status(200).json({ 
      message: "token verified successfully Now you canenter the new password",
      stateus:"success"

     });
   
    
  } catch (error) {
     console.error("Reset error:", error.message);
     return res.status(400).json({ 
      message: "Invalid or expired token" ,
      stateus:"fail"
    });
    
  }
}


const resetpassword = async function (req, res) {
  const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")})
  const parsed = resetPasswordSchema.safeParse(req.body);

if (!parsed.success) {
  const firstError = parsed.error.issues[0].message;
  console.log(firstError)
  return res.status(400).json({ message: firstError });
}


  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await usermodel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  userlogin,userregister,uservalidation,forgotpassword,verifyresettoken,resetpassword
};
