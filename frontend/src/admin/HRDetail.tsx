import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { hrAccounts, jobPostings, candidates } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const account = hrAccounts.find((a) => String(a.id) === String(id));

  if (!account) {
    return (
      <DashboardLayout title="HR Account">
        <div className="p-6">HR account not found.</div>
      </DashboardLayout>
    );
  }

  const jobsByHR = jobPostings.filter((j) => j.hrCompany === account.company);
  const candidatesByHR = candidates.filter((c) => c.hrCompany === account.company);

  return (
    <DashboardLayout title="HR Accounts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{account.name}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/hr-accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to HR List
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">FULL NAME</p>
              <p className="font-medium text-sm sm:text-base">{account.name}</p>

              <p className="text-xs text-muted-foreground mt-4">COMPANY</p>
              <p className="font-medium text-sm sm:text-base">{account.company}</p>

              <p className="text-xs text-muted-foreground mt-4">ACCOUNT STATUS</p>
              <p className="font-medium text-sm sm:text-base">{account.status}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">EMAIL</p>
              <p className="font-medium text-sm sm:text-base break-all">{account.email}</p>

              <p className="text-xs text-muted-foreground mt-4">JOINED DATE</p>
              <p className="font-medium text-sm sm:text-base">{account.createdAt}</p>

              <p className="text-xs text-muted-foreground mt-4">JOBS POSTED</p>
              <p className="font-medium text-sm sm:text-base">{account.jobsPosted}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Job Postings by This HR</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs sm:text-sm">Position</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Plan</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Posted Date</TableHead>
                <TableHead className="text-xs sm:text-sm text-center">Candidates</TableHead>
                <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsByHR.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-xs sm:text-base">{job.position}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs">{job.plan}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{job.createdAt}</TableCell>
                  <TableCell className="text-center text-xs sm:text-base">{job.candidatesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={() => navigate(`/job-postings/${job.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {jobsByHR.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
                    No job postings for this HR.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Candidates for This HR</h3>
          <div className="space-y-4">
            {candidatesByHR.map((c) => (
              <div key={c.id} className="p-4 border border-border rounded-md">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email} • {c.jobTitle}</p>
              </div>
            ))}
            {candidatesByHR.length === 0 && (
              <p className="text-sm text-muted-foreground">No candidates yet for this HR.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
