import { Movie } from "../types/Movie";

interface TMDBResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  videos?: {
    results: Array<{
      key: string;
    }>;
  };
  genres?: Array<{
    id: number;
    name: string;
  }>;
  genre_ids?: number[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

interface TMDBSimilarResponse {
  results: TMDBResponse[];
}

class MovieServiceClass {
  private async fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
      } catch (error: unknown) {
        lastError =
          error instanceof Error ? error : new Error("Unknown error occurred");
        if (i < retries - 1) {
          // Wait before retrying, using exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 8000))
          );
        }
      }
    }

    throw lastError;
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    try {
      const data = await this.fetchWithRetry<TMDBResponse>(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&append_to_response=videos,credits`
      );

      return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        poster_path: data.poster_path,
        release_date: data.release_date,
        vote_average: data.vote_average,
        runtime: data.runtime,
        trailer_url: data.videos?.results?.[0]?.key
          ? `https://www.youtube.com/watch?v=${data.videos.results[0].key}`
          : undefined,
        genres: data.genres || [],
        cast: data.credits?.cast?.slice(0, 6).map((member: any) => ({
          id: member.id,
          name: member.name,
          character: member.character,
          profile_path: member.profile_path,
        })),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching movie details:", errorMessage);
      throw new Error("Failed to fetch movie details");
    }
  }

  async getSimilarMovies(movieId: number): Promise<Movie[]> {
    try {
      const data = await this.fetchWithRetry<TMDBSimilarResponse>(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      );

      return data.results.slice(0, 6).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genre_ids?.map((id: number) => ({ id, name: "" })) || [],
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching similar movies:", errorMessage);
      throw new Error("Failed to fetch similar movies");
    }
  }
}

export const MovieService = new MovieServiceClass();
