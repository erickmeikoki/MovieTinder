import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
} from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

const getDesignTokens = (mode: ThemeMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#2196f3",
          },
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
        }
      : {
          primary: {
            main: "#90caf9",
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
        }),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
        },
      },
    },
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode as ThemeMode) || "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "*": {
              transition: "background-color 0.3s ease, color 0.3s ease",
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
