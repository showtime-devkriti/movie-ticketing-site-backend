const Router=require("express");
const userrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware");
const {userprofile,userbookings}=require("../controllers/usercontroller")


userrouter.get("/myprofile",usermiddleware,userprofile)
userrouter.get("/yourbookings",usermiddleware,userbookings)

module.exports = { userrouter: userrouter };