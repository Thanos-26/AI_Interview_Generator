import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

// Helper to decode JWT and get user data
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  /* =========================
     THEME & UI STATE
  ========================= */
  const [darkMode, setDarkMode] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Sync theme with document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  /* =========================
     AUTHENTICATION STATE
  ========================= */
  // Initialize user from localStorage
  const initializeUser = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    // Try to decode from token if user not stored
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          provider: decoded.provider
        };
      }
    }
    return null;
  };

  const [user, setUser] = useState(initializeUser);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /* =========================
     LOGIN FUNCTION
  ========================= */
  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setAuthError("Failed to fetch");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================
     SIGNUP FUNCTION
  ========================= */
  const signup = async (name, email, password) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Auto-login after signup
      await login(email, password);
    } catch (error) {
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setAuthError("Failed to fetch");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN FUNCTION
  ========================= */
  const googleLogin = async (credential) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const res = await fetch("http://localhost:8000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setAuthError("Failed to fetch");
      } else {
        setAuthError(error.message);
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================
     GITHUB LOGIN FUNCTION
  ========================= */
  const githubLogin = async (code) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const res = await fetch("http://localhost:8000/api/auth/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "GitHub login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setAuthError("Failed to fetch");
      } else {
        setAuthError(error.message);
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================
     LOGOUT FUNCTION
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /* =========================
     PERSIST LOGIN ON REFRESH
  ========================= */
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Re-initialize user if not set
      if (!user) {
        const initialUser = initializeUser();
        if (initialUser) {
          setUser(initialUser);
        }
      }
    }
  }, [token]);

  /* =========================
     CONTEXT PROVIDER
  ========================= */
  return (
    <AppContext.Provider
      value={{
        // Theme
        darkMode,
        toggleTheme,

        // UI
        isConfigOpen,
        setIsConfigOpen,

        // Auth
        user,
        token,
        isAuthenticated,
        authLoading,
        authError,
        setAuthError,
        login,
        signup,
        googleLogin,
        githubLogin,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
