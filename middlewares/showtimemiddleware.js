
const {showtimevalidation}=require("../models/showtimemodel")


function showtimemiddleware(req,res,next){
    const parsed = showtimevalidation.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ msg: parsed.error.issues[0].message });
}
req.body=parsed.data
next();





}

module.exports={
    showtimemiddleware
}