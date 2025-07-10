const { showtimemodel } = require("../models/showtimemodel");
const { moviemodel } = require("../models/moviemodel");
const { screenmodel } = require("../models/screenmodel");
const {usermodel}=require("../config/db")


const getShowTimes=async function(req,res){
    const movieid=req.params.id;
     const { date, format, language } = req.query;
    
const user = await usermodel.findById(req.user.id);


if (!user) {
  return res.status(404).json({ msg: "User not found" });
}

const userlocation = user.location;


    if (!userlocation) {
    return res.status(400).json({ msg: "User location is not set" });
  }
  const todaydate=new Date().toISOString().split("T")[0];
  const selectdate=date?date:todaydate;
  const dayStart = new Date(selectdate);
  const dayEnd = new Date(selectdate);
  dayEnd.setUTCHours(23,59,59,999);

  const filter={
    movieid,
    starttime:{ $gte: dayStart, $lte: dayEnd },
  }
  if(format)filter.format=format;
  if(language)filter.language=language;

  try {
    const showtimes=await showtimemodel.find(filter).populate({
        path:"screenid",
        model:"screens",
        populate: {
      path: "theatreid",
      model: "admins",
      match: { location: userlocation },
    },


    })
 
    const validShowtimes = showtimes.filter(
      (show) => show.screenid && show.screenid.theatreid
    );
   
    const grouped = validShowtimes.reduce((acc, show) => {
      const theatreName = show.screenid.theatreid.theatretitle;
      const screenid = show.screenid._id;
      const key = `${theatreName}_${screenid}_${show.format}_${show.language}`;

      if (!acc[key]) {
        acc[key] = {
          theatre: theatreName,
          screenid,
          format: show.format,
          language: show.language,
          price: show.price,
          timings: [],
        };
      }
   
       acc[key].timings.push(show.starttime);
      return acc;
    }, {});


   return res.status(200).json(Object.values(grouped));


    
  } catch (error) {
     console.error("Error fetching showtimes:", error.message);
    return res.status(500).json({ msg: "Failed to fetch showtimes" });
    
  }

   
    

    
     
   
}
module.exports = { getShowTimes };