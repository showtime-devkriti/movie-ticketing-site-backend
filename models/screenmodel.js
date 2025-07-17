const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;


const seatSchema = new Schema({
  seatid: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: Number, required: true },
  seatClass: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum', 'Diamond'],
    required: true
  }
}, { _id: false });


const screenschema = new Schema({
   screenName: { type: String, required: true },
  movieid: { type: ObjectId, ref: "movies", required: true },
  theatreid: { type: ObjectId, ref: "admins", required: true },
  timings: [{ type: Date, required: true }],
  days: [{ type: String, required: true }],
  seats: [seatSchema] // ✅ Embedded seat layout for this screen
}, { timestamps: true });

const screenmodel = mongoose.model("screens", screenschema);
module.exports = { screenmodel };

