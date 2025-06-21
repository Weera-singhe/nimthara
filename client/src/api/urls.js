const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nimthara-server.onrender.com";

export const PAPERS_API_URL = `${API_BASE_URL}/papers`;
export const ADD_PAPER_API_URL = `${API_BASE_URL}/add_new_paper`;
