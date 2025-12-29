const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nimthara-server.onrender.com";

export const PAPERS_API_URL = `${API_BASE_URL}/papers`;
export const ADD_PAPER_API_URL = `${API_BASE_URL}/add_new_paper`;

export const QTS_API_URL = `${API_BASE_URL}/quotation`;

export const Price_API_URL = `${API_BASE_URL}/price`;
export const ADD_Price_API_URL = `${API_BASE_URL}/rec_new_price`;

export const Stock_API_URL = `${API_BASE_URL}/stock`;
export const ADD_Stock_API_URL = `${API_BASE_URL}/rec_new_stock`;

export const USER_LOGIN_API_URL = `${API_BASE_URL}/userlogin`;
export const USER_REGISTER_API_URL = `${API_BASE_URL}/userregister`;
export const LOGIN_API_URL = `${API_BASE_URL}/login`;
export const LOGOUT_API_URL = `${API_BASE_URL}/logout`;

export const CUS_API_URL = `${API_BASE_URL}/cus`;
export const ADD_CUS_API_URL = `${API_BASE_URL}/add_new_cus`;

export const GTSCL_API_URL = `${API_BASE_URL}/gts/clients`;
export const ADD_GTSCL_API_URL = `${API_BASE_URL}/gts/add_new_clients`;

export const BB_Audit_API_URL = `${API_BASE_URL}/audit/bb`;
export const LEDG_Audit_API_URL = `${API_BASE_URL}/audit/ledger`;

//////////////////////////////////////

export const JOBS_API_URL = `${API_BASE_URL}/jobs`;
export const DOC_API_URL = `${API_BASE_URL}/doc`;
export const AUTH_API_URL = `${API_BASE_URL}/auth`;
export const ESTI_API_URL = `${API_BASE_URL}/esti`;
