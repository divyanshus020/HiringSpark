import api from "../axios";

export const getAdminStats = () => api.get("/admin/stats");
export const getAllHRs = () => api.get("/admin/hrs");
// export const getHRDetail = (id: string) => api.get(`/admin/hrs/${id}`);
export const getAllJobPostings = () => api.get("/admin/job-postings");
export const getJobPostingDetail = (id: string) => api.get(`/admin/job-postings/${id}`);
export const getAllCandidates = () => api.get("/admin/candidates");
export const getAllPlatforms = () => api.get("/platforms");
export const getHRDetail = (id) => api.get(`/admin/hr/${id}`)
