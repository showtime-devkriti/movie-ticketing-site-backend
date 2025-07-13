const {bookingmodel}=require("../models/bookingmodel")
const {showtimemodel}=require("../models/showtimemodel")
const {screenmodel}=require("../models/screenmodel")
const {razorpay}=require("../constants/razorpay")
const crypto=require("crypto")
require('dotenv').config();

const bookingticket=async function(req,res){
    const showtimeid=req.params.showtimeid;
    const { seats, tickettype } = req.body;
     if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ msg: "No seats selected" });
  }
 const userId = req.user.id;

    const showtime = await showtimemodel.findById(showtimeid);
if (!showtime) return res.status(404).json({ msg: "Showtime not found" });
 
const screen = await screenmodel.findById(showtime.screenid);
  if (!screen) return res.status(404).json({ msg: "Screen not found" });

  const seatMap = {};
  for (const seat of screen.seats) {
    seatMap[seat.seatid] = seat.seatClass;
  }

  const alreadyBooked = [];
  for (const s of seats) {
    if (!showtime.availableseats.includes(s)) alreadyBooked.push(s);
  }
  if (alreadyBooked.length > 0) {
    return res.status(409).json({ msg: "Some seats already booked", alreadyBooked });
  }
  let total = 0;
for (const s of seats) {
  const category = seatMap[s];
  if (!category) {
    return res.status(400).json({ msg: `Invalid seat ID: ${s}` });
  }
  const price = showtime.seatpricing[category];
  if (!price) {
    return res.status(400).json({ msg: `No price set for seat class: ${category}` });
  }
  total += price;
}

  const booking = await bookingmodel.create({
    user: userId,
    showtime: showtimeid,
    theatre: showtime.theatreid,
    movie: showtime.movieid,
    seats,
    totalprice: total,
    tickettype,
    paymentstatus: "pending"
  });
   showtime.availableseats = showtime.availableseats.filter(s => !seats.includes(s));
  await showtime.save();

  return res.status(201).json({
    msg: "Booking successful",
    booking
  });


}
const getSeatLayoutForShowtime=async function(req,res){
    const showtimeid = req.params.showtimeid;
    try {

         const showtime = await showtimemodel.findById(showtimeid);
    if (!showtime) {
      return res.status(404).json({ msg: "Showtime not found" });
    }
const screen = await screenmodel.findById(showtime.screenid);
    if (!screen) {
      return res.status(404).json({ msg: "Screen not found" });
    }

    const seatStatus = screen.seats.map(seat => ({
      seatid: seat.seatid,
      row: seat.row,
      column: seat.column,
      seatClass: seat.seatClass,
      status: showtime.availableseats.includes(seat.seatid)
        ? "available"
        : "booked"
    }));
     return res.status(200).json({
      screenid: screen._id,
      showtimeid: showtime._id,
      seatLayout: seatStatus
    });

        
    } catch (error) {
        console.error("Error fetching seat layout:", error.message);
    return res.status(500).json({ msg: "Internal server error" });
        
    }
}
const createorder=async function(req,res){

  



  try {
    const options =req.body
    
    const order = await razorpay.orders.create(options);
    if(!order){
      return res.status(500).json({
        message:"order is empty"
      })
    }
    return res.status(200).json(order);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }

}
const validation=async function(req,res){
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body
  const sha=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
  const digest =sha.digest("hex");
  console.log(digest)
  console.log(razorpay_signature)
  if(digest!==razorpay_signature){
    return res.status(400).json({
      msg:"Transaction is not legit"

    })
  }
  res.json({
    msg:"success",
    orderId:razorpay_order_id,
    paymentId:razorpay_payment_id,
  })
}




module.exports={
    getSeatLayoutForShowtime,bookingticket,createorder,validation
}
