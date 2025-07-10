const mongoose = require("mongoose");
const { Schema } = mongoose;
const {ObjectId}=mongoose.Schema.Types;


const paymentschema = new Schema({
  user: { type: ObjectId, ref: 'users' },
  amount: Number,
  status: { type: String, enum: ['success', 'failed', 'pending'] },
  method: String,
  timestamp: { type: Date, default: Date.now },
  booking: { type: ObjectId, ref: 'bookings' }
});

const paymentmodel = mongoose.model("payments", paymentschema);

module.exports={
    paymentmodel

}

// const seatschema = new Schema({
//   screenid: { type: ObjectId, ref: "screens", required: true },
//   layout: [[String]] // 2D array for rows and seat labels
// });

// const seatmodel = mongoose.model("seats", seatschema);
// const notificationschema = new Schema({
//   user: { type: ObjectId, ref: 'users' },
//   message: String,
//   read: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });
