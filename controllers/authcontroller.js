const { usermodel } = require("../config/db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");
const { usermiddleware } = require("../middlewares/authmiddleware");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const authmiddleware = require("../middlewares/authmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");

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
    fullname: z.string().max(30),
    location:z.enum(ALLOWED_CITIES)
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
  if (passwordmatch) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_USER_PASS, { expiresIn: "7d" }
    );
    res.json({
      token: token,
    });
  } else {
    res.status(403).json({
      msg: "incorrect credentials",
    });
  }
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
module.exports = {
  userlogin,userregister
};
