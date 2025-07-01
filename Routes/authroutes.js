const Router = require("express");
const authrouter = Router();
const { usermodel } = require("../config/db");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");
const { usermiddleware } = require("../middlewares/authmiddleware");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const authmiddleware = require("../middlewares/authmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");

authrouter.post("/register", async function (req, res) {
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
    const firstError = parsed.error.issues[0];
    res.status(400).json({
      msg: firstError.message || "Invalid input",
    });
    return;
  }

  const { email, password, phonenumber, fullname, username } = req.body;
  const existingEmail = await usermodel.findOne({ email });
  if (existingEmail) {
    return res.status(409).json({ msg: "Email already registered" });
  }


  const existingPhone = await usermodel.findOne({ phonenumber });
  if (existingPhone) {
    return res.status(409).json({ msg: "Phone number already registered" });
  }

  const existingUsername = await usermodel.findOne({ username });
  if (existingUsername) {
    return res.status(409).json({ msg: "Username already taken" });
  }
  let errorthrown = false;
  try {
    const hashedpassword = await bcrypt.hash(password, 5);
    await usermodel.create({
      email: email,
      password: hashedpassword,
      fullname: fullname,
      phonenumber: phonenumber,
      username: username,
    });
  } catch (e) {
    res.status(409).json({
      message: "user already exists",
    });
    errorthrown = true;
  }

  if (!errorthrown) {
    res.status(201).json({
      message: "signup succeeded",
    });
  }
});

authrouter.post("/login", async function (req, res) {
  const { check, password } = req.body;
  let user = await usermodel.findOne({
    email: check,
  });

  if (!user) {
    user = await usermodel.findOne({
      phonenumber: check,
    });
  }

  if (!user) {
    user = await usermodel.findOne({
      username: check,
    });
  }

  if (!user) {
    res.status(404).json({
      msg: "user with the given credentials does not exist",
    });
    return;
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
});

module.exports = {
  authrouter,
};
