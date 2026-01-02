import { useEffect, useState } from "react";
import { getAllJobs } from "../api/hr/jobs.api";

export default function JobPostings() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    getAllJobs().then(res => setJobs(res.data.jobs)).catch(console.error);
  }, []);

  return (
    <>
      {jobs.map(job => (
        <div key={job._id}>
          {job.jobTitle} — {job.status}
        </div>
      ))}
    </>
  );
}
