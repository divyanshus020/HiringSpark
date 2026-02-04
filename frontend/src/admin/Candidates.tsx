import { useEffect, useState, useMemo } from "react";
import { getAllCandidates, deleteCandidate } from "../api/admin/admin.api";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { Search, Eye, FileText, Trash2, Building, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
// Imports removed
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateDetailsModal } from "../components/CandidateDetailsModal";

export default function Candidates() {

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCandidates = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await getAllCandidates();
      setCandidates(res.data.candidates || res.data.data || []);
    } catch (error) {
      if (!silent) {
        console.error(error);
        toast.error("Failed to load candidates");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Live updates for parsing status
  useEffect(() => {
    const isProcessing = candidates.some(c =>
      c.parsingStatus === 'PENDING' || c.parsingStatus === 'PROCESSING'
    );

    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => fetchCandidates(true), 3000);
    }
    return () => clearInterval(interval);
  }, [candidates]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast.success("Candidate status updated");
      setCandidates(candidates.map(c =>
        c._id === candidateId ? { ...c, hrFeedback: newStatus } : c
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
      toast.success("Candidate deleted successfully");
      setCandidates(prev => prev.filter(c => c._id !== candidateId));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleViewCV = (cvUrl: string) => {
    if (!cvUrl) {
      toast.error('CV not available');
      return;
    }
    try {
      const isFullUrl = /^https?:\/\//i.test(cvUrl);
      const backendHost = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
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

  // Derive Companies List
  const companies = useMemo(() => {
    const companySet = new Set<string>();
    candidates.forEach(c => {
      const name = c.jobId?.companyName || c.addedBy?.orgName;
      if (name) companySet.add(name);
    });
    return Array.from(companySet).sort();
  }, [candidates]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompany ? (candidate.jobId?.companyName === selectedCompany || candidate.addedBy?.orgName === selectedCompany) : true;

    return matchesSearch && matchesCompany;
  });

  // Row Renderer removed (using Table instead)

  return (
    <DashboardLayout title="Candidates">
      <div className="flex h-[calc(100vh-140px)] gap-4">

        {/* Sidebar for Companies */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 shrink-0 bg-card rounded-lg border border-border flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2"><Building className="h-4 w-4" /> Companies</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            <Button
              variant={selectedCompany === null ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-normal"
              onClick={() => setSelectedCompany(null)}
            >
              <Users className="h-4 w-4 mr-2" /> All Candidates ({candidates.length})
            </Button>
            {companies.map(company => (
              <Button
                key={company}
                variant={selectedCompany === company ? "secondary" : "ghost"}
                className="w-full justify-start text-sm font-normal truncate"
                title={company}
                onClick={() => setSelectedCompany(company)}
              >
                <Building className="h-3 w-3 mr-2 opacity-70" /> {company}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col space-y-4 min-w-0">
          <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} candidates
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col"
          >
            {/* Custom Header */}
            <div className="flex border-b border-border bg-muted/40 font-medium text-sm text-muted-foreground px-4 py-3">
              <div className="flex-1">Name</div>
              <div className="flex-1">Email</div>
              <div className="flex-1">Job</div>
              <div className="flex-1">Status</div>
              <div className="w-[120px] text-right">Actions</div>
            </div>

            {/* Standard Table List */}
            <div className="flex-1 overflow-auto">
              <Table>
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
                        <TableCell className="font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{candidate.name}</span>
                            <div className="flex flex-col gap-1 mt-1">
                              {candidate.parsingStatus === 'COMPLETED' ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-4 px-1 w-fit">Parsed</Badge>
                              ) : candidate.parsingStatus === 'FAILED' || candidate.parsingStatus === 'MANUAL_REVIEW' ? (
                                <div className="flex flex-col gap-0.5">
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] h-4 px-1 w-fit">Manual Review</Badge>
                                  {candidate.parsingStatusMessage && (
                                    <span className="text-[9px] text-orange-600 font-medium leading-tight">
                                      {candidate.parsingStatusMessage}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1 min-w-[100px]">
                                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px] h-4 px-1 animate-pulse w-fit">
                                    Processing {candidate.parsingProgress || 0}%
                                  </Badge>
                                  {candidate.parsingStatusMessage && (
                                    <span className="text-[9px] text-yellow-600 italic font-medium leading-tight">
                                      {candidate.parsingStatusMessage}
                                    </span>
                                  )}
                                  <div className="h-1 w-full bg-yellow-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-yellow-400 transition-all duration-500"
                                      style={{ width: `${candidate.parsingProgress || 0}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{candidate.basicInfo?.email || candidate.email}</TableCell>
                        <TableCell className="text-muted-foreground">{candidate.jobId?.jobTitle || 'N/A'}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(val) => handleStatusChange(candidate._id, val)}
                            value={candidate.hrFeedback || "Pending Review"}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Actions</div>
                              <SelectItem value="Pending Review">Pending Review</SelectItem>
                              <SelectItem value="Shortlisted by HB">Shortlisted/HB</SelectItem>
                              <SelectItem value="Engaged">Engaged</SelectItem>
                              <SelectItem value="Taken">Taken</SelectItem>
                              <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">HR Status</div>
                              <SelectItem value="PENDING" disabled>Pending</SelectItem>
                              <SelectItem value="SHORTLISTED" disabled>Shortlisted</SelectItem>
                              <SelectItem value="INTERVIEW_SCHEDULED" disabled>Interview</SelectItem>
                              <SelectItem value="REJECTED" disabled>Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openCandidateModal(candidate)} className="h-8 w-8 p-0 text-indigo-600"><Eye className="h-4 w-4" /></Button>
                            {candidate.resumeUrl ? (
                              <Button variant="outline" size="sm" onClick={() => handleViewCV(candidate.resumeUrl)} className="h-8 w-8 p-0"><FileText className="h-4 w-4" /></Button>
                            ) : <span className="w-8" />}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete {candidate.name}.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(candidate._id)} className="bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>

      </div>

      <CandidateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
        showAllDetails={true}
      />

    </DashboardLayout>
  );
}
