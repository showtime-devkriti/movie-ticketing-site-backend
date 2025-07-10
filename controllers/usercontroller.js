const { usermodel } = require("../config/db");
const { z } = require("zod")
const { ALLOWED_CITIES } = require("../constants/cities");

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
      { path: 'showtime' }
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




module.exports = {
    userprofile, userbookings, userlocation
}