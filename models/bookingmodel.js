const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;

const bookingschema = new Schema({
  user: { type: ObjectId, ref: 'users', required: true },
  showtime: { type: ObjectId, ref: 'showtimes', required: true },
  theatre: { type: ObjectId, ref: 'admins', required: true },

   movieid:{type:String,required:true},
    movietitle:{type:String},
    genre:[{type:String}],
    runtime:{type:Number},
    rating: { type: Number, min: 0, max: 10 },
  seats: [String],
  totalprice: Number,
  offerCoupon: String,
  bookingdate: { type: Date, default: Date.now },
  paymentstatus:{type:String,enum:["pending","success"],default:"pending"}
});

const bookingmodel = mongoose.model("bookings", bookingschema);
module.exports={
    bookingmodel

}