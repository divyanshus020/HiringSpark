import { useEffect, useState } from "react";
import { getMyCandidates } from "../api/hr/candidates.api";

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    getMyCandidates().then(res => setCandidates(res.data.candidates || [])).catch(console.error);
  }, []);

  return (
    <>
      {candidates.map(c => (
        <div key={c._id}>{c.name} — {c.email}</div>
      ))}
    </>
  );
}
