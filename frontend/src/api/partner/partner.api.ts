import api from "../axios";

// Partner Authentication
export const partnerRegisterAPI = (formData: FormData) => {
  // Create a separate axios instance for partner routes
  const partnerApi = api;
  // Override the baseURL for this specific call
  return partnerApi.post("/partner/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const partnerLoginAPI = (data: {
  email: string;
  password: string;
}) => api.post("/partner/auth/login", data);

export const getPartnerProfileAPI = () => api.get("/partner/auth/profile");

// Partner Job Management
export const getPartnerJobsAPI = () => api.get("/partner/jobs");

export const getPartnerJobByIdAPI = (jobId: string) => 
  api.get(`/partner/jobs/${jobId}`);

export const applyToJobAPI = (jobId: string, formData: FormData) => 
  api.post(`/partner/jobs/${jobId}/apply`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getPartnerApplicationsAPI = () => api.get("/partner/applications");
