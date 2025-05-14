import axios from 'axios';

/**
 * Central Axios instance.
 * ‑ baseURL comes from NEXT_PUBLIC_API_URL  (falls back to Render URL)
 * ‑ withCredentials = false  (tokens travel via Authorization header)
 */
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL
});

// helper to attach the latest access token
export function setAuthHeader(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export default api;
