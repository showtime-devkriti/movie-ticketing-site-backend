const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;

const screenschema = new Schema({
  movieid: { type: ObjectId, ref: "movies", required: true },
  theatreid: { type: ObjectId, ref: "admin", required: true },
  timings: [Date],
  days: [String]
}, { timestamps: true });

const screenmodel = mongoose.model("screens", screenschema);
module.exports = { screenmodel };

// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const { ObjectId } = Schema.Types;

// const screenschema = new Schema({
//   movieid: { type: ObjectId, ref: "movies", required: true },
//   theatreid: { type: ObjectId, ref: "admin", required: true },
//   timings: [Date],
//   days: [String]
// }, { timestamps: true });

// const screenmodel = mongoose.model("screenmodel", screenschema);
// module.exports = { screenmodel };
