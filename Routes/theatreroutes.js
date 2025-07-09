const Router = require("express");
const theatrerouter = Router();
const {optionalauthmiddleware}=require("../middlewares/userlogincheckmiddleware")

const {getalltheatres,theatreById}=require("../controllers/Theatrecontroller")

theatrerouter.get("/alltheatres",optionalauthmiddleware,getalltheatres)
theatrerouter.get("/:theatreid/showtimes",theatreById)
module.exports={
    theatrerouter
}