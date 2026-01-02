import api from "../axios";

export const createJobDraft = () =>
  api.post("/jobs/draft");

export const updateJobStep1 = (id: string, data: any) =>
  api.put(`/jobs/${id}/step1`, data);

export const updateJobStep2 = (id: string, data: any) =>
  api.put(`/jobs/${id}/step2`, data);

export const updateJobStep3 = (id: string, data: any) =>
  api.put(`/jobs/${id}/step3`, data);

export const updateJobStep4 = (id: string, data: any) =>
  api.put(`/jobs/${id}/step4`, data);

export const postJob = (id: string) =>
  api.put(`/jobs/${id}/post`);

export const getAllJobs = () =>
  api.get("/jobs");

export const getSingleJob = (id: string) =>
  api.get(`/jobs/${id}`);
