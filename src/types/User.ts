export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    genres: number[];
    language: string;
    rating: number;
    keywords: string[];
  };
}
