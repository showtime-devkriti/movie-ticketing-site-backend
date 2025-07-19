const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;


const seatSchema = new Schema({
  seatid: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: Number, required: true },
  seatClass: {
    type: String,
    required: true
  }
}, { _id: false });


const screenschema = new Schema({
   screenName: { type: String, required: true },
  theatreid: { type: ObjectId, ref: "admins", required: true },
  seats: [seatSchema] ,
  seatStructure: [  
    {
      class: String,
      rows: Number,
      columns: Number,
      totalseats: Number
    }
  ]
}, { timestamps: true });

const screenmodel = mongoose.model("screens", screenschema);
module.exports = { screenmodel };

