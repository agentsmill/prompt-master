import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const { userProfile, updateUserProfile } = useUser() || {};
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  // Initialize theme from user preferences or local storage
  useEffect(() => {
    const initializeTheme = () => {
      // First try to get theme from user profile if logged in
      if (userProfile?.preferences?.theme) {
        setTheme(userProfile.preferences.theme);
      } else {
        // Otherwise try to get from localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Default to system preference
          const prefersDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          setTheme(prefersDarkMode ? "dark" : "light");
        }
      }
      setLoading(false);
    };

    initializeTheme();
  }, [userProfile]);

  // Apply theme to document
  useEffect(() => {
    if (loading) return;

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update user profile if logged in
    if (userProfile && updateUserProfile) {
      updateUserProfile({
        preferences: {
          ...userProfile.preferences,
          theme,
        },
      });
    }
  }, [theme, loading, userProfile, updateUserProfile]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    toggleTheme,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
