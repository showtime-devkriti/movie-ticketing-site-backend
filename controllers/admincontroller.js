const { JWT_ADMIN_PASS } = require("../store");
const {adminmodel}=require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const axios = require('axios');
const authmiddleware = require("../middlewares/adminmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");
const { generateSeats }=require("../constants/seatlayouts")
const {showtimemodel}=require("../models/showtimemodel")
const {moviemodel}=require("../models/moviemodel")
const {screenmodel}=require("../models/screenmodel")
const {movieidmodel}=require("../models/movieidmodel")
require('dotenv').config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;



const adminregister=async function(req,res){
  const requiredbody = z.object({
      theatretitle: z.string().max(55),
      image:z.string().url(),
      phone1: z.string().regex(/^[6-9]\d{9}$/),
      phone2: z.string().regex(/^[6-9]\d{9}$/),
      email1: z.string().email(),
      email2:z.string().email(),
      adminusername:z.string().regex(/^[a-zA-Z0-9._-]{3,20}$/),
      password: z
        .string()
        .min(8) 
        .regex(/[a-zA-Z]/)
        .regex(/[0-9]/), 
      location:z.enum(ALLOWED_CITIES),
      address:z.string()
     
    });
     const parsed = requiredbody.safeParse(req.body); 
     if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return res.status(400).json({ msg: firstError.message || "Invalid input" });
  }

 
    const {
      theatretitle,
      image,
      phone1,
      phone2,
      email1,
      email2,
      adminusername,
      password,
      location,
      address
    } = req.body;

     const conflict = await adminmodel.findOne({
    $or: [
      { email1 },
      { email2 },
      { phone1 },
      { phone2 },
      { email1: email2},
      {email2: email1},
      {phone1: phone2},
      {phone2: phone1},
      { adminusername }
    ]
  });
  if(conflict){
    return res.status(409).json({msg:"Email or phone number already in use by another admin" });

  }
  try {
     const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await adminmodel.create({
      theatretitle,
      image,
      email1,
      email2,
      phone1,
      phone2,
      adminusername,
      location,
      address,
      paymentregistration: false,
      password: hashedPassword
    });
    return res.status(201).json({
      message:"Admin registration Successfully completed",
      redirectTo:"/admin/payment-registration"
    })

    
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      
      message:"Error Registration failed!! Try again"
    })

    
  }

  



}

const adminlogin =async function(req,res){
    const loginSchema = z.object({
check: z.string().min(3),
password: z.string().min(8)
});

const parsed = loginSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ msg: "Invalid login input" });
}
try {
    

  const {check,password}=req.body;
  const admin=await adminmodel.findOne({
    $or:[{adminusername:check},
      {email1:check},
      {phone1:check}

    ]
  })
   if (!admin) {
    return res.status(404).json({ msg: "Admin not found" });
  }
   const match = await bcrypt.compare(password, admin.password);

   if (!match) {
    return res.status(403).json({ msg: "Incorrect credentials" });
  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

//   if(!admin.paymentregistration){
//     return res.status(200).json({
//       message:"Complete the payment Registration",
//       redirectTo:"/admin/payment-registration",
//       Status:"Redirect"
//     })
//   }

  const token =jwt.sign({
id: admin._id,
role: "admin",
username: admin.adminusername
}, JWT_ADMIN_PASS, { expiresIn: "7d" })

res.cookie("admin", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "Strict", // Or "Lax" depending on your frontend
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

   return res.status(201).json({
    token,
    status: "success",
    redirectTo: "/admin/dashboard"
  })}catch(error){
     return res.status(500).json({
      message:"Error login failed!! Try again"
    })
    

  }




}

const addshowtime =async function(req,res){
    const adminid=req.admin.id;
    const screenid=req.params.screenid
    const {movieid,language,starttime,format,price}=req.body;
    
  try { 
    const alreadyExists = await showtimemodel.findOne({ screenid, starttime });

if (alreadyExists) {
  return res.status(409).json({
    message: "A showtime already exists for this screen at the selected time"
  });
}


  
      const screen = await screenmodel.findById(screenid);
      
    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }

 const validClasses = screen.seatStructure.map(s => s.class);

    
    const invalidClasses = Object.keys(price).filter(key => !validClasses.includes(key));

    if (invalidClasses.length > 0) {
      return res.status(400).json({
        message: `Invalid seat class in price: ${invalidClasses.join(", ")}`,
         validSeatClasses: validClasses
      });
    }
const seatIds = screen.seats.map(seat => seat.seatid);
   
     const start = new Date(starttime);


  let moviedata;
 try {
     const tmdb_api_key = process.env.TMDB_API_KEY;
          const response = await axios.get(
            `https://api.themoviedb.org/3/find/${movieid}?external_source=imdb_id&api_key=${tmdb_api_key}`
          );
             const movieResult = response.data.movie_results[0];
              if (!movieResult) {
      return res.status(404).json({ message: "Movie not found in TMDB" });
    }
            const tmdbid=movieResult.id;
            const movieDetailsRes = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbid}?api_key=${tmdb_api_key}`
    );
     const spokenLanguages = movieDetailsRes.data.spoken_languages;
     const languageExists = spokenLanguages.some(
        langObj => langObj.english_name.toLowerCase() === language.toLowerCase() ||
                   langObj.name.toLowerCase() === language.toLowerCase() ||
                   langObj.iso_639_1.toLowerCase() === language.toLowerCase()
      );
    if (!languageExists) {
        return res.status(409).json({
          message: "Movie does not exist in the given language"
        });
      }

            moviedata = {
              _id: movieid,
              title: movieResult.title,
              genre:movieDetailsRes.data.genres.map(g => g.name),
              runtime:movieDetailsRes.data.runtime,
              rating: movieDetailsRes.data.vote_average,
               poster:`https://image.tmdb.org/t/p/w500${movieDetailsRes.data.poster_path}`
            };
          
    
  } catch (error) {
      console.error("Failed to fetch from TMDB:", error.message);
      return res.status(404).json({
        message:"fetching from tmdb failed"
      })
    
  }
 const showtime = await showtimemodel.create({
      movieid:moviedata._id,
      movietitle:moviedata.title,
      genre:moviedata.genre,
      runtime:moviedata.runtime,
      rating:moviedata.rating,
      language,
      theatreid: adminid,
      starttime: start,
      format,
      screenid,
      seatpricing:price,
      availableseats:seatIds,
      poster:moviedata.poster

    });
   let movieidadded=null
  const movieidexist = await movieidmodel.findOne({ movieid: moviedata._id });

    if(!movieidexist){
      movieidadded=await movieidmodel.create({
        movieid:moviedata._id
      })
    }

    

    return res.status(201).json({ msg: "Showtime added", showtime ,movieidadded});
  

    
  } catch (error) {
     console.error("Find showtime error:", error.message);
    return res.status(500).json({
      message:"Something went wrong while adding showtime"

    })
    
  }
 


  
}

const addmovie = async function (req, res) {
  const schema = z.object({
    imdbid: z.string().regex(/^tt\d{7,8}$/, "Invalid IMDb ID")
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return res.status(400).json({ msg: firstError.message || "Invalid input" });
  }

  const { imdbid } = req.body;

  try {
    const existingmovie = await moviemodel.findOne({ imdbid });
    if (existingmovie) {
      return res.status(409).json({
        message: "Movie already exists",
        movie: existingmovie
      });
    }

    // Step 1: Find TMDB ID using IMDb ID
    const findRes = await axios.get(`https://api.themoviedb.org/3/find/${imdbid}`, {
      params: {
        api_key: TMDB_API_KEY,
        external_source: 'imdb_id'
      }
    });

    const movieResult = findRes.data.movie_results[0];
    if (!movieResult) {
      return res.status(404).json({ msg: "Movie not found on TMDB" });
    }

    const tmdbId = movieResult.id;

    // Step 2: Fetch full details and all images in parallel
    const [detailsRes, imagesRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits,videos'
        }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/images`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);

    const data = detailsRes.data;
    const images = imagesRes.data;

    // Build image URLs
    const posterurls = images.posters.map(p => `https://image.tmdb.org/t/p/w500${p.file_path}`);
    const backdropurls = images.backdrops.map(b => `https://image.tmdb.org/t/p/original${b.file_path}`);
    const logos = images.logos.map(l => `https://image.tmdb.org/t/p/w500${l.file_path}`);

    const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const trailerurl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

    const castDetails = data.credits.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      image: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : undefined
    }));

    const crewDetails = data.credits.crew.slice(0, 10).map(member => ({
      name: member.name,
      image: member.profile_path ? `https://image.tmdb.org/t/p/w500${member.profile_path}` : undefined
    }));

    // Prepare the final movie document
    const movieData = {
      imdbid,
      title: data.title,
      rating: data.vote_average,
      genre: data.genres.map(g => g.name),
      description: data.overview,
      format: ['2D', '3D'],
      languages: data.spoken_languages.map(lang => lang.english_name),
      cast: data.credits.cast.slice(0, 5).map(actor => actor.name),
      crew: data.credits.crew.slice(0, 5).map(member => member.name),
      castDetails,
      crewDetails,
      trailerurl,
      posterurl: posterurls[0],
      posterurls,
      backdropurl: backdropurls[0],
      backdropurls,
      logos:logos[0],
      runtime: data.runtime,
      releaseDate: data.release_date,
      adult: data.adult,
      popularity: data.popularity
    };

    const newMovie = await moviemodel.create(movieData);

    return res.status(201).json({
      msg: "Movie added successfully",
      movie: newMovie
    });

  } catch (err) {
    console.error("Add movie error:", err.message);
    return res.status(500).json({ msg: "Failed to add movie" });
  }
};

const addscreen = async function (req, res) {
   const screenschema = z.object({
    screenName: z.string(),
    seatlayout: z.array(z.object({
      class: z.string(),
      rows: z.number().positive(),
      columns: z.number().positive()
    }))
  });
  

  const parsed = screenschema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const {  screenName,seatlayout } = parsed.data;
  const adminid = req.admin.id;
  try {
     const existingScreens = await screenmodel.find({
      screenName,
      theatreid: adminid
    });
      if (existingScreens.length > 0) {
      return res.status(400).json({
        message: "Screen with this name already exists for this theatre"
      });
    }
     const layout=generateSeats(seatlayout)
       const seatStructure = seatlayout.map(section => ({
      class: section.class,
      rows: section.rows,
      columns: section.columns,
      totalseats: section.rows * section.columns
    }));
     const screen = await screenmodel.create({
      screenName,
      theatreid: adminid,
      seats: layout,
       seatStructure
    });
    await adminmodel.findByIdAndUpdate(adminid, {
      $addToSet: { screenInfo: screen._id } 
    });
      return res.status(201).json({
      message: "Screen created successfully",
      screen
    });
    
  } catch (error) {
        console.error("Add screen error:", error);
    return res.status(500).json({ message: "Internal server error while adding screen" });

    
  }
 

  

   
};

const deleteshowtime = async (req, res) => {
  const showtimeid = req.params.id;
  const adminid = req.admin.id;

  try {
    const showtime = await showtimemodel.findById(showtimeid);
    if (!showtime) {
      return res.status(404).json({ msg: "Showtime not found" });
    }

   console.log(adminid)
   console.log(showtime.theatreid)
    if (showtime.theatreid.toString() !== adminid) {
      return res.status(403).json({ msg: "Unauthorized to delete this showtime" });
    }

    await showtimemodel.findByIdAndDelete(showtimeid);

    return res.status(200).json({ msg: "Showtime deleted successfully" });
  } catch (err) {
    console.error("Delete showtime error:", err.message);
    return res.status(500).json({ msg: "Failed to delete showtime" });
  }
};

const getscreen=async function(req,res){
    const adminid=req.admin.id;
    try {
       const screens = await screenmodel.find({ theatreid: adminid })
       .select("-seats -__v")
      
   
       if (!screens || screens.length === 0) {
      return res.status(404).json({ message: "No screens found for this admin" });
    }

        const groupedScreens = {};
         for (const screen of screens) {
          if(screen.screenName!="undefined"){
             const key = screen.screenName // group key like "screen1", "screen2"
      if (!groupedScreens[key]) {
        groupedScreens[key] = [];
      }
      groupedScreens[key].push(screen);

          }
     
    }
 return res.status(200).json({
      message: "Screens fetched successfully",
      screens:groupedScreens
    });
      
    } catch (error) {
      console.error("Error in getscreen:", error);
    return res.status(500).json({ message: "Internal server error" });
      
    }

}
















module.exports = {
  adminlogin,adminregister,addshowtime,addmovie,
  addscreen,deleteshowtime,getscreen
};
// const addscreen=async function(req,res){
//    const screenschema=z.object({
//         movieid:z.string(),
    
//        timings: z.array(z.coerce.date()),
//         days:z.array(z.string().min(1).refine(val => !isNaN(Date.parse(val)), {
//     message: 'Invalid date format'
//   })),
//    layout: z.enum(['bigLayout1', 'bigLayout2', 'bigLayout3', 'bigLayout4'])

//     })
// const parsed=screenschema.safeParse(req.body);
// if(!parsed.success){
//     return res.status(400).json({message:parsed.error.issues[0].message})
// }
// const { movieid, timings, days,layout } = parsed.data;
// const adminid = req.admin.id;
// let seats;
// switch (layout) {
//   case 'bigLayout1': seats = bigLayout1(); break;
//   case 'bigLayout2': seats = bigLayout2(); break;
//   case 'bigLayout3': seats = bigLayout3(); break;
//   case 'bigLayout4': seats = bigLayout4(); break;
//   default: seats = bigLayout1(); 
// }

// try {
//   const movie =await moviemodel.findById(movieid)
//   if(!movie){
//     return res.status(403).json({
//       message:"movie does not exist"
//     })
//   }
// const adminScreens = await screenmodel.find({ theatreid: adminid });

//   const conflictScreen = adminScreens.find(screen =>
//     screen.days.some(d => days.includes(d))
//   );

//   if (conflictScreen) {
//     const overlappingDays = conflictScreen.days.filter(d => days.includes(d));
//     return res.status(409).json({
//       message: `Screen already booked on these days: ${overlappingDays.join(', ')}`
//     });
//   }

//   const screen = await screenmodel.create({
//     movieid: movieid,
//     timings: timings,
//     days,
//     theatreid: adminid,
//     seats
//   });
//   await adminmodel.findByIdAndUpdate(
//       adminid,
//       { $push: { screens: screen._id } },
//       { new: true }
//     );
//   return res.status(201).json({
//     message: "Screen added successfully",
//     screen
//   });
// } catch (e) {
//   return res.status(500).json({ message: "Failed to add screen" });
// }

// }
