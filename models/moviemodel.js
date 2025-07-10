const mongoose = require("mongoose");
const { Schema } = mongoose;

const movieschema = new Schema({
    imdbid:{
        type:String,
        required:true,
        unique:true
    },
  title: {
    type: String,
    required: true,
    unique:true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  Review: String,
  genre: [String],
  languages: [String],
  description: String,
  cast: [String],
  crew: [String],
  trailerurl: {
    type: String
  }, 
  posterurl: {
    type: String // from TMDB: `https://image.tmdb.org/t/p/w500${data.poster_path}`
  },
  backdropurl: {
    type: String // from TMDB: `https://image.tmdb.org/t/p/original${data.backdrop_path}`
  },
  runtime: {
    type: Number // from TMDB
  },
  releaseDate: {
    type: Date // from TMDB: data.release_date
  },
  adult: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number
  },
  format: [{ type: String, enum: ['2D', '3D', 'IMAX'] }],
  reviews: [
    {
      userid: { type: Schema.Types.ObjectId, ref: "users" },
      reviewText: String,
      rating: { type: Number, min: 1, max: 5 },
      createdat: { type: Date, default: Date.now }
    }
  ]


}, { timestamps: true })
const moviemodel = mongoose.model("movies", movieschema);

module.exports={
    moviemodel
}