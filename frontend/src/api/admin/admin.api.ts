import api from "../axios";

export const getAdminStats = () => api.get("/admin/dashboard-data");
export const getAllHRs = () => api.get("/admin/hrs");
export const getHRDetail = (id: string) => api.get(`/admin/hrs/${id}`);
export const getJobsByHR = (hrId: string) => api.get(`/admin/hrs/${hrId}/jobs`);
export const getAllJobPostings = () => api.get("/admin/jobs");
export const getJobPostingDetail = (id: string) => api.get(`/jobs/${id}`);
export const getAllCandidates = () => api.get("/admin/candidates");
export const deleteCandidate = (id: string) => api.delete(`/candidates/${id}`);
export const getAllPlatforms = () => api.get("/platforms");
export const deleteHR = (id: string) => api.delete(`/admin/hrs/${id}`);
export const updateJobStatus = (id: string, status: string) => api.put(`/admin/jobs/${id}/status`, { status });
export const deleteJobAdmin = (id: string) => api.delete(`/admin/jobs/${id}`);

// Partner Management APIs
export const getPendingPartners = () => api.get("/admin/partners/pending");
export const getApprovedPartners = () => api.get("/admin/partners/approved");
export const getAllPartners = () => api.get("/admin/partners");
export const getPartnerById = (id: string) => api.get(`/admin/partners/${id}`);
export const approvePartner = (id: string) => api.post(`/admin/partners/${id}/approve`);
export const rejectPartner = (id: string, reason: string) => api.post(`/admin/partners/${id}/reject`, { reason });

