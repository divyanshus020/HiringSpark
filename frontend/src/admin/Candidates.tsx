import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/admin/admin.api";
import { updateCandidateStatus } from "../api/hr/candidates.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button
import { Search, Eye, FileText } from "lucide-react"; // Import Icons
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateDetailsModal } from "../components/CandidateDetailsModal"; // Import Modal

export default function Candidates() {

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await getAllCandidates();
      setCandidates(res.data.candidates || res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast.success("Candidate status updated");
      // Optimistic update
      setCandidates(candidates.map(c =>
        c._id === candidateId ? { ...c, hrFeedback: newStatus } : c
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleViewCV = (cvUrl: string) => {
    if (!cvUrl) {
      toast.error('CV not available');
      return;
    }
    // Handle CV open logic (same as HR)
    try {
      const isFullUrl = /^https?:\/\//i.test(cvUrl);
      const backendHost = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const openUrl = isFullUrl ? cvUrl : `${backendHost}${cvUrl}`;
      window.open(openUrl, '_blank');
    } catch (err) {
      console.error('Failed to open CV:', err);
      toast.error('Failed to open CV');
    }
  };

  const openCandidateModal = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Candidates">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HR Company</TableHead>
                <TableHead className="w-[200px] sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    Loading candidates...
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    No candidates found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{candidate.name}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.basicInfo?.email || candidate.email}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.jobId?.jobTitle || 'N/A'}</TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(val) => handleStatusChange(candidate._id, val)}
                        value={candidate.hrFeedback || "Pending Review"}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Actions</div>
                          <SelectItem value="Pending Review">Pending Review</SelectItem>
                          <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                          <SelectItem value="Engaged">Engaged</SelectItem>
                          <SelectItem value="Taken">Taken</SelectItem>

                          <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">HR Status (Read Only)</div>
                          <SelectItem value="PENDING" disabled>Pending</SelectItem>
                          <SelectItem value="SHORTLISTED" disabled>Shortlisted</SelectItem>
                          <SelectItem value="INTERVIEW_SCHEDULED" disabled>Interview</SelectItem>
                          <SelectItem value="REJECTED" disabled>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.jobId?.companyName || candidate.addedBy?.orgName || 'N/A'}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          onClick={() => openCandidateModal(candidate)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {candidate.resumeUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCV(candidate.resumeUrl)}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View CV</span>
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">No CV</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>

      <CandidateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
      />
    </DashboardLayout>
  );
}
