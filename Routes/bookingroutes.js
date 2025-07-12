const Router = require("express");
const bookingrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware")
const {getSeatLayoutForShowtime,bookingticket}=require("../controllers/bookingcontroller")
bookingrouter.get("/:showtimeid",usermiddleware,getSeatLayoutForShowtime)
bookingrouter.post("/:showtimeid",usermiddleware,bookingticket)




module.exports={
    bookingrouter
}