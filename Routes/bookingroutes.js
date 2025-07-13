const Router = require("express");
const bookingrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware")
const {getSeatLayoutForShowtime,initiatebooking}=require("../controllers/bookingcontroller")
bookingrouter.post("/create-order/:showtimeid",usermiddleware,initiatebooking)
bookingrouter.get("/:showtimeid",usermiddleware,getSeatLayoutForShowtime)





module.exports={
    bookingrouter
}