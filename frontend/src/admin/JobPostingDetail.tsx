import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleJob } from "../api/hr/jobs.api";

export default function JobPostingDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getSingleJob(id).then(res => setJob(res.data)).catch(console.error);
  }, [id]);

  if (!job) return <p>Loading...</p>;

  return <div>{job.jobTitle}</div>;
}
