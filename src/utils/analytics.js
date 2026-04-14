import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const trackPageView = async (page, extra = {}) => {
  try {
    await axios.post(`${API}/analytics/track`, { page, ...extra });
  } catch (e) {
    // Non-critical, ignore
  }
};
