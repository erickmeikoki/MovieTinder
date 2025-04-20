import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  Chip,
  Stack,
  SelectChangeEvent,
} from "@mui/material";

interface PreferencesProps {
  onComplete: (preferences: {
    genres: number[];
    language: string;
    rating: number;
    keywords: string[];
  }) => void;
}

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
  { id: 99, name: "Documentary" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

const Preferences: React.FC<PreferencesProps> = ({ onComplete }) => {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [rating, setRating] = useState<number>(5);
  const [keywords, setKeywords] = useState("");
  const [showKeywords, setShowKeywords] = useState(false);

  const handleGenreChange = (event: SelectChangeEvent<number[]>) => {
    setSelectedGenres(event.target.value as number[]);
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(e.target.value);
  };

  const handleRatingChange = (_event: Event, newValue: number | number[]) => {
    setRating(newValue as number);
  };

  const handleSubmit = () => {
    onComplete({
      genres: selectedGenres,
      rating: rating,
      language: selectedLanguage,
      keywords: keywords
        .trim()
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0),
    });
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Set Your Movie Preferences
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Favorite Genres</InputLabel>
        <Select
          multiple
          value={selectedGenres}
          onChange={handleGenreChange}
          renderValue={(selected) => (
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={genres.find((g) => g.id === value)?.name}
                />
              ))}
            </Stack>
          )}
        >
          {genres.map((genre) => (
            <MenuItem key={genre.id} value={genre.id}>
              {genre.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          label="Language"
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="preferences-section">
        <h3>Keywords/Themes</h3>
        <div className="keywords-input">
          <input
            type="text"
            value={keywords}
            onChange={handleKeywordsChange}
            placeholder="Enter keywords or themes (comma separated)"
            className="keywords-field"
          />
          <button
            className="keywords-toggle"
            onClick={() => setShowKeywords(!showKeywords)}
          >
            {showKeywords ? "Hide Keywords" : "Show Keywords"}
          </button>
        </div>
        {showKeywords && keywords && (
          <div className="keywords-preview">
            <p>Selected keywords:</p>
            <div className="keywords-tags">
              {keywords.split(",").map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Typography gutterBottom>Minimum Rating</Typography>
      <Slider
        value={rating}
        onChange={handleRatingChange}
        valueLabelDisplay="auto"
        min={0}
        max={10}
        step={0.5}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        disabled={selectedGenres.length === 0}
      >
        Start Swiping
      </Button>
    </Box>
  );
};

export default Preferences;
