
const mongoose = require("mongoose");
const { ALLOWED_CITIES } = require("../constants/cities");
const { Schema } = mongoose;;
const { boolean } = require("zod/v4");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  theatre: {
    type: ObjectId,
    ref: "Theatre"
  }
});



const userschema = new Schema({
  email: { type: String, unique: true },
  password: String,
  fullname: String,
  username: { type: String, unique: true },
  phonenumber: { type: String, unique: true },
   location: {
    type: String,
    enum: ALLOWED_CITIES,
    required: true
  },

  bookingHistory: [{
    movieId: mongoose.Schema.Types.ObjectId,
    theatreId: mongoose.Schema.Types.ObjectId,
    showtime: Date,
    seats: [String],
    ticketType: String,
    price: Number,
    bookingDate: Date
  }],
  friends: [{ type: ObjectId, ref: "User" }],
  reviews: [
    {
      movieId: { type: ObjectId, ref: "Movie" },
      rating: Number,
      reviewText: String,
      createdAt: { type: Date, default: Date.now }
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
// const screenschema = new Schema({
//   movieId: { type: ObjectId, ref: "Movie" },
//   format: { type: String, enum: ['2D', '3D', 'IMAX'] },//2d/3d/
//   timings: [String],
//   theatreId: { type: ObjectId, ref: "Admin" }



// })

const usermodel = mongoose.model("users", userschema);
const adminmodel = mongoose.model("Admin", adminschema);
// const screenmodel = mongoose.model("Screen", screenschema)
module.exports = {
  usermodel,
 
  adminmodel,
  // screenmodel
}

