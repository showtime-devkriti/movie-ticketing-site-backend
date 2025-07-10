const Router = require("express");
const { optionalauthmiddleware } = require("../middlewares/userlogincheckmiddleware");
const additionalrouter = Router();
const {Homepage}=require("../controllers/othercontroller")


additionalrouter.get("/",optionalauthmiddleware,Homepage)






module.exports={
    additionalrouter
}