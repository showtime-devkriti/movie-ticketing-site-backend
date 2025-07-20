const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;
const { z } = require("zod");



const showtimeschema=new Schema({
    movieid:{type:String,required:true},
    movietitle:{type:String},
    genre:[{type:String}],
     theatreid: { type:ObjectId, ref: "admins", required: true },
     language:{type:String},
     starttime:{type:Date,required:true},
     format:{type:String,enum:["2D","3D","IMAX"],required:true},
     screenid:{type:ObjectId,ref: "screens",required:true},
     availableseats: [String],
       seatpricing: {
    type: Map,
    of: Number,
    required: true
  }


},{timestamps:true})





const showtimevalidation = z.object({
  movieid: z.string(),
  language: z.string().min(1, "Language is required"),
  starttime: z.coerce.date().refine(date => !isNaN(date.getTime()), {
    message: "Invalid start time format"
  }).refine(
    (date) => date >= new Date(),
    { message: "Start time cannot be in the past" }
  ),
  format: z.enum(["2D", "3D", "IMAX"]),

 price: z.record(z.string(), z.number().positive()) 
});


const showtimemodel = mongoose.model("showtimes", showtimeschema);
module.exports = { showtimemodel,showtimevalidation };
// showtimeschema.index({ screenid: 1, starttime: 1 }, { unique: true });
