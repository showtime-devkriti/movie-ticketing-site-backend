
const mongoose = require("mongoose");
const { ALLOWED_CITIES } = require("../constants/cities");
const { Schema } = mongoose;;
const { boolean } = require("zod/v4");
const { ObjectId } = mongoose.Schema.Types;





const userschema = new Schema({
  email: { type: String, unique: true },
  password: String,
  fullname: String,
  username: { type: String, unique: true },
  phonenumber: { type: String, unique: true },
   location: {
    type: String,
    enum: ALLOWED_CITIES
  },

  bookinghistory: [{
    movieid: mongoose.Schema.Types.ObjectId,
    theatreid: mongoose.Schema.Types.ObjectId,
    showtime: Date,
    seats: [String],
    tickettype: String,
    price: Number,
    bookingdate: Date
  }],
  friends: [{ type: ObjectId, ref: "User" }],
  reviews: [
    {
      movieid: { type: ObjectId, ref: "Movie" },
      rating: Number,
      reviewtext: String,
      createdate: { type: Date, default: Date.now }
    }
  ]





})



const adminschema = new Schema({
  theatretitle: String,
  password:String,
  location: {
    type: String,
    enum: ALLOWED_CITIES,
    required: true
  },
  email1: { type: String, unique: true },
  email2: { type: String, unique: true },
  phone1: { type: String, unique: true },
  phone2: { type: String, unique: true },
  adminusername: { type: String, unique: true },
  paymentregistration: { type: Boolean, default: false },
  screens: [{ type: ObjectId, ref: "Screen" }],






})


const usermodel = mongoose.model("users", userschema);
const adminmodel = mongoose.model("admins", adminschema);

module.exports = {
  usermodel,
 
  adminmodel,
  
}

