const jwt = require("jsonwebtoken")
const {JWT_USER_PASS}=require("../store")


function optionalauthmiddleware(req,res,next){
     const authheader= req.headers.authorization;
   
    if(!authheader||!authheader.startsWith("Bearer ")){
       req.check=false;
      return next();
    }
    const token = authheader.split(" ")[1];
    try{
         const decode = jwt.verify(token,JWT_USER_PASS)
         req.user=decode;
         req.check=true;
        

    }catch(e){
         req.check=false;
      }
    next();
    

}

module.exports={
    optionalauthmiddleware
}