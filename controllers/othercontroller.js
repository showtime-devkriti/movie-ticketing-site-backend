const { moviemodel } = require("../models/moviemodel")
const { screenmodel } = require("../models/screenmodel")
const { usermodel,adminmodel } = require("../config/db")
const axios = require("axios");
require('dotenv').config();
const https = require("https");
const TMDB_API_KEY = process.env.TMDB_API_KEY;



// const Homepage = async function (req, res) {
//       console.log(req.check)
//     if (req.check) {
//         try {
//             const user = await usermodel.findById(req.user.id).populate("language");
//             if (!user) {
//                 return res.status(404).json({ message: "User not found" });
//             }

//             if (!user.language) {
//                 return res.status(403).json({
//                     message: "please enter the preffered language to continue"
//                 })
//             }
//             const screens = await screenmodel.find({}, 'movieid');
           


//             const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
       
//             const bannermovies = await moviemodel
//                 .find()
//                 .sort({ createdAt: -1 })
//                 .limit(41);
//             if (!bannermovies) {
//                 return res.status(404).json({
//                     message: "trending movies not found"
//                 })
//             }
//          bannermovies.forEach(t => {
//     console.log("Checking movie:", t.title);
//     console.log("  Has backdrop:", !!t.backdropurl);
//     console.log("  On screen:", movieIdsOnScreens.includes(t._id.toString()));
//     console.log("  Language match:", t.languages.includes(user.language));
// });

//             const banners = bannermovies
//                 .filter(t => t.backdropurl && movieIdsOnScreens.includes(t._id.toString()) && t.languages.includes(user.language)
//                 )
//                 .slice(0, 7)
//                 .map(t => ({ id: t._id, backdropurl: t.backdropurl, title: t.title,rating:t.rating,language:t.languages,genre:t.genre,logos:t.logos,description:t.description }));;

//             const recommendedmovies = await moviemodel.find().sort({ rating: -1 }).limit(41);
//             if (!recommendedmovies) {
//                 return res.status(404).json({
//                     message: "recommended movies not found"
//                 })
//             }
//             const recommended = recommendedmovies
//                 .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()) && t.languages.includes(user.language))
//                 .slice(0, 8)
//                 .map(t => ({ id: t._id, posterurl: t.posterurl, title: t.title,rating:t.rating,language:t.languages,genre:t.genre }));;
            
// const allowedLanguages = ["Hindi", "English",user.language];

// const comedy = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const crime = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Crime") &&
//     !t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const actionAndAdventure = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     (t.genre.includes("Action") || t.genre.includes("Adventure")) &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const romance = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Romance") &&
//     !t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));


//             return res.status(200).json({
//                 message: "latest movies found",
//                 banners, recommended,comedy,romance,actionAndAdventure,crime
//             })










//         } catch (error) {
//             console.error(error.message)
//             return res.status(500).json({
//                 message: "Internal server error while fetching movies"
//             })

//         }





//     } else {
//         try {
//             const screens = await screenmodel.find({}, 'movieid');
//             const movieIdsOnScreens = screens.map(screen => screen.movieid.toString());
//              console.log("screens", screens);
//                  console.log("movieIdsOnScreens", movieIdsOnScreens);
//             const bannermovies = await moviemodel
//                 .find()
//                 .sort({ createdAt: -1 })
//                 .limit(41);
//             if (!bannermovies) {
//                 return res.status(404).json({
//                     message: "trending movies not found"
//                 })
//             }
//             const banners = bannermovies
//                 .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()))
//                 .slice(0, 7)
//                 .map(t => ({ id: t._id, backdropurl: t.backdropurl, title: t.title ,rating:t.rating,language:t.languages,genre:t.genre,logos:t.logos,description:t.description}));;

//             const recommendedmovies = await moviemodel.find().sort({ rating: -1 }).limit(41);
//             if (!recommendedmovies) {
//                 return res.status(404).json({
//                     message: "recommended movies not found"
//                 })
//             }
//             const recommended = recommendedmovies
//                 .filter(t => t.posterurl && movieIdsOnScreens.includes(t._id.toString()))
//                 .slice(0, 8)
//                 .map(t => ({ id: t._id, posterurl: t.posterurl, title: t.title ,rating:t.rating,language:t.languages,genre:t.genre}));;
// const allowedLanguages = ["Hindi", "English"];

// const comedy = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const crime = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Crime") &&
//     !t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const actionAndAdventure = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     (t.genre.includes("Action") || t.genre.includes("Adventure")) &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));

// const romance = recommendedmovies.filter(t =>
//     t.posterurl &&
//     movieIdsOnScreens.includes(t._id.toString()) &&
//     t.genre.includes("Romance") &&
//     !t.genre.includes("Comedy") &&
//     t.languages.some(lang => allowedLanguages.includes(lang))
// ).slice(0, 8).map(t => ({
//     id: t._id, posterurl: t.posterurl, title: t.title,
//     rating: t.rating, language: t.languages
// }));


//             return res.status(200).json({
//                 message: "latest movies found",
//                 banners, recommended,comedy,romance,actionAndAdventure,crime
//             })

//         } catch (error) {
//             console.error(error.message)
//             return res.status(500).json({
//                 message: "Internal server error while fetching movies"
//             })

//         }



//     }
// }

 // adjust as needed


const Homepage = async function (req, res) {
    try {
        const lang = req.check
            ? (await usermodel.findById(req.user.id).populate("language"))?.language
            : null;

        const userLang = lang || "en"; // fallback

        // Base TMDB URL
        const baseUrl = "https://api.themoviedb.org/3";

        const tmdbRequest = async (endpoint, params = {}) => {
            const url = `${baseUrl}${endpoint}`;
            const response = await axios.get(url, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: `en-${userLang}`, // e.g. en-IN
                    ...params,
                },
            });
            return response.data.results;
        };

        // 1. Trending
        const trending = await tmdbRequest("/trending/movie/week");

        // 2. Popular
        const popular = await tmdbRequest("/movie/popular");

        // 3. Upcoming (coming soon)
        const upcoming = await tmdbRequest("/movie/upcoming");

        // 4. Genre-based
        const genreFilters = {
            comedy: 35,
            action: 28,
            adventure: 12,
            romance: 10749,
            crime: 80,
        };

        const genreRequests = await Promise.all(
            Object.entries(genreFilters).map(([key, genreId]) =>
                tmdbRequest("/discover/movie", {
                    with_genres: genreId,
                    sort_by: "popularity.desc",
                }).then((movies) => ({
                    key,
                    movies,
                }))
            )
        );

        const genreMovies = genreRequests.reduce((acc, { key, movies }) => {
            acc[key] = movies
                .filter((m) => m.poster_path)
                .slice(0, 8)
                .map((m) => ({
                    id: m.id,
                    posterurl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                    title: m.title,
                    rating: m.vote_average,
                    language: m.original_language,
                    genre_ids: m.genre_ids,
                    backdropurl: m.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
                        : null,
                    description: m.overview,
                }));
            return acc;
        }, {});

        // Format trending/popular/upcoming
        const formatMovieList = (list) =>
            list
                .filter((m) => m.backdrop_path)
                .slice(0, 8)
                .map((m) => ({
                    id: m.id,
                    backdropurl: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
                    title: m.title,
                    rating: m.vote_average,
                    language: m.original_language,
                    genre_ids: m.genre_ids,
                    description: m.overview,
                    posterurl: m.poster_path
                        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                        : null,
                }));

        const responsePayload = {
            message: "Latest TMDB movies fetched",
            banners: formatMovieList(trending),
            recommended: formatMovieList(popular),
            comingsoon: formatMovieList(upcoming),
            comedy: genreMovies.comedy,
            romance: genreMovies.romance,
            actionAndAdventure: [...genreMovies.action, ...genreMovies.adventure].slice(0, 8),
            crime: genreMovies.crime,
        };

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error("Error in Homepage:", error.message);
        return res.status(500).json({
            message: "Internal server error while fetching TMDB movies",
        });
    }
};




const searchHandle = async function (req, res) {
  const query = req.query.query?.trim();
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query,
          include_adult: false,
        },
        timeout: 5000, // ⏱ optional timeout
        httpsAgent: new https.Agent({ keepAlive: false }), // 🔌 prevents ECONNRESET
      }
    );

    const movies = tmdbResponse.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      posterurl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    }));

    const theatres = await adminmodel.find({
      theatretitle: { $regex: query, $options: "i" },
    }).select("theatretitle location image");

    return res.status(200).json({ movies, theatres });
  } catch (error) {
    console.error("Search error:", error); // full error
    return res.status(500).json({ message: "Internal server error during search" });
  }
};

module.exports = {
    Homepage,searchHandle
}