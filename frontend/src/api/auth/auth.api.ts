import api from "../axios";

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

export const getMeAPI = () => api.get("/auth/me");

export const logoutAPI = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("isAuth");
};
