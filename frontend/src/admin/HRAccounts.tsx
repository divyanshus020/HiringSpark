import { useEffect, useState } from "react";
import { getAllHRs } from "../api/admin/admin.api";

export default function HRAccounts() {
  const [hrs, setHrs] = useState<any[]>([]);

  useEffect(() => {
    getAllHRs().then(res => {
      setHrs(res.data.hrs || res.data.data || []);
    }).catch(console.error);
  }, []);

  return (
    <>
      {hrs.map(hr => (
        <div key={hr._id}>
          {hr.fullName} — {hr.email}
        </div>
      ))}
    </>
  );
}
