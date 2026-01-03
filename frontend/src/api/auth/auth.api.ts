import api from "../axios";

// HR Authentication
export const registerAPI = (data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  companyName: string;
  address: string;
}) => api.post("/auth/register", data);

export const loginAPI = (data: {
  email: string;
  password: string;
}) => api.post("/auth/login", data);

// Admin Authentication
export const adminLoginAPI = (data: {
  email: string;
  password: string;
}) => api.post("/auth/admin/login", data);

export const adminRegisterAPI = (data: {
  fullName: string;
  email: string;
  password: string;
}) => api.post("/auth/admin/register", data);

// Common
export const getMeAPI = () => api.get("/auth/me");

export const logoutAPI = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("isAuth");
};
