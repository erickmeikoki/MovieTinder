import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import MovieCard from "./components/MovieCard";
import Preferences from "./components/Preferences";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  videoUrl?: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  cast?: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

interface VideoResult {
  id: string;
  key: string;
  site: string;
  type: string;
}

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<{
    genres: number[];
    language: string;
    rating: number;
  } | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [showSavedMovies, setShowSavedMovies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preferences) {
      fetchMovies();
    }
  }, [preferences, page]);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching movies with preferences:", preferences);
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            with_genres: preferences?.genres.join("|"),
            "vote_average.gte": preferences?.rating,
            page: page,
            language: preferences?.language || "en-US",
            sort_by: "popularity.desc",
            include_adult: false,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.results && response.data.results.length > 0) {
        const moviesWithDetails = await Promise.all(
          response.data.results.map(async (movie: Movie) => {
            try {
              // Fetch movie details
              const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}`,
                {
                  params: {
                    api_key: import.meta.env.VITE_TMDB_API_KEY,
                    language: preferences?.language || "en-US",
                  },
                }
              );

              // Fetch cast information
              const creditsResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}/credits`,
                {
                  params: {
                    api_key: import.meta.env.VITE_TMDB_API_KEY,
                  },
                }
              );

              // Fetch video/trailer information
              const videoResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}/videos`,
                {
                  params: {
                    api_key: import.meta.env.VITE_TMDB_API_KEY,
                    language: preferences?.language || "en-US",
                  },
                }
              );

              const trailer = videoResponse.data.results?.find(
                (video: VideoResult) =>
                  video.type === "Trailer" && video.site === "YouTube"
              );

              return {
                ...movie,
                ...detailsResponse.data,
                videoUrl: trailer
                  ? `https://www.youtube.com/watch?v=${trailer.key}`
                  : undefined,
                cast: creditsResponse.data.cast.slice(0, 5), // Get only top 5 cast members
              };
            } catch (error) {
              console.error(
                `Error fetching details for movie ${movie.id}:`,
                error
              );
              return movie;
            }
          })
        );

        if (page === 1) {
          setMovies(moviesWithDetails);
        } else {
          setMovies((prevMovies) => [...prevMovies, ...moviesWithDetails]);
        }
      } else {
        console.log("No movies found with current preferences");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", error.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      setSavedMovies([...savedMovies, movies[currentMovieIndex]]);
    }
    setCurrentMovieIndex((prev) => prev + 1);
  };

  const handleSave = () => {
    setSavedMovies([...savedMovies, movies[currentMovieIndex]]);
    setCurrentMovieIndex((prev) => prev + 1);
  };

  const loadMoreMovies = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {!preferences ? (
          <Preferences onComplete={setPreferences} />
        ) : currentMovieIndex < movies.length ? (
          <MovieCard
            movie={movies[currentMovieIndex]}
            onSwipe={handleSwipe}
            onSave={handleSave}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              gap: 2,
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "primary.main",
                    animationDuration: "1.5s",
                  }}
                />
                <Typography variant="h6" color="text.secondary">
                  Finding more movies...
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  No more movies to show!
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={loadMoreMovies}
                    sx={{ mr: 2 }}
                  >
                    Load More Movies
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setPreferences(null)}
                    sx={{ mr: 2 }}
                  >
                    Change Preferences
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowSavedMovies(true)}
                  >
                    View Saved Movies ({savedMovies.length})
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        <Dialog
          open={showSavedMovies}
          onClose={() => setShowSavedMovies(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Your Saved Movies</DialogTitle>
          <DialogContent>
            {savedMovies.length === 0 ? (
              <Typography>No movies saved yet!</Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {savedMovies.map((movie) => (
                  <Box key={movie.id} sx={{ width: 200 }}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                    <Typography variant="subtitle1" noWrap>
                      {movie.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSavedMovies(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default App;
