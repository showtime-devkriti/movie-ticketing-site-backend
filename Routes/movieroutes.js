const Router = require("express");
const movierouter = Router();
const {getallmovies}=require("../controllers/moviecontroller")

movierouter.get("/allmovies",getallmovies);


