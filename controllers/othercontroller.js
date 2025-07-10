const {moviemodel}=require("../models/moviemodel")
const {screenmodel}=require("../models/screenmodel")

const Homepage=async function(req,res){
    if(req.check){


    }else{
        try {
            const screens = await screenmodel.find({}, 'movieid');
  const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
              const bannermovies= await moviemodel
  .find()
  .sort({ createdAt: -1 }) 
  .limit(13); 
  if(!bannermovies){
    return res.status(404).json({
        message:"trending movies not found"
    })
  }
const banners = bannermovies
  .filter(t => t.posterurl&&movieIdsOnScreens.includes(t._id.toString()))
  .slice(0,7) 
  .map(t => ({ id: t._id, posterurl: t.posterurl,title:t.title }));; 
  
  const recommendedmovies = await moviemodel.find().sort({rating:-1}).limit(13);
  if(!recommendedmovies){
    return res.status(404).json({
        message:"recommended movies not found"
    })
  }
  const recommended=recommendedmovies
  .filter(t => t.posterurl&&movieIdsOnScreens.includes(t._id.toString()))
   .slice(0,7) 
  .map(t => ({ id: t._id, posterurl: t.posterurl,title:t.title }));;
  return res.status(200).json({
    message:"latest movies found",
   banners,recommended
  })
            
        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                message:"Internal server error while fetching movies"
            })
            
        }
               


    }
}

module.exports={
    Homepage
}