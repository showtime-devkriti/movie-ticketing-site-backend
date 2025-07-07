const {moviemodel}=require("../models/moviemodel")
const getallmovies=async function(req,res){
    try{
         const { search } = req.query;

      const { genre, language, format } = req.query;
     

    const filter = {};
    let check=false;

    if (search) {
        check=true;
  filter.title = { $regex: search, $options: "i" };
}

    if (genre) {
        if(check){
            return res.status(400).json({
                message:"You cannot use genre, language, or format filters while searching by title"

            })
        }
      filter.genre = { $in: genre.split(',') };
    }

    if (language) {
         if(check){
            return res.status(400).json({
                message:"You cannot use genre, language, or format filters while searching by title"
                
            })
        }
      filter.languages = { $in: language.split(',') };
    }

    if (format) {
         if(check){
            return res.status(400).json({
                message:"You cannot use genre, language, or format filters while searching by title"
                
            })
        }
      filter.format = { $in: format.split(',') };
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

module.exports={
    getallmovies
}

