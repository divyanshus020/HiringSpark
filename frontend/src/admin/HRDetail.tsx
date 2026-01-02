import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHRDetail } from "../api/admin/admin.api";

export default function HRDetail() {
  const { id } = useParams();
  const [hr, setHr] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getHRDetail(id).then(res => setHr(res.data)).catch(console.error);
  }, [id]);

  if (!hr) return <p>Loading...</p>;

  return <div>{hr.fullName} — {hr.orgName}</div>;
}
