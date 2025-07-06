const Router = require("express");
const authrouter = Router();
const { userregister, userlogin } = require("../controllers/authcontroller");
authrouter.post("/register", userregister);
authrouter.post("/login", userlogin);


module.exports = {
authrouter
};