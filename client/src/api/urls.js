const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nimthara-server.onrender.com";
export const CHECK_AUTH_API_URL = `${API_BASE_URL}/check-auth`;

export const PAPERS_API_URL = `${API_BASE_URL}/papers`;
export const ADD_PAPER_API_URL = `${API_BASE_URL}/add_new_paper`;
export const QTS_API_URL = `${API_BASE_URL}/quotation`;
export const Price_API_URL = `${API_BASE_URL}/price`;
export const ADD_Price_API_URL = `${API_BASE_URL}/rec_new_price`;
export const USER_LOGIN_API_URL = `${API_BASE_URL}/userlogin`;
export const USER_REGISTER_API_URL = `${API_BASE_URL}/userregister`;
export const LOGIN_API_URL = `${API_BASE_URL}/login`;
export const LOGOUT_API_URL = `${API_BASE_URL}/logout`;
