const jwt = require("jsonwebtoken");
const { JWT_USER_PASS } = require("../store");

// function usermiddleware(req, res, next) {
//     const token = req.cookies?.token;  // Read from cookie named 'usertoken'

//     if (!token) {
//         return res.status(401).json({ message: "Missing token in cookies" });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_USER_PASS);
//         req.user = decoded;
//         next();
//     } catch (e) {
//         return res.status(403).json({ message: "Invalid or expired token" });
//     }
// }
function usermiddleware(req,res,next){
      console.log("User middleware triggered");
     const authheader= req.headers.authorization;
   
    if(!authheader||!authheader.startsWith("Bearer ")){
        return res.status(401).json({ message: "Missing or invalid token" });
    }
    const token = authheader.split(" ")[1];
    try{
         const decode = jwt.verify(token,JWT_USER_PASS)
         req.user=decode;
         next();

    }catch(e){
        return res.status(403).json({
            message:"Invalid or expired token"
        })
    }
   
    

}
module.exports={
    usermiddleware
}