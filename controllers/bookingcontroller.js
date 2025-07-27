const {bookingmodel}=require("../models/bookingmodel")
const {showtimemodel}=require("../models/showtimemodel")
const {screenmodel}=require("../models/screenmodel")
const {usermodel}=require("../config/db")
const { moviemodel } = require("../models/moviemodel");
const { adminmodel } = require("../config/db");
const { sendTicket } = require("../constants/mali");
const Razorpay = require("razorpay");
const generateTicket = require("../constants/generateticket");
const path = require("path");
const fs = require("fs");
const crypto=require("crypto")
require('dotenv').config();

const initiatebooking=async function(req,res){
    const showtimeid=req.params.showtimeid;
    const { seats, offercoupon } = req.body;
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

 const alreadyBooked = seats.filter(s => !showtime.availableseats.includes(s));
  if (alreadyBooked.length > 0) {
    return res.status(409).json({ msg: "Some seats already booked", alreadyBooked });
  }
  let total = 0;
for (const s of seats) {
  const category = seatMap[s];
  if (!category) {
    return res.status(400).json({ msg: `Invalid seat ID: ${s}` });
  }
 console.log("Showtime ID:", showtime._id);
console.log("Seat Pricing:", showtime.seatpricing);

  const price = showtime.seatpricing.get(category);

  
  if (!price) {
    return res.status(400).json({ msg: `No price set for seat class: ${category}` });
  }
  total += price;
}
 const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const options = {
    amount: total * 100, // in paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };
 try {
   
    
    const order = await razorpay.orders.create(options);
    if(!order){
      return res.status(500).json({
        message:"order is empty"
      })
    }
   return res.status(200).json({
    msg: "Order created successfully",
    order,
    showtimeid,
    seats,
    offercoupon,
    total
  });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
  
 

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
 
const validation=async function(req,res){
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature, showtimeid,
    seats,
   
    total}=req.body
  const sha=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
  const digest =sha.digest("hex");
  // console.log(digest)
  // console.log(razorpay_signature)
  if(digest!==razorpay_signature){
    return res.status(400).json({
      msg:"Transaction is not legit"

    })
  }
  try {
     const userId = req.user.id;
  const showtime = await showtimemodel.findById(showtimeid);
  if (!showtime) return res.status(404).json({ msg: "Showtime not found" });

  const alreadyBooked = seats.filter(s => !showtime.availableseats.includes(s));
  if (alreadyBooked.length > 0) {
    return res.status(409).json({ msg: "Some seats just got booked", alreadyBooked });
  }
  const booking = await bookingmodel.create({
    user: userId,
    showtime: showtimeid,
    theatre: showtime.theatreid,
    movieid: showtime.movieid,
    movietitle:showtime.movietitle,
    runtime:showtime.runtime,
    genre:showtime.genre,
    rating:showtime.rating,
    seats,
    totalprice: total,
 
    paymentstatus: "success",
    razorpay_payment_id,
    razorpay_order_id,
  });
  await usermodel.findByIdAndUpdate(userId, {
  $push: { bookinghistory: booking._id }
});

   showtime.availableseats = showtime.availableseats.filter(s => !seats.includes(s));
  await showtime.save();
    console.log("Booking complete and pushed to history");
   
const theatre = await adminmodel.findById(showtime.theatreid);
    const ticketsDir = path.join(__dirname, "../tickets");
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir);
    }

const ticketPath = path.join(ticketsDir, `ticket-${booking._id}.pdf`);
const bookingData={
  title: showtime.movietitle,
  Poster:showtime.poster,
  language:showtime.language,
  format: showtime.format,
  theatretitle: theatre.theatretitle,
  Address:theatre.address,
  location:theatre.location,
  startTime: showtime.starttime, // or "Screen 1" etc.
  seats,
  quantity: seats.length,
  ticketPrice: total - 75.52, // if you’re subtracting fee
  convenienceFee: 75.52,
  totalAmount: total
}
generateTicket(bookingData, ticketPath);
const user = await usermodel.findById(userId);

await sendTicket({
  to: user.email,
  bookingId: booking._id
});
   res.status(200).json({
    msg: "Payment verified and booking confirmed",
    booking,
    ticketFile: `ticket-${booking._id}.pdf`
  });
    
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:"failed to create a ticket"
    })
    
  }
  
}







module.exports={
    getSeatLayoutForShowtime,initiatebooking,validation
}
// const createorder=async function(req,res){

  



//   try {
//     const options =req.body
    
//     const order = await razorpay.orders.create(options);
//     if(!order){
//       return res.status(500).json({
//         message:"order is empty"
//       })
//     }
//     return res.status(200).json(order);
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ message: "Failed to create Razorpay order" });
//   }

// }// const createorder=async function(req,res){

  



//   try {
//     const options =req.body
    
//     const order = await razorpay.orders.create(options);
//     if(!order){
//       return res.status(500).json({
//         message:"order is empty"
//       })
//     }
//     return res.status(200).json(order);
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ message: "Failed to create Razorpay order" });
//   }

// }
