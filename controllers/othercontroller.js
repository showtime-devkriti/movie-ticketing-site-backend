const { moviemodel } = require("../models/moviemodel")
const { screenmodel } = require("../models/screenmodel")
const { usermodel,adminmodel } = require("../config/db")

const Homepage = async function (req, res) {
      console.log(req.check)
    if (req.check) {
        try {
            const user = await usermodel.findById(req.user.id).populate("language");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.language) {
                return res.status(403).json({
                    message: "please enter the preffered language to continue"
                })
            }
            const screens = await screenmodel.find({}, 'movieid');
           


            const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
       
            const bannermovies = await moviemodel
                .find()
                .sort({ createdAt: -1 })
                .limit(41);
            if (!bannermovies) {
                return res.status(404).json({
                    message: "trending movies not found"
                })
            }
         bannermovies.forEach(t => {
    console.log("Checking movie:", t.title);
    console.log("  Has backdrop:", !!t.backdropurl);
    console.log("  On screen:", movieIdsOnScreens.includes(t._id.toString()));
    console.log("  Language match:", t.languages.includes(user.language));
});

            const banners = bannermovies
                .filter(t => t.backdropurl && movieIdsOnScreens.includes(t._id.toString()) && t.languages.includes(user.language)
                )
                .slice(0, 7)
                .map(t => ({ id: t._id, backdropurl: t.backdropurl, title: t.title,rating:t.rating,language:t.languages,genre:t.genre,logos:t.logos,description:t.description }));;

            const recommendedmovies = await moviemodel.find().sort({ rating: -1 }).limit(41);
            if (!recommendedmovies) {
                return res.status(404).json({
                    message: "recommended movies not found"
                })
            }
            const recommended = recommendedmovies
                .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()) && t.languages.includes(user.language))
                .slice(0, 8)
                .map(t => ({ id: t._id, posterurl: t.posterurl, title: t.title,rating:t.rating,language:t.languages,genre:t.genre }));;
            
const allowedLanguages = ["Hindi", "English",user.language];

const comedy = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const crime = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Crime") &&
    !t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const actionAndAdventure = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    (t.genre.includes("Action") || t.genre.includes("Adventure")) &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const romance = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Romance") &&
    !t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));


            return res.status(200).json({
                message: "latest movies found",
                banners, recommended,comedy,romance,actionAndAdventure,crime
            })










        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                message: "Internal server error while fetching movies"
            })

        }





    } else {
        try {
            const screens = await screenmodel.find({}, 'movieid');
            const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
             console.log("screens", screens);
                 console.log("movieIdsOnScreens", movieIdsOnScreens);
            const bannermovies = await moviemodel
                .find()
                .sort({ createdAt: -1 })
                .limit(41);
            if (!bannermovies) {
                return res.status(404).json({
                    message: "trending movies not found"
                })
            }
            const banners = bannermovies
                .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()))
                .slice(0, 7)
                .map(t => ({ id: t._id, backdropurl: t.backdropurl, title: t.title ,rating:t.rating,language:t.languages,genre:t.genre,logos:t.logos,description:t.description}));;

            const recommendedmovies = await moviemodel.find().sort({ rating: -1 }).limit(41);
            if (!recommendedmovies) {
                return res.status(404).json({
                    message: "recommended movies not found"
                })
            }
            const recommended = recommendedmovies
                .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()))
                .slice(0, 8)
                .map(t => ({ id: t._id, posterurl: t.posterurl, title: t.title ,rating:t.rating,language:t.languages,genre:t.genre}));;
const allowedLanguages = ["Hindi", "English"];

const comedy = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const crime = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Crime") &&
    !t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const actionAndAdventure = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    (t.genre.includes("Action") || t.genre.includes("Adventure")) &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));

const romance = recommendedmovies.filter(t =>
    t.posterurl &&
    movieIdsOnScreens.includes(t._id.toString()) &&
    t.genre.includes("Romance") &&
    !t.genre.includes("Comedy") &&
    t.languages.some(lang => allowedLanguages.includes(lang))
).slice(0, 8).map(t => ({
    id: t._id, posterurl: t.posterurl, title: t.title,
    rating: t.rating, language: t.languages
}));


            return res.status(200).json({
                message: "latest movies found",
                banners, recommended,comedy,romance,actionAndAdventure,crime
            })

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                message: "Internal server error while fetching movies"
            })

        }



    }
}
const searchHandle=async function(req,res){
    const query = req.query.query?.trim();
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }
  try {
     const movies = await moviemodel.find({
      title: { $regex: query, $options: "i" }
    }).select("title posterurl");

    const theatres = await adminmodel.find({
      theatretitle: { $regex: query, $options: "i" }
    }).select("theatretitle location");

    res.status(200).json({
      movies,
      theatres
    });

    
  } catch (error) {
      console.error("Search error:", error.message);
    res.status(500).json({ message: "Internal server error during search" });
    
  }


}
module.exports = {
    Homepage,searchHandle
}