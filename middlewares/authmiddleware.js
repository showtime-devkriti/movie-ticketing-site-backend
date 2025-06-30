const jwt = require("jsonwebtoken")
const {JWT_USER_PASS}=require("../store")


function usermiddleware(req,res,next){
     const token= req.headers.token;
    const decode = jwt.verify(token,JWT_USER_PASS)
    if(decode){
        req.userid =decode.id;
        next();

    }else{
        res.status(403).json({
            msg:"you have not signed in"
        })
    }
    

}

module.exports={
    usermiddleware:usermiddleware
}