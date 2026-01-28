import api from "../axios";

export const getAdminStats = () => api.get("/hb-admin/dashboard-data");
export const getAllHRs = () => api.get("/hb-admin/hrs");
export const getHRDetail = (id: string) => api.get(`/hb-admin/hrs/${id}`);
export const getJobsByHR = (hrId: string) => api.get(`/hb-admin/hrs/${hrId}/jobs`);
export const getAllJobPostings = () => api.get("/hb-admin/jobs");
export const getJobPostingDetail = (id: string) => api.get(`/jobs/${id}`);
export const getAllCandidates = () => api.get("/hb-admin/candidates");
export const deleteCandidate = (id: string) => api.delete(`/candidates/${id}`);
export const getAllPlatforms = () => api.get("/platforms");
export const deleteHR = (id: string) => api.delete(`/hb-admin/hrs/${id}`);
export const updateJobStatus = (id: string, status: string) => api.put(`/hb-admin/jobs/${id}/status`, { status });
export const deleteJobAdmin = (id: string) => api.delete(`/hb-admin/jobs/${id}`);

// Partner Management APIs

export const getPendingPartners = () => api.get("/hb-admin/partners/pending");
export const getApprovedPartners = () => api.get("/hb-admin/partners/approved");
export const getAllPartners = () => api.get("/hb-admin/partners");
export const getPartnerById = (id: string) => api.get(`/hb-admin/partners/${id}`);
export const approvePartner = (id: string) => api.post(`/hb-admin/partners/${id}/approve`);
export const rejectPartner = (id: string, reason: string) => api.post(`/hb-admin/partners/${id}/reject`, { reason });
export const shareJobWithPartners = (jobId: string, partnerIds: string[]) => api.post(`/hb-admin/job-sharing/${jobId}/share`, { partnerIds });
export const getAllJobAssignments = () => api.get("/hb-admin/job-sharing/assignments");

