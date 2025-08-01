const Router = require("express");
const adminrouter = Router();
const {adminregister,adminlogin}=require("../controllers/admincontroller");
const {adminmodel}=require("../config/db");
const { adminmiddleware } = require("../middlewares/adminmiddleware");
const { addmovie,addshowtime,addscreen,deleteshowtime,getscreen } = require("../controllers/admincontroller");
const {showtimemiddleware}=require("../middlewares/showtimemiddleware")

adminrouter.post("/register", adminregister);
adminrouter.post("/login", adminlogin);
adminrouter.get("/profile",adminmiddleware,async function(req,res){
 try {
    const admin = await adminmodel
      .findById(req.admin.id)
      .select("-password -__v");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      status: "success",
      admin
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
});
adminrouter.post("/showtime/:screenid",adminmiddleware,showtimemiddleware,addshowtime);
adminrouter.post("/movies",adminmiddleware,addmovie);
adminrouter.post("/screenpost",adminmiddleware,addscreen);
adminrouter.delete("/showtimedelete/:id",adminmiddleware,deleteshowtime);
adminrouter.get("/getscreen",adminmiddleware,getscreen);






module.exports = {
adminrouter
};