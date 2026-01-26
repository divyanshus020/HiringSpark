import { useEffect, useState } from "react";
// @ts-ignore
import { getAllJobPostings, updateJobStatus, deleteJobAdmin, getAllPartners, shareJobWithPartners } from "../api/admin/admin.api";
import { toast } from "react-toastify";
import { Check, X, Trash2 } from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
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
import { Search, MapPin, Building2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobPostings() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToShare, setJobToShare] = useState<string | null>(null);

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
    navigate(`/admin/job-postings/${job._id}`);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateJobStatus(id, "active");
      toast.success("Job approved successfully");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to approve job");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateJobStatus(id, "rejected");
      toast.success("Job rejected");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to reject job");
    }
  };

  const handleDelete = async (id: string) => {
    setJobToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleteDialogOpen(false);
    try {
      await deleteJobAdmin(jobToDelete);
      toast.success("Job deleted");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setJobToDelete(null);
    }
  };

  const pendingCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <DashboardLayout title={
      <div className="flex items-center gap-3">
        Job Postings
        {pendingCount > 0 && (
          <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            {pendingCount} Pending
          </span>
        )}
      </div>
    }>
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

        <div className="bg-card rounded-lg border border-border overflow-hidden">
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
                          job.status === 'active' || job.status === 'posted'
                            ? "bg-green-50 text-green-700 border-green-200"
                            : job.status === 'pending'
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : job.status === 'rejected'
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {job.status === 'active' || job.status === 'posted' ? 'Active' :
                          job.status === 'pending' ? 'Pending Review' :
                            job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(job._id)}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(job._id)}
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(job._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white h-8"
                          onClick={() => handleViewDetails(job)}
                        >
                          View
                        </Button>
                        {/* Share Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          onClick={() => setJobToShare(job._id)}
                          title="Share with Partner"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This will remove all associated candidates and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareJobDialog
        jobId={jobToShare}
        isOpen={!!jobToShare}
        onClose={() => setJobToShare(null)}
      />
    </DashboardLayout>
  );
}

// Share Job Dialog Component
function ShareJobDialog({ jobId, isOpen, onClose }: { jobId: string | null; isOpen: boolean; onClose: () => void }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
      setSelectedPartners([]); // Reset selection on open
    }
  }, [isOpen]);

  const fetchPartners = async () => {
    try {
      const res = await getAllPartners();
      console.log(res.data.partners);
      // Ensure unique partners by ID
      const uniquePartners = Array.from(new Map((res.data.partners || []).map((item: any) => [item._id, item])).values());
      setPartners(uniquePartners);
    } catch (error) {
      console.error("Failed to fetch partners", error);
    }
  };

  const handleTogglePartner = (partnerId: string) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleShare = async () => {
    if (!jobId || selectedPartners.length === 0) return;
    setIsLoading(true);
    try {
      await shareJobWithPartners(jobId, selectedPartners);
      toast.success(`Job shared with ${selectedPartners.length} partner(s) successfully`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to share job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Share Job with Partners</AlertDialogTitle>
          <AlertDialogDescription>
            Select PartnerHB users to list this job on their board.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
            {partners.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">No approved partners found.</div>
            ) : (
              partners.map(p => (
                <div key={p._id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => handleTogglePartner(p._id)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedPartners.includes(p._id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {selectedPartners.includes(p._id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{p.organizationName}</div>
                    <div className="text-xs text-gray-500">{p.partnerName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {selectedPartners.length} partner(s) selected
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleShare} disabled={selectedPartners.length === 0 || isLoading}>
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// End of component
