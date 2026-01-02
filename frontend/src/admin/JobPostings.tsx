import { useEffect, useState } from "react";
import { getAllJobPostings } from "../api/admin/admin.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { JobPostingModal } from "../components/JobPostingModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MoreVertical, Eye, MapPin, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export default function JobPostings() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await getAllJobPostings();
      setJobs(res.data.jobs || res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (job: any) => {
    // Transform API data to match JobPostingModal expectations
    const transformedJob = {
      ...job,
      position: job.jobTitle,
      hrCompany: job.companyName,
      status: job.status.charAt(0).toUpperCase() + job.status.slice(1), // capitalize
      candidatesCount: 0, // Placeholder
      createdAt: new Date(job.createdAt).toLocaleDateString(),
      plan: job.plan || 'Basic'
    };
    setSelectedJob(transformedJob);
    setIsDetailModalOpen(true);
  };

  return (
    <DashboardLayout title="Job Postings">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search job title, company or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    Loading job postings...
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    No job postings found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{job.jobTitle}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" /> {job.companyName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {job.userId?.orgName || job.companyName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {job.minExp}-{job.maxExp} years
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          job.status === 'posted'
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(job)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Briefcase className="mr-2 h-4 w-4" /> Manage Posting
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Posting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>

      <JobPostingModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        job={selectedJob}
      />
    </DashboardLayout>
  );
}

// Helper icons mapping
function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
