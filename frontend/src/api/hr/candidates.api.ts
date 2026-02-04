import api from "../axios";

export const getSingleCandidate = (id: string) =>
  api.get(`/candidates/${id}`);

export const addCandidate = (formData: FormData) =>

  api.post("/candidates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCandidatesByJob = (jobId: string) =>
  api.get(`/candidates/job/${jobId}`);

export const updateCandidateFeedback = (
  id: string,
  data: { hrFeedback: string }
) =>
  api.put(`/candidates/${id}/feedback`, data);

export const getMyCandidates = () =>
  api.get("/candidates/my-candidates");

export const updateCandidateStatus = (id: string, feedback: string) =>
  api.put(`/candidates/${id}/feedback`, { feedback });

export const bulkUploadCandidates = (jobId: string, resumes: File[]) => {
  const formData = new FormData();
  formData.append("jobId", jobId);
  resumes.forEach((file) => {
    formData.append("resumes", file);
  });
  return api.post("/candidates/bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const reparseCandidate = (id: string) =>
  api.post(`/candidates/${id}/reparse`);

export const getProcessingCandidates = () =>
  api.get("/candidates/status/processing");
