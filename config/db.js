const { ObjectId } = require("bson");
const mongoose = require("mongoose"); 
const { ALLOWED_CITIES } = require("../constants/cities");
const {Schema}=require("mongoose");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  theatre: {
    type: ObjectId,
    ref: "Theatre"
  }
});



const userschema= new Schema({
    email:{type:String,unique:true},
    password:String,
    fullname:String,
    username:{type:String,unique:true},
    phonenumber:String,
    location: {
    type: String,
    enum: ALLOWED_CITIES,
    required: true
  },
    bookingHistory: [ {
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
const movieschema= new Schema({
     title: {
    type: String,
    required: true
  },
   rating: {
    type: Number,
    min: 0,
    max: 10
  },
    Review:String,
    genre:[String],
    languages:[String],
    cast:[String],
    crew:[String],
     trailerUrl: {
    type: String
  }, format: [String],
  reviews: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      reviewText: String,
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ]


},{ timestamps: true })

const usermodel =mongoose.model("users",userschema);
module.exports={
    usermodel,
    movieschema
}