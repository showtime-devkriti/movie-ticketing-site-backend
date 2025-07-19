const { usermodel } = require("../config/db");
const { z } = require("zod")
const { ALLOWED_CITIES } = require("../constants/cities");
const {ALLOWED_LANGUAGES}=require("../constants/languages");
const { bookingmodel } = require("../models/bookingmodel");
const {showtimemodel}=require("../models/showtimemodel")
const {contactmodel}=require("../models/contactmodel")
const {transporter} = require("../constants/mali");
const { sendOTP } = require("../constants/twilio");
const userprofile = async function (req, res) {
    try {
        const user = await usermodel.findById(req.user.id).select("-password -_v");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json({
            state: "success",
            user
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch the data" })
    }



}

const userbookings = async function (req, res) {
    const userid = req.user.id
    try {
       const user = await usermodel.findById(userid)
  .populate({
    path: "bookinghistory",
    populate: [
      { path: 'movie', select: 'title posterurl' },
      { path: 'theatre', select: 'theatretitle location' },
      { path: 'showtime',select :'starttime seats'}
    ]
  });

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

return res.status(200).json({
  bookinghistory: user.bookinghistory
});





    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "error while fetching bookings"
        })

    }
}

const userlocation = async function (req, res) {
    const userid = req.user.id;
    const locationschema = z.object({
        location: z.enum(ALLOWED_CITIES)

    })
    const parsed = locationschema.safeParse(req.body)
    if (!parsed.success) {
        console.log("Validation error:", parsed.error.issues);
        const firstError = parsed.error.issues[0];
        res.status(400).json({
            msg: firstError.message || "Invalid input",
        });
        return;
    }
    const { location } = parsed.data;
    try {
        const user = await usermodel.findById(userid)
        if (!user) {
            return res.status(404).json({
                message: "Invalid userID"
            })
        }
        user.location = location;
        await user.save();
        return res.status(200).json({
            message: "Location updated successfully",
            location: user.location,
        });

    } catch (error) {
        console.error("Error updating location:", error.message);
        return res.status(500).json({
            message: "Failed to update location",
        });
    }

}

const userlanguage=async function(req,res){
    const userid=req.user.id;
    const languageschema = z.object({
        language: z.enum(ALLOWED_LANGUAGES)

    })
      const parsed = languageschema.safeParse(req.body)
    if (!parsed.success) {
        console.log("Validation error:", parsed.error.issues);
        const firstError = parsed.error.issues[0];
        return res.status(400).json({
            msg: firstError.message || "Invalid input",
        });
        
    }
     const { language } = parsed.data;
      try {
        const user = await usermodel.findById(userid)
        if (!user) {
            return res.status(404).json({
                message: "Invalid userID"
            })
        }
        user.language = language;
        await user.save();
        return res.status(200).json({
            message: "language updated successfully",
           language:user.language
        });

    } catch (error) {
        console.error("Error updating language:", error.message);
        return res.status(500).json({
            message: "Failed to update language",
        });
    }


}

const cancelbooking=async function(req,res){
     const userId = req.user.id;
    const bookingId = req.params.bookingid;
    try {
        console.log(bookingId)
        const booking =await bookingmodel.findById(bookingId).populate("showtime")
        if(!booking){
            return res.status(404).json({
                message :"Booking not found"
            })
        }
      
        const user=await usermodel.findById(userId);
          console.log(user.bookinghistory)
         const hasBooking = user.bookinghistory.map(id => id.toString()).includes(bookingId);
        if (!hasBooking) {
            return res.status(403).json({ message: "Unauthorized cancellation" });
        }
        const showtime=booking.showtime;
        const starttime=new Date(showtime.starttime);
        const now = new Date();
        const diffinms=starttime-now
        const diffinhours=diffinms/(1000*60*60); 
        if (diffinhours < 2) {
            return res.status(400).json({ message: "Cannot cancel booking less than 2 hours before showtime" });
        } 
         const resetMessage = `Hi ${user.fullname}, your booking for ${booking.seats.length} seat(s) on ${starttime.toLocaleString()} has been cancelled successfully.` 
        await sendOTP(user.phonenumber, resetMessage);     
         await usermodel.findByIdAndUpdate(userId, {
            $pull: { bookinghistory: bookingId }
        });
        await showtimemodel.findByIdAndUpdate(showtime._id,{
             $addToSet: { availableseats: { $each: booking.seats } }
        });
         await bookingmodel.findByIdAndDelete(bookingId);
        
          await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: user.email,
          subject: "Booking Cancellation Confirmation",
          html: `<p>Dear ${user.fullname},</p>
                   <p>Your booking has been successfully <b>cancelled</b>.</p>
                   <p><b>Seats:</b> ${booking.seats.join(', ')}<br/>
                   <b>Showtime:</b> ${starttime.toLocaleString()}</p>
                   <p>If you didn't perform this action, please contact support.</p>
                   <p>Thank you for using our service!</p>`
        });
      
     


           return res.status(200).json({ message: "Booking cancelled successfully" });

    } catch (error) {  console.error("Cancellation error:", error);
        return res.status(500).json({ message: "Error while cancelling booking" });
        
    }


}

const contactus=async function (req,res) {
    const requiredbody = z.object({
    email: z.string().email(),
    phonenumber: z.string().regex(/^[6-9]\d{9}$/),
    fullname: z.string().max(30),
    description: z.string().max(1000)
    
  });
  const parsed = requiredbody.safeParse(req.body); 

  if (!parsed.success) {
    console.log("Validation error:", parsed.error.issues);
    const firstError = parsed.error.issues[0];
    res.status(400).json({
      msg: firstError.message || "Invalid input",
    });
    return;
  }
  const { email,phonenumber,fullname,description}=parsed.data;
  try {

    const user=await usermodel.findById(req.user.id)
    if(!user){
        return res.status(404).json({
            message:"user not found"

        })
    }

      await contactmodel.create({ email, phonenumber, fullname, description });
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: `We’ve received your message, ${fullname}`,
          html: `
        <h3>Hi ${fullname},</h3>
        <p>Thank you for contacting us. We’ve received your message:</p>
        <blockquote>${description}</blockquote>
        <p>Our support team will get back to you shortly.</p>
        <br/>
        <p>Regards,<br/>Showtime Team</p>
      `,
        });
       return res.status(200).json({
      msg: "Your message has been received. A confirmation email has been sent to you.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "Something went wrong. Please try again later." });
    
  }




    
}





module.exports = {
    userprofile, userbookings, userlocation,userlanguage,cancelbooking,contactus
}