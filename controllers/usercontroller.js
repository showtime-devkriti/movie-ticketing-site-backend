const { usermodel } = require("../config/db");

const userprofile=async function(req,res){
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


    
}

const userbookings=async function(req,res){
    const userid=req.user.id
    try {
        const user=await usermodel.findById(userid);
        if(!user){
            res.status(404).json({
                message:"user not found"
            })
        }
        const bookinghistory=user.bookinghistory
        res.status(200).json({
            bookinghistory
        })



        
    } catch (err) {
      console.error("error:", err);
      return res.status(500).json({
        message:"error while fetching bookings"
      })
        
    }
}
module.exports={
    userprofile,userbookings
}