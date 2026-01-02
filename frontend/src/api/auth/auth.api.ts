import api from "../axios";

export const loginAPI = (data: {
  email: string;
  password: string;
}) => api.post("/auth/login", data);

export const getMeAPI = () => api.get("/auth/me");
