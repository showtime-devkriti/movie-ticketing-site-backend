const Router=require("express");
const userrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware");
const {userprofile,userbookings,userlocation}=require("../controllers/usercontroller")


userrouter.get("/myprofile",usermiddleware,userprofile)
userrouter.get("/yourbookings",usermiddleware,userbookings)
userrouter.put("/location",usermiddleware,userlocation)

module.exports = { userrouter: userrouter };