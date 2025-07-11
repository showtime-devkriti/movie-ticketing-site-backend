const {bookingmodel}=require("../models/bookingmodel")
const {showtimemodel}=require("../models/showtimemodel")
const {screenmodel}=require("../models/screenmodel")

const bookingticket=async function(req,res){
    const showtimeid=req.params.showtimeid;

    const showtime = await showtimemodel.findById(showtimeid);
if (!showtime) return res.status(404).json({ msg: "Showtime not found" });


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
module.exports={
    getSeatLayoutForShowtime
}
// const bookingticket = async function(req, res) {
//   const showtimeid = req.params.showtimeid;
//   const { seats, tickettype } = req.body;

//   if (!Array.isArray(seats) || seats.length === 0) {
//     return res.status(400).json({ msg: "No seats selected" });
//   }

//   const userId = req.user.id;

//   const showtime = await showtimemodel.findById(showtimeid);
//   if (!showtime) return res.status(404).json({ msg: "Showtime not found" });

//   const screen = await screenmodel.findById(showtime.screenid);
//   if (!screen) return res.status(404).json({ msg: "Screen not found" });

//   // ✅ Map seatId to class
//   const seatMap = {};
//   for (const seat of screen.seats) {
//     seatMap[seat.seatid] = seat.seatClass;
//   }

//   // ✅ Check seat availability
//   const alreadyBooked = [];
//   for (const s of seats) {
//     if (!showtime.availableseats.includes(s)) alreadyBooked.push(s);
//   }
//   if (alreadyBooked.length > 0) {
//     return res.status(409).json({ msg: "Some seats already booked", alreadyBooked });
//   }

//   // ✅ Calculate total price
//   let total = 0;
//   for (const s of seats) {
//     const category = seatMap[s];
//     const price = showtime.seatpricing[category];
//     total += price;
//   }

//   const booking = await bookingmodel.create({
//     user: userId,
//     showtime: showtimeid,
//     theatre: showtime.theatreid,
//     movie: showtime.movieid,
//     seats,
//     totalprice: total,
//     tickettype
//   });

//   // ✅ Remove booked seats from availability
//   showtime.availableseats = showtime.availableseats.filter(s => !seats.includes(s));
//   await showtime.save();

//   return res.status(201).json({
//     msg: "Booking successful",
//     booking
//   });
// };
