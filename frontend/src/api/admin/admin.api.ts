import api from "../axios";

export const getAdminStats = () => api.get("/admin/stats");
export const getAllHRs = () => api.get("/admin/hrs");
export const getHRDetail = (id: string) => api.get(`/admin/hrs/${id}`);
export const getJobsByHR = (hrId: string) => api.get(`/admin/hrs/${hrId}/jobs`);
export const getAllJobPostings = () => api.get("/admin/jobs");
export const getJobPostingDetail = (id: string) => api.get(`/jobs/${id}`);
export const getAllCandidates = () => api.get("/admin/candidates");
export const getAllPlatforms = () => api.get("/platforms");
export const deleteHR = (id: string) => api.delete(`/admin/hrs/${id}`);
export const updateJobStatus = (id: string, status: string) => api.put(`/admin/jobs/${id}/status`, { status });
export const deleteJobAdmin = (id: string) => api.delete(`/admin/jobs/${id}`);
