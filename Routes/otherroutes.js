const Router = require("express");
const { optionalauthmiddleware } = require("../middlewares/userlogincheckmiddleware");
const additionalrouter = Router();
const {Homepage,searchHandle}=require("../controllers/othercontroller")
const {ismovieonscreen}=require("../controllers/moviecontroller")


additionalrouter.get("/home",optionalauthmiddleware,Homepage)
additionalrouter.get("/search",searchHandle)
additionalrouter.get("/ismovieonscreen",ismovieonscreen)






module.exports={
    additionalrouter
}