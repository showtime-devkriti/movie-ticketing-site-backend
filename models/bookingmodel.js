const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;

const bookingschema = new Schema({
  user: { type: ObjectId, ref: 'users', required: true },
  showtime: { type: ObjectId, ref: 'showtimes', required: true },
  theatre: { type: ObjectId, ref: 'admins', required: true },
  movie: { type: ObjectId, ref: 'movies', required: true },
  seats: [String],
  totalprice: Number,
  tickettype: String,
  bookingdate: { type: Date, default: Date.now },
  paymentstatus:{type:String,enum:["pending","paid"],default:"pending"}
});

const bookingmodel = mongoose.model("bookings", bookingschema);
module.exports={
    bookingmodel

}