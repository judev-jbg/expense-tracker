import { createContext, useContext, useEffect, useState } from "react";

// Create Theme Context
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("dark"); // Default to dark theme

  useEffect(() => {
    // Get saved theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("expense-app-theme");
    const preferredTheme = savedTheme || "dark";

    setThemeState(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

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

  // Set theme function
  const setTheme = (newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") {
      console.warn("Invalid theme:", newTheme, ". Using dark theme.");
      newTheme = "dark";
    }

    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("expense-app-theme", newTheme);
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
