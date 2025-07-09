const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;
const { z } = require("zod");



const showtimeschema=new Schema({
    movieid:{type:ObjectId,ref:"movies",required:true},
     theatreid: { type:ObjectId, ref: "admin", required: true },
     language:{type:String},
     starttime:{type:Date,required:true},
     format:{type:String,enum:["2D","3D","IMAX"],required:true},
     screenid:{type:ObjectId,required:true},
     price:{type:Number,required:true},
     availableseats:[String]


},{timestamps:true})





const showtimevalidation = z.object({
  movieid: z.string().length(24, "Invalid movie ID"), // MongoDB ObjectId
  language: z.string().min(1, "Language is required"),
  starttime: z.coerce.date().refine(date => !isNaN(date.getTime()), {
    message: "Invalid start time format"
  }).refine(
    (date) => date >= new Date(),
    { message: "Start time cannot be in the past" }
  ),
  format: z.enum(["2D", "3D", "IMAX"]),
  screenid: z.string().length(24, "Invalid screen ID"),
  price: z.number().positive("Price must be a positive number"),
  availableseats: z.array(z.string())
});

const showtimemodel = mongoose.model("showtimes", showtimeschema);
module.exports = { showtimemodel,showtimevalidation };
// showtimeschema.index({ screenid: 1, starttime: 1 }, { unique: true });
