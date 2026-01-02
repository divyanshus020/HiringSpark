import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { jobPostings, JobPosting } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Plus } from "lucide-react";

const statusStyles: Record<JobPosting['status'], string> = {
  'Active': 'bg-success/10 text-success border-success/20',
  'Closed': 'bg-muted text-muted-foreground border-muted',
  'Draft': 'bg-warning/10 text-warning border-warning/20',
};

const planStyles: Record<JobPosting['plan'], string> = {
  'Premium': 'bg-primary/10 text-primary border-primary/20',
  'Basic': 'bg-secondary text-secondary-foreground border-secondary',
};

export default function JobPostings() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredJobs = jobPostings.filter((job) =>
    job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.hrCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Job Postings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by position or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Job Posting
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Position</TableHead>
                  <TableHead>HR Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Candidates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium whitespace-nowrap">{job.position}</TableCell>
                    <TableCell className="text-muted-foreground">{job.hrCompany}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={planStyles[job.plan]}>
                        {job.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{job.candidatesCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[job.status]}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => navigate(`/job-postings/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No job postings found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}