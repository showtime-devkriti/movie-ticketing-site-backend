const Router = require("express");
const authrouter = Router();
const { userregister, userlogin ,uservalidation} = require("../controllers/authcontroller");
authrouter.post("/register", userregister);
authrouter.post("/login", userlogin);
authrouter.get("/validate",uservalidation)


module.exports = {
authrouter
};