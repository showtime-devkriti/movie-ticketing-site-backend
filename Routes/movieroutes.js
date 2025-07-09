const Router = require("express");
const movierouter = Router();
const {getallmovies,getMovieById}=require("../controllers/moviecontroller")
const {optionalauthmiddleware}=require("../middlewares/userlogincheckmiddleware")
const {usermiddleware}=require("../middlewares/authmiddleware")
const {getShowTimes}=require("../controllers/showcontroller")

movierouter.get("/allmovies",optionalauthmiddleware,getallmovies);

 
movierouter.get("/:id/showtimes",usermiddleware,getShowTimes)
movierouter.get("/:id",getMovieById);


module.exports={
    movierouter
}