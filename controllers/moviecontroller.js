const { adminmodel,usermodel } = require("../config/db");
const {moviemodel}=require("../models/moviemodel")



const getallmovies=async function(req,res){
    try{
         const { search } = req.query;

      const { genre, language, format } = req.query;
      const userlocation=null;
      const filter = {};
    //    if (req.check && req.user.location) {
    //   filter.location = req.user.location;
    // }
    //     console.log(req.user.location)
      
      // let isSearch = false;

    if (search) {
        // isSearch = true;
  filter.title = { $regex: search, $options: "i" };
}
// if (isSearch && (genre || language || format)) {
//       return res.status(400).json({
//         message:
//           "You cannot use genre, language, or format filters while searching by title",
//       });
//     }

    if (genre) {
      filter.genre = { $in: genre.split(",") };
    }

    if (language) {
      filter.languages = { $in: language.split(",") };
    }

    if (format) {
      filter.format = { $in: format.split(",") };
    }
    const movies = await moviemodel.find(filter);
    return res.status(200).json({ movies });

    }catch(err){
        console.error("error:", err);
        res.status(500).json({
            message:"failed to fetch movies"
        })

    }

}
const getMovieById=async function(req,res){
    const movieid=req.params.id;
     try {
    const movie = await moviemodel.findById(movieid);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json({ movie });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch movie" });
  }
   
}




module.exports={  
    getallmovies,getMovieById
}

