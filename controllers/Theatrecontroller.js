const { showtimemodel } = require("../models/showtimemodel");
const { moviemodel } = require("../models/moviemodel");
const { screenmodel } = require("../models/screenmodel");
const {usermodel,adminmodel}=require("../config/db")
const axios = require("axios");

const getalltheatres = async function (req, res) {
  try {
    const filter = {};
    const checkAuth = req.check;
    let resolvedLocation;

    if (checkAuth) {
      const user = await usermodel.findById(req.user.id).populate("location");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.location) {
        return res.status(400).json({ message: "Please set your location to browse theatres" });
      }

      // If location is a populated object, use its name or id
      resolvedLocation = user.location.name || user.location; // adjust based on how your model looks
    } else if (req.query.location) {
      resolvedLocation = req.query.location;
    } else {
      return res.status(409).json({
        message: "Please login or provide location to browse theatres",
      });
    }

    filter.location = resolvedLocation;

    const { search } = req.query;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

   const theatres = await adminmodel.find(filter)
//   .populate({
//   path: "screens",
//   model: "screens",
//   // populate:{
//   //   path:"movieid",
//   //   model:"movies"
//   // }
// })

  .select("theatretitle location address image"); // include only relevant fields

    return res.status(200).json({ theatres });
  } catch (err) {
    console.error("Error fetching theatres:", err.message);
    return res.status(500).json({ message: "Failed to fetch theatres" });
  }
};
            
const theatreById=async function(req,res){
     
  const { theatreid } = req.params;
  const { date } = req.query;
  const now = new Date();
  
  
  let start ,end;
  
  
  if (!date) {
  start = new Date();
  
  end = new Date();
  end.setUTCHours(23, 59, 59, 999); // Ensure UTC time
}else{
      start = new Date(date);
      const isToday =
      start.toISOString().split("T")[0] === now.toISOString().split("T")[0];

    if (isToday) {
      start = now;
    }


        end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
  }
  console.log("Filtering from:", start, "to:", end);

    try {
         const showtimes = await showtimemodel.find({
      theatreid,
      starttime: { $gte: start, $lte: end },
    }).populate({
        path:"screenid",
       model:"screens",
       });
       const theatre = await adminmodel.findById(theatreid).select("theatretitle location address image");

  if (!theatre) {
    return res.status(404).json({ message: "Theatre not found" });
  }
          
const grouped = {};
for(let show of showtimes){
  let moviedata=null;
  try {
     const tmdb_api_key = process.env.TMDB_API_KEY;
          const response = await axios.get(
            `https://api.themoviedb.org/3/find/${show.movieid}?external_source=imdb_id&api_key=${tmdb_api_key}`
          );
             const movieResult = response.data.movie_results[0];
              if (movieResult) {
            moviedata = {
              _id: show.imdbid,
              title: movieResult.title,
              language: show.language,
              format: show.format,
            };
          }
    
  } catch (error) {
      console.error("Failed to fetch from TMDB:", err.message);
    
  }
  if (!moviedata) continue;
    const moviekey=show.movieid._id;


     if (!grouped[moviekey]) {
        grouped[moviekey] = {
          movietitle:moviedata.title,
          language: moviedata.language,
          format: moviedata.format,
          showtimes: [],
        };
      }
      
       grouped[moviekey].showtimes.push({
        starttime: show.starttime,
        screen: show.screenid?.screenName || "Unknown Screen",
        price: show.price,
      });
    
}

   res.status(200).json({
     theatre: {
      theatretitle: theatre.theatretitle,
      location: theatre.location,
      address: theatre.address,
      image: theatre.image,
    },
    movies: Object.values(grouped)
   });
     
        
    } catch (err) {
        console.error("Error fetching theatre showtimes:", err.message);
    res.status(500).json({ message: "Failed to fetch theatre showtimes" });
        
    }




}
module.exports={
    getalltheatres,theatreById
}