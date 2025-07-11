const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");

function optionalauthmiddleware(req, res, next) {
  const authheader = req.headers.authorization;

  if (!authheader || !authheader.startsWith("Bearer ")) {
    req.check = false;
    return next();
  }

  const token = authheader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_USER_PASS);
    req.user = decoded;
    req.check = true;
  } catch (e) {
    console.error("JWT verification failed:", e.message);
    req.check = false;
  }

  next();
}

module.exports = {
  optionalauthmiddleware
};
