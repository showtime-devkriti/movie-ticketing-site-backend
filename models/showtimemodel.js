const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;

const showtimeschema=new Schema({
    movieid:{type:ObjectId,ref:"movies",required:true},
     theatreid: { type:ObjectId, ref: "admin", required: true },
     starttime:{type:Date,required:true},
     format:{type:String,enum:["2D","3D","IMAX"],required:true},
     screen:{type:String,required:true},
     price:{type:Number,required:true},
     availableseats:[String]


},{timestamps:true})
const showtimemodel = mongoose.model("showtimes", showtimeschema);
module.exports = { showtimemodel };