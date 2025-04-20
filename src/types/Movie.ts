export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  trailer_url?: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  cast?: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
}
