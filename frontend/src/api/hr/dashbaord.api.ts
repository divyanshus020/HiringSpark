import api from "../axios";

export const getHrDashboardStats = () =>
  api.get("/dashboard/stats");
