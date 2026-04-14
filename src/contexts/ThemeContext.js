import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    fetchTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const fetchTheme = async () => {
    try {
      const { data } = await axios.get(`${API}/site-settings`);
      const t = data?.branding?.theme || 'light';
      setTheme(t);
      setBranding(data?.branding);
    } catch (e) {}
  };

  const refreshTheme = () => fetchTheme();

  return (
    <ThemeContext.Provider value={{ theme, branding, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
