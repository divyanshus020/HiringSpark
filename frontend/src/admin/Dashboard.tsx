import { useEffect, useState } from "react";
import { getAdminStats } from "../api/admin/admin.api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminStats().then(res => {
      setStats(res.data.data || res.data);
    }).catch(console.error);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <>
      <p>Total HRs: {stats.totalHRs}</p>
      <p>Total Jobs: {stats.totalJobs}</p>
      <p>Total Candidates: {stats.totalCandidates}</p>
    </>
  );
}
