import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { hapticFeedback } from "../utils/haptics";

interface Preferences {
  genres: number[];
  language: string;
  rating: number;
  keywords: string[];
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

// Helper function to get base language code
const getBaseLanguageCode = (languageCode: string): string => {
  return languageCode.split("-")[0];
};

// Helper function to get full language code
const getFullLanguageCode = (baseCode: string): string => {
  switch (baseCode) {
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    case "it":
      return "it-IT";
    case "pt":
      return "pt-PT";
    case "ru":
      return "ru-RU";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    case "zh":
      return "zh-CN";
    default:
      return baseCode;
  }
};

const PreferencesPage: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    genres: [],
    language: "en",
    rating: 0,
    keywords: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        genres: user.preferences.genres || [],
        language: getBaseLanguageCode(user.preferences.language),
        rating: user.preferences.rating || 0,
        keywords: user.preferences.keywords || [],
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserPreferences({
        genres: preferences.genres,
        language: getFullLanguageCode(preferences.language),
        rating: preferences.rating,
        keywords: preferences.keywords,
      });
      setSuccess(true);
      hapticFeedback.success();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Preferences
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Language</InputLabel>
              <Select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    language: e.target.value as string,
                  })
                }
                label="Language"
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Preferences updated successfully!
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Save Preferences"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PreferencesPage;
