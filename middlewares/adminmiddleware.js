const jwt = require("jsonwebtoken")
const {JWT_ADMIN_PASS}=require("../store")


function adminmiddleware(req,res,next){
     const authheader= req.headers.authorization;
   
    if(!authheader||!authheader.startsWith("Bearer ")){
        return res.status(401).json({ message: "Missing or invalid token" });
    }
    const token = authheader.split(" ")[1];
    try{
         const decode = jwt.verify(token,JWT_ADMIN_PASS)
         req.admin=decode;
         next();

    }catch(e){
        return res.status(403).json({
            message:"Invalid or expired token"
        })
    }
   
    

}



module.exports={
    adminmiddleware
}