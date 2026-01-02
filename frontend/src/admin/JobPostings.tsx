import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { jobPostings as initialJobPostings, JobPosting } from "@/data/mockData";
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
import { CreateJobForm } from "@/components/CreateJobForm";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateJobFormData {
  position: string;
  company: string;
  plan: JobPosting['plan'];
  salaryRange: string;
  status: JobPosting['status'];
}

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState(initialJobPostings);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const navigate = useNavigate();

  const filteredJobs = jobs.filter((job) =>
    job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.hrCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateJob = () => {
    setIsCreateFormOpen(true);
  };

  const handleFormSubmit = (data: CreateJobFormData) => {
    const newJob: JobPosting = {
      id: String(jobs.length + 1),
      position: data.position,
      hrCompany: data.company,
      plan: data.plan,
      salaryRange: data.salaryRange,
      candidatesCount: 0,
      status: data.status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setJobs([...jobs, newJob]);
  };

  const handleViewJob = (job: JobPosting) => {
    navigate(`/job-postings/${job.id}`);
  };

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
          <Button className="gap-2" onClick={handleCreateJob}>
            <Plus className="h-4 w-4" />
            Create Job Posting
          </Button>
        </div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
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
                  <TableCell className="font-medium">{job.position}</TableCell>
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
                      onClick={() => handleViewJob(job)}
                    >
                      <Eye className="h-4 w-4" />
                      View
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

        {/* Mobile Card Layout - Hidden on Desktop */}
        <div className="md:hidden space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No job postings found matching your search.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">{job.position}</h3>
                    <p className="text-xs text-muted-foreground break-words">{job.hrCompany}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 shrink-0"
                    onClick={() => handleViewJob(job)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden xs:inline">View</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <Badge variant="outline" className={planStyles[job.plan]}>
                      {job.plan}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Candidates</p>
                    <p className="font-medium text-foreground">{job.candidatesCount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={`${statusStyles[job.status]} text-xs px-2 py-1`}
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job posting detail is now a separate page at /job-postings/:id */}
        <CreateJobForm
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}