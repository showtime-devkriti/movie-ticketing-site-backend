const Router=require("express");
const userrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware");
const { usermodel } = require("../config/db");

userrouter.get("/myprofile",usermiddleware,async function(req,res){
    try{
        const user =await usermodel.findById(req.user.id).select("-password -_v");
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.json({
            state:"success",
            user
        })
    }catch(err){
        res.status(500).json({message:"Failed to fetch the data"})
    }


    
})
module.exports = { userrouter: userrouter };