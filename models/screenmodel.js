const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;

const screenschema = new Schema({
  movieid: { type: ObjectId, ref: "Movie" },
  timings: [Date],
  theatreid: { type: ObjectId, ref: "Admin" },
  days:[String]



})
const screenmodel = mongoose.model("Screen", screenschema)
module.exports={
    screenmodel
}