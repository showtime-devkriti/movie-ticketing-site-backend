const Router = require("express");
const bookingrouter = Router();
const {usermiddleware}=require("../middlewares/authmiddleware")
const {getSeatLayoutForShowtime}=require("../controllers/bookingcontroller")
bookingrouter.get("/:showtimeid",usermiddleware,getSeatLayoutForShowtime)





module.exports={
    bookingrouter
}