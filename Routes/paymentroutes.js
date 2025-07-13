const Router = require("express");
const { usermiddleware } = require("../middlewares/authmiddleware");
const { createorder, validation } = require("../controllers/bookingcontroller");
const paymentrouter = Router();

paymentrouter.post("/create-order",createorder)
paymentrouter.post("/validate",validation)








module.exports={
    paymentrouter
}