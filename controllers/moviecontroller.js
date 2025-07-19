const { adminmodel,usermodel } = require("../config/db");
const {moviemodel}=require("../models/moviemodel")
const {screenmodel}=require("../models/screenmodel")
const axios = require("axios");
require("dotenv").config();


const languageMap = {
  te: "Telugu",
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  ml: "Malayalam",
  kn: "Kannada",
  mr: "Marathi",
  bn: "Bengali",
  pa: "Punjabi",
  gu: "Gujarati",
  or: "Odia",
  ur: "Urdu",
};




const getallmovies = async function (req, res) {
  try {
    const { search, genre, language } = req.query;
    let tmdbUrl = "";
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      include_adult: false,
    };

    // 🔍 CASE 1: If searching
    if (search) {
      tmdbUrl = "https://api.themoviedb.org/3/search/movie";
      params.query = search;
    } else if (req.check && req.user) {
      // ✅ CASE 2: Logged-in user → show latest movies of their preferred language
      const user = await usermodel.findById(req.user.id).select("language");
      
      const userLang = languageMap[user?.language] || "en";

      tmdbUrl = "https://api.themoviedb.org/3/discover/movie";
      params.sort_by = "release_date.desc";
      params.with_original_language = userLang;
    } else {
      // 🌐 CASE 3: Not logged in → show popular movies
      tmdbUrl = "https://api.themoviedb.org/3/movie/popular";
    }

    // 🎯 Apply filters
    if (genre) params.with_genres = genre;
    if (language) params.with_original_language = language;

    const response = await axios.get(tmdbUrl, { params });

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      rating: movie.vote_average,
      posterurl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      language: languageMap[movie.original_language],
      release_date: movie.release_date,
    }));

    res.status(200).json({ movies });
  } catch (err) {
    console.error("TMDb error:", err.message);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};

// const getMovieById=async function(req,res){
//     const movieid=req.params.id;
//      try {
//     const movie = await moviemodel.findById(movieid);
//     if (!movie) {
//       return res.status(404).json({ message: "Movie not found" });
//     }
//     let onscreen=false;
//     const screen = await screenmodel.find({ movieid });
// if (screen.length > 0) {
//   onscreen = true;
// }

//     const genre=movie.genre;
//     const languages=movie.languages;
//      const screens = await screenmodel.find({}, 'movieid');
//                 const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
//      const  recommendedmovies   = await moviemodel.find({
//       _id: { $ne: movieid }, // exclude the current movie itself
//       $or: [
//         { genre: { $in: genre } },        // match any genre
//         { languages: { $in: languages } } // match any language
//       ]
//     }).sort({ rating: -1 }) // sort by rating descending
//       .limit(10);

//       const moviesYouAlsoLike=recommendedmovies
//                 .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()))
//                 .slice(0, 7)
//                 .map(t => ({ id: t._id, posterurl: t.posterurl, title: t.title ,rating:t.rating,language:t.languages,genre:t.genre}));;

//     return res.status(200).json({
//       onscreen,movie,moviesYouAlsoLike
//     });
//   } catch (error) {
//     console.error(error.message)
//     return res.status(500).json({ message: "Failed to fetch movie" });
//   }
   
// }
const getMovieById = async (req, res) => {
  const imdbid = req.params.id;

  if (!imdbid) {
    return res.status(400).json({ message: "IMDb ID is required" });
  }

  try {
    const tmdb_api_key = process.env.TMDB_API_KEY;
    if (!tmdb_api_key) {
      return res.status(500).json({ message: "TMDB API key not configured" });
    }

    // 1. Find TMDB ID from IMDb ID
    const findRes = await axios.get(`https://api.themoviedb.org/3/find/${imdbid}`, {
      params: {
        api_key: tmdb_api_key,
        external_source: "imdb_id",
      },
    });

    const movieResult = findRes.data.movie_results?.[0];
    if (!movieResult) {
      return res.status(404).json({ message: "Movie not found on TMDB" });
    }

    const tmdbId = movieResult.id;

    // 2. Get movie details
    const movieDetailsRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
      params: { api_key: tmdb_api_key },
    });

    const movieDetails = movieDetailsRes.data;

    // 3. Get credits
    const creditsRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/credits`, {
      params: { api_key: tmdb_api_key },
    });

    const crew = creditsRes.data.crew || [];
    const cast = creditsRes.data.cast || [];

    // Only 10 cast members: name, id, profile image
    const topCast = cast.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      profile: c.profile_path
        ? `https://image.tmdb.org/t/p/w500${c.profile_path}`
        : null,
    }));

    // Only 10 crew members: name, id, profile image
    const topCrew = crew.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      job: c.job,
      profile: c.profile_path
        ? `https://image.tmdb.org/t/p/w500${c.profile_path}`
        : null,
    }));
    const imagesRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/images`, {
  params: { api_key: tmdb_api_key },
});

    // Get director and producer names from crew
    const director = crew.find((m) => m.job === "Director")?.name || "Not available";
    const producer = crew.find((m) => m.job === "Producer")?.name || "Not available";

    // Get all spoken languages with full names
    const spoken_languages = movieDetails.spoken_languages.map((lang) => lang.english_name);

    // Get full original language name
   const originalLangFull = languageMap[movieDetails.original_language] || movieDetails.original_language;

const allLanguages = (movieDetails.spoken_languages || []).map(
  (lang) => languageMap[lang.iso_639_1] || lang.name
);
const logos = imagesRes.data.logos || [];
const logo_url = logos.length > 0
  ? `https://image.tmdb.org/t/p/original${logos[0].file_path}`
  : null;
      const recommendationsRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/recommendations`, {
      params: { api_key: tmdb_api_key },
    });

    const recommendedMovies = recommendationsRes.data.results.slice(0, 10).map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : null,
      rating: movie.vote_average,
      release_date: movie.release_date,
    }));
const usersWithReviews = await usermodel.find({ "reviews.movieid": imdbid });
    const extractedReviews = [];

     usersWithReviews.forEach((user) => {
      user.reviews.forEach((rev) => {
        if (rev.movieid === imdbid) {
          extractedReviews.push({
            username: user.username,
            fullname: user.fullname,
            rating: rev.rating,
            reviewtext: rev.reviewtext,
            createdate: rev.createdate,
          });
        }
      });
    });


    return res.status(200).json({
        id: movieDetails.id,  
      title: movieDetails.title,
      description: movieDetails.overview,
      poster_url: `https://image.tmdb.org/t/p/original${movieDetails.poster_path}`,
      backdrop_url: `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`,
        title_logo: logo_url,
      release_date: movieDetails.release_date,
      release_year: movieDetails.release_date?.split("-")[0],
      runtime: movieDetails.runtime,
      genres: movieDetails.genres.map(g => g.name),
      rating: movieDetails.vote_average,
      director,
      producer,
      original_language: originalLangFull,

   spoken_languages: allLanguages,

      cast: topCast,
      crew: topCrew,
      reviews: extractedReviews,
       recommended: recommendedMovies,
    });
  } catch (err) {
    console.error("TMDB fetch error:", err.message);
    return res.status(500).json({ message: "Failed to fetch movie from TMDB" });
  }
};





module.exports={  
    getallmovies,getMovieById
}

