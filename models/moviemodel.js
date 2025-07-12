const mongoose = require("mongoose");
const { Schema } = mongoose;

const movieschema = new Schema({
  imdbid: { type: String, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  rating: { type: Number, min: 0, max: 10 },
  Review: String,
  genre: [String],
  languages: [String],
  description: String,
  cast: [String],
  crew: [String],
  castDetails: [
    {
      name: String,
      image: String
    }
  ],
  crewDetails: [
    {
      name: String,
      image: String
    }
  ],
  trailerurl: String,
  posterurl: String,
  posterurls: [String],
  backdropurl: String,
  backdropurls: [String],
  logos: [String],
  runtime: Number,
  releaseDate: Date,
  adult: { type: Boolean, default: false },
  popularity: Number,
  format: [{ type: String, enum: ['2D', '3D', 'IMAX'] }],
  reviews: [
    {
      userid: { type: Schema.Types.ObjectId, ref: "users" },
      reviewText: String,
      rating: { type: Number, min: 1, max: 5 },
      createdat: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const moviemodel = mongoose.model("movies", movieschema);

module.exports={
    moviemodel
}