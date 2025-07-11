const Router = require("express");
const { optionalauthmiddleware } = require("../middlewares/userlogincheckmiddleware");
const additionalrouter = Router();
const {Homepage,searchHandle}=require("../controllers/othercontroller")


additionalrouter.get("/home",optionalauthmiddleware,Homepage)
additionalrouter.get("/search",searchHandle)






module.exports={
    additionalrouter
}