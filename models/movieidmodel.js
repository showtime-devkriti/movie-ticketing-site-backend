const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;


const movieidschema=new Schema({
    movieid:{type:String,required:true}

})
const movieidmodel = mongoose.model("movieid", movieidschema);
module.exports={
    movieidmodel
}