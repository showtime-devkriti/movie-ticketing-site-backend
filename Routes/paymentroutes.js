const Router = require("express");
const { usermiddleware } = require("../middlewares/authmiddleware");
const {  validation } = require("../controllers/bookingcontroller");
const paymentrouter = Router();


paymentrouter.post("/validate",usermiddleware,validation)








module.exports={
    paymentrouter
}