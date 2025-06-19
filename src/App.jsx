import React, { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTION = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMesssage, setErrorMessage] = useState("");

  const [trendingList, setTrendingList] = useState([]);
  const [trendingIsLoading, setTrendingIsLoading] = useState(false);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState("");


  useDebounce(() => setDebounceSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    try {
      const endPoint = query
        ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const res = await fetch(endPoint, API_OPTION);

      if (!res.ok) throw new Error("Failed to fetch movie data!");

      const data = await res.json();

      console.log(data);

      if (!Array.isArray(data.results)) {
        setErrorMessage("No movie data found!");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (err) {
      console.error(`Error Fetching Movies ${err}`);
      setErrorMessage("Failed to fetch movies. Please try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  const trendingMovieList = async () => {
    setTrendingIsLoading(true);
    try {
      const movies = await getTrendingMovies();

      setTrendingList(movies);
    } catch (err) {
      console.log(`Failed to fetch trending movies list ${err}`);
      setTrendingErrorMessage(err);
    }finally{
      setTrendingIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  useEffect(() => {
    trendingMovieList();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero-image-banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="trending">
          <h2>Trending List</h2>
          {trendingIsLoading ? <Spinner /> : trendingErrorMessage ? <p className="text-red-500">{errorMesssage}</p> :
          trendingList.length > 0 ? <ul>
            {trendingList.map((movie, index) => (
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt="Poster Image"/>
              </li>
            ))}
          </ul> : <p className="text-gray-400">No result found!</p>}
        </section>
        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMesssage ? (
            <p className="text-red-500">{errorMesssage}</p>
          ) : movieList != null ? (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No result found!</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
