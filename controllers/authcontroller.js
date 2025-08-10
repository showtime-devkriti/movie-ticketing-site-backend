const { usermodel } = require("../config/db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");
const { usermiddleware } = require("../middlewares/authmiddleware");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const authmiddleware = require("../middlewares/authmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");
require("dotenv").config();
const {otpmodel}=require("../models/otpmodel")
const nodemailer = require("nodemailer");



const sendOTP = async (target, via, otp) => {
  if (via === "email") {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: target,
      subject: "Your Verification OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

  } else if (via === "phone") {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    await client.messages.create({
      body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: `+91${target}`,
    });
  }
};

const userregister = async function (req, res) {
  const requiredbody = z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
    username: z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/),
    phonenumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
    fullname: z.string().max(30)
  });

  const parsed = requiredbody.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return res.status(400).json({ msg: firstError.message || "Invalid input" });
  }

  const { email, password, phonenumber, fullname, username } = req.body;

  // Check for existing user
  const conflict = await usermodel.findOne({
    $or: [{ email }, { phonenumber }, { username }]
  });
  if (conflict) {
    if (conflict.email === email) return res.status(409).json({ msg: "Email already registered" });
    if (conflict.phonenumber === phonenumber) return res.status(409).json({ msg: "Phone number already registered" });
    return res.status(409).json({ msg: "Username already taken" });
  }

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP directly
    if (email) {
      await otpmodel.create({
        email,
        phonenumber,
        otp
      })
      await sendOTP(email, "email", otp);
      
    } else if (phonenumber) {
       await otpmodel.create({
        email,
        phonenumber,
        otp
      })
      await sendOTP(phonenumber, "phone", otp);
    } else {
      return res.status(400).json({ msg: "Email or phone is required for OTP" });
    }

    // For now, don’t save user until OTP is verified
    // You might keep this in memory (like Redis) or send back to client for verification
    return res.status(200).json({
      message: "OTP sent. Please verify within 5 minutes.",
      // Only for testing — remove in production
      otp
    });

  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ message: "Signup failed. Try again." });
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
  let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

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

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await otpmodel.create({
        email,
        phonenumber,
        otp
      })
  

 if (method === "email") {



await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: "Password Reset",
       html: `<p>Your OTP is: <b>${otp}</b>. It expires in 15 minutes.</p>`
  });

  return res.status(200).json({ message: "Reset link sent to email" });
}
  if (method === "sms") {
    

      const resetMessage = `Reset your password using this token:\n${token}\nToken valid for 15 mins.`;
     await sendOTP(phonenumber, `Your OTP is: ${otp}. It expires in 15 minutes.`);
      return res.status(200).json({ message: "OTP sent via SMS" });
    }
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyresettoken = async function(req,res){
  const { email, otp } = req.body;
 try {
    const record = await otpmodel.findOne({ email, otp });

    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      await otpmodel.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    await otpmodel.deleteOne({ _id: record._id });
    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "Internal server error" });

  }
}
const verifyOTP = async (req, res) => {
  const { email, phonenumber, otp, password, fullname, username } = req.body;

  const record = await otpmodel.findOne({ 
    $or: [{ email }, { phonenumber }],
    otp
  });

  if (!record) {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ msg: "OTP expired" });
  }

  const hashedpassword = await bcrypt.hash(password, 5);
  await usermodel.create({
    email,
    password: hashedpassword,
    fullname,
    phonenumber,
    username,
  });

  // cleanup otp record
  await otpmodel.deleteOne({ _id: record._id });

  return res.status(201).json({ message: "Signup succeeded" });
};
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
  userlogin,userregister,uservalidation,forgotpassword,verifyresettoken,resetpassword,verifyOTP
};
