const Router=require("express");
const userrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware");
const {userprofile,userbookings,userlocation,userlanguage}=require("../controllers/usercontroller")


userrouter.get("/myprofile",usermiddleware,userprofile)
userrouter.get("/yourbookings",usermiddleware,userbookings)
userrouter.put("/location",usermiddleware,userlocation)
userrouter.put("/language",usermiddleware,userlanguage)

module.exports = { userrouter: userrouter };