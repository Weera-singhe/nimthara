const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.nimthara.com"
    : "http://localhost:5000");

export const JOBS_API_URL = `${API_BASE_URL}/jobs`;
export const DOC_API_URL = `${API_BASE_URL}/doc`;
export const PAPERS_API_URL = `${API_BASE_URL}/papers`;
export const ESTI_API_URL = `${API_BASE_URL}/esti`;
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
