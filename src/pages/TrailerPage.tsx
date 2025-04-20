import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Container,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  Skeleton,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { Movie } from "../types/Movie";
import { MovieService } from "../services/MovieService";
import ErrorBoundary from "../components/ErrorBoundary";
import { hapticFeedback } from "../utils/haptics";

const MovieDetailsSkeleton = () => (
  <Box sx={{ width: "100%", mt: 4 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      <Box sx={{ flex: "0 0 100%", maxWidth: { xs: "100%", md: "33.333%" } }}>
        <Skeleton variant="rectangular" height={600} animation="wave" />
      </Box>
      <Box sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", md: "66.666%" } }}>
        <Skeleton variant="text" height={60} width="80%" animation="wave" />
        <Skeleton
          variant="text"
          height={30}
          width="40%"
          sx={{ mt: 1 }}
          animation="wave"
        />
        <Box sx={{ my: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={80}
              height={32}
              sx={{ mr: 1, display: "inline-block", borderRadius: 1 }}
              animation="wave"
            />
          ))}
        </Box>
        <Skeleton variant="text" height={100} animation="wave" />
        <Skeleton
          variant="rectangular"
          width={150}
          height={40}
          sx={{ mt: 2 }}
          animation="wave"
        />
      </Box>
    </Box>
  </Box>
);

const TrailerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("No movie ID provided");
      }

      const [movieData, similarData] = await Promise.all([
        MovieService.getMovieDetails(parseInt(id)),
        MovieService.getSimilarMovies(parseInt(id)),
      ]);

      setMovie(movieData);
      setSimilarMovies(similarData);
      hapticFeedback.light();
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading the movie"
      );

      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetchMovieDetails();
        }, Math.min(1000 * Math.pow(2, retryCount), 8000)); // Exponential backoff
      }

      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchMovieDetails();
  };

  if (loading) {
    return <MovieDetailsSkeleton />;
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg">
        <Box my={4}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Box
              sx={{ flex: "0 0 100%", maxWidth: { xs: "100%", md: "33.333%" } }}
            >
              <Paper elevation={3}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: "100%", height: "auto" }}
                />
              </Paper>
            </Box>
            <Box
              sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", md: "66.666%" } }}
            >
              <Typography variant="h3" gutterBottom>
                {movie.title}
              </Typography>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                {new Date(movie.release_date).getFullYear()} • {movie.runtime}{" "}
                min
              </Typography>
              <Box my={2}>
                {movie.genres.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    style={{ marginRight: "8px", marginBottom: "8px" }}
                  />
                ))}
              </Box>
              <Typography variant="body1" paragraph>
                {movie.overview}
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.open(movie.trailer_url, "_blank")}
                >
                  Watch Trailer
                </Button>
              </Box>
            </Box>
          </Box>

          <Box mt={6}>
            <Typography variant="h4" gutterBottom>
              Similar Movies
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {similarMovies.map((similarMovie) => (
                <Box
                  key={similarMovie.id}
                  sx={{
                    flex: "0 0 100%",
                    maxWidth: {
                      xs: "100%",
                      sm: "calc(50% - 1.5rem)",
                      md: "calc(33.333% - 2rem)",
                    },
                  }}
                >
                  <Card>
                    <CardMedia
                      component="img"
                      height="300"
                      image={`https://image.tmdb.org/t/p/w500${similarMovie.poster_path}`}
                      alt={similarMovie.title}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {similarMovie.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(similarMovie.release_date).getFullYear()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/trailer/${similarMovie.id}`)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default TrailerPage;
