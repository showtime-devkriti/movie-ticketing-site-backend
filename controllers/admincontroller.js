const { JWT_ADMIN_PASS } = require("../store");
const {adminmodel}=require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const axios = require('axios');
const authmiddleware = require("../middlewares/adminmiddleware");
const {ALLOWED_CITIES}=require("../constants/cities");
const {showtimemodel}=require("../models/showtimemodel")
const {moviemodel}=require("../models/moviemodel")
const {screenmodel}=require("../models/screenmodel")
require('dotenv').config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;



const adminregister=async function(req,res){
  const requiredbody = z.object({
      theatretitle: z.string().max(55),
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
      location:z.enum(ALLOWED_CITIES)
    });
     const parsed = requiredbody.safeParse(req.body); 
     if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    res.status(400).json({
      msg: firstError.message || "Invalid input",
    });
    return;
  }


 
    const {
      theatretitle,
      phone1,
      phone2,
      email1,
      email2,
      adminusername,
      password,
      location
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
      email1,
      email2,
      phone1,
      phone2,
      adminusername,
      location,
      paymentregistration: false,
      password: hashedPassword
    });
    return res.status(201).json({
      message:"Admin registration Successfully completed",
      redirectTo:"/admin/payment-registration"
    })

    
  } catch (error) {
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
    const {movieid,language,starttime,format,screenid,price,availableseats}=req.body;
    
  try {

    const movie=await moviemodel.findById(movieid)
    if(!movie){
      return res.status(404).json({
        message :"movie not found"

      })
    }
    

    const existingShow = await showtimemodel.findOne({
  screenid: screenid,
  starttime: new Date(starttime)
});

if (existingShow) {
  return res.status(409).json({
    message: "This screen is already booked at this time"
  });
}

    
    const findscreen=await screenmodel.findById(screenid);
    if(!findscreen){
      return res.status(403).json({
        message:"invalid screen id"
      })
    }
    const start = new Date(starttime);
const datePart = start.toISOString().split("T")[0];
const timePart = start.toISOString().split("T")[1].substring(0,5); 
if (!findscreen.days.includes(datePart)) {
  return res.status(403).json({
    message: "Showtime date is not allowed on this screen"
  });
}
const timingMatch = findscreen.timings.find(t => {
  const tStr = new Date(t).toISOString().split("T")[1].substring(0,5);
  return tStr === timePart;
});
if (!timingMatch) {
  return res.status(403).json({
    message: "Showtime time is not available on this screen"
  });
}

  

    
  } catch (error) {
     console.error("Find screen error:", error.message);
    return res.status(500).json({
      message:"failed to find screen"

    })
    
  }
  try {
    const movie =await moviemodel.findById(movieid);
    if(!movie){
      return res.status(404).json({
        message :"Invalid movieid"
      })
    }
    const foundlang=movie.languages.includes(language)
    if(!foundlang){
      return res.status(409).json({
        message:"the movie is not available in the given language"
      })
    }
    
  } catch (error) {
    console.error("find lanaguage error:",error.message)
    return res.status(500).json({
      message:"failed to find screen"

    })
    
  }


  try{
    const showtime=await showtimemodel.create({

        movieid,
        language,
        theatreid:adminid,
        starttime,
        format,
        screenid,
        price,
        availableseats
    })
    return res.status(201).json({msg:"showtime added",showtime})
  }catch(err){
     console.error("Add showtime error:", err);
    return res.status(500).json({msg:"failed to add showtime"})
  }


    
}

const addmovie=async function(req,res){
  const schema = z.object({
    imdbid: z.string().regex(/^tt\d{7,8}$/, "Invalid IMDb ID")
  });

    
  //    const movieschema = z.object({
  //       imdbid: z.string().regex(/^tt\d{7,8}$/, "Invalid IMDb ID"),
  //   title: z.string().min(1, "Title is required"),
  //   rating: z.number().min(0).max(10).optional(),
  //   genre: z.array(z.string()).optional(),
  //   description: z.string().optional(),
  //   format: z.array(z.enum(['2D', '3D', 'IMAX'])).min(1, "At least one format required"),
  //   languages: z.array(z.string()).optional(),
  //   cast: z.array(z.string()).optional(),
  //   crew: z.array(z.string()).optional(),
  //   trailerurl: z.string().url("Invalid trailer URL").optional()
  // });
   const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return res.status(400).json({
      msg: firstError.message || "Invalid input"
    });
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
       const detailsRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult.id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,videos'
      }
    });
        const data = detailsRes.data;
         const trailer = data.videos.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );
    const posterurl = data.poster_path
  ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
  : undefined;

const backdropurl = data.backdrop_path
  ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
  : undefined;
    const trailerurl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
   const movieData = {
      imdbid,
      title: data.title,
      rating: data.vote_average,
      genre: data.genres.map(g => g.name),
      description: data.overview,
      format: ['2D','3D'], // Default format
      languages: data.spoken_languages.map(lang => lang.english_name),
      cast: data.credits.cast.slice(0, 5).map(actor => actor.name),
      crew: data.credits.crew.slice(0, 5).map(member => member.name),
      trailerurl,
      posterurl,
  backdropurl,
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

const addscreen=async function(req,res){
   const screenschema=z.object({
        movieid:z.string(),
    
       timings: z.array(z.coerce.date()),
        days:z.array(z.string().min(1).refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }))

    })
const parsed=screenschema.safeParse(req.body);
if(!parsed.success){
    return res.status(400).json({message:parsed.error.issues[0].message})
}
const { movieid, timings, days } = parsed.data;
const adminid = req.admin.id;

try {
  const screen = await screenmodel.create({
    movieid: movieid,
    timings: timings,
    days,
    theatreid: adminid
  });
  await adminmodel.findByIdAndUpdate(
      adminid,
      { $push: { screens: screen._id } },
      { new: true }
    );
  return res.status(201).json({
    message: "Screen added successfully",
    screen
  });
} catch (e) {
  return res.status(500).json({ message: "Failed to add screen" });
}

}











module.exports = {
  adminlogin,adminregister,addshowtime,addmovie,
  addscreen
};
