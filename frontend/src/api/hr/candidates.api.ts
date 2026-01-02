import api from "../axios";

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

export const updateCandidateStatus = (id: string, status: string) =>
  api.put(`/candidates/${id}/status`, { status });
