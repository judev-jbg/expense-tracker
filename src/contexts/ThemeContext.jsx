import { createContext, useContext, useEffect, useState } from "react";
import { userPreferencesService } from "../libs/configService";
import { useAuth } from "./AuthContext";

// Create Theme Context
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState("dark"); // Default to dark theme
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      loadInitialTheme();
    }
  }, [user, authLoading]);

  const loadInitialTheme = async () => {
    setIsLoading(true);

    // Get saved theme from localStorage first (for immediate UI update)
    const savedTheme = localStorage.getItem("expense-app-theme") || "dark";
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    // If user is logged in, try to get theme from database
    if (user) {
      try {
        const { data, error } = await userPreferencesService.get();

        if (!error && data?.theme && data.theme !== savedTheme) {
          // Database theme is different from localStorage, use database theme
          setThemeState(data.theme);
          applyTheme(data.theme);
          localStorage.setItem("expense-app-theme", data.theme);
        }
      } catch (error) {
        console.error("Error loading theme from database:", error);
        // Continue with localStorage theme if database fails
      }
    }
    setIsLoading(false);
  };

  // Apply theme to document
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        newTheme === "dark" ? "#121212" : "#ffffff"
      );
    }
  };

  // Set theme function with database sync
  const setTheme = async (newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") {
      console.warn("Invalid theme:", newTheme, ". Using dark theme.");
      newTheme = "dark";
    }

    // Update state and apply immediately
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("expense-app-theme", newTheme);

    // Sync with database if user is logged in
    if (user) {
      try {
        await userPreferencesService.update({ theme: newTheme });
      } catch (error) {
        console.error("Error saving theme to database:", error);
        // Theme still works from localStorage even if database sync fails
      }
    } else {
      console.log("No user logged in, using localStorage theme.");
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Context value
  const value = {
    theme,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
