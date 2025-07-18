
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  fullname: { type: String, required: true, maxlength: 30 },
  email: { type: String, required: true },
  phonenumber: { type: String, required: true },
  description: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

const contactmodel = mongoose.model("Contact", contactSchema);
module.exports={
    contactmodel
}
