import api from "../axios";

export const getAdminStats = () => api.get("/admin/stats");
export const getAllHRs = () => api.get("/admin/hrs");
export const getAllPlatforms = () => api.get("/platforms");
export const getHRDetail = (id) => api.get(`/admin/hr/${id}`)
