import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { jobPostings, candidates } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function JobPostingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const job = jobPostings.find((j) => String(j.id) === String(id));

  if (!job) {
    return (
      <DashboardLayout title="Job Posting">
        <div className="p-6">Job posting not found.</div>
      </DashboardLayout>
    );
  }

  const jobCandidates = candidates.filter((c) => c.hrCompany === job.hrCompany);

  const handleProcessPayment = () => {
    toast({ title: "Processing payment", description: "Simulating payment flow..." });
  };

  const handleSend = () => {
    toast({ title: "Notification sent", description: "Notification sent to HR/company." });
  };

  return (
    <DashboardLayout title="Job Postings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold break-words flex-1">{job.position}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/job-postings')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Job Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">POSITION</p>
              <p className="font-medium text-sm sm:text-base">{job.position}</p>

              <p className="text-xs text-muted-foreground mt-4">SALARY RANGE</p>
              <p className="font-medium text-sm sm:text-base">{job.salaryRange ?? "—"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">PLAN TYPE</p>
              <p className="font-medium text-sm sm:text-base">{job.plan}</p>

              <p className="text-xs text-muted-foreground mt-4">POSTED DATE</p>
              <p className="font-medium text-sm sm:text-base">{job.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Candidates for This Job</h3>
          <div className="space-y-4">
            <Button className="mb-4 w-full sm:w-auto">Upload Candidate</Button>
            {jobCandidates.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-md gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base break-words">{c.name}</p>
                  <p className="text-xs text-muted-foreground break-all">{c.email} | {c.appliedAt}</p>
                </div>
                <div className="w-full sm:w-auto">
                  <select className="w-full sm:w-auto p-2 border rounded-md text-xs sm:text-sm">
                    <option>Change Status</option>
                    <option>Pending Review</option>
                    <option>Engaged</option>
                    <option>Taken</option>
                  </select>
                </div>
              </div>
            ))}
            {jobCandidates.length === 0 && (
              <p className="text-sm text-muted-foreground">No candidates for this job yet.</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Status & Actions</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline">{job.status}</Badge>
              </div>
              <div className="w-full sm:w-auto">
                {job.status === "Draft" && (
                  <Button onClick={handleProcessPayment} className="w-full sm:w-auto">Process Payment (Pending)</Button>
                )}
                {job.status === "Active" && (
                  <Button onClick={handleSend} className="w-full sm:w-auto">Send</Button>
                )}
                {job.status === "Closed" && (
                  <Button variant="outline" disabled className="w-full sm:w-auto">Closed</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}