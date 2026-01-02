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
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await getAllCandidates();
      setCandidates(res.data.candidates || res.data.data || []);
    } catch (error) {
      console.error(error);
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
        c._id === candidateId ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Shortlisted by HB': return 'secondary'; // using secondary for clean blue look
      case 'Engaged': return 'outline'; // or a custom class
      case 'Taken': return 'default';
      case 'Pending Review': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Shortlisted by HB': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
      case 'Engaged': return 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200';
      case 'Taken': return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
      case 'Pending Review': return 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200';
      default: return '';
    }
  };

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
                <TableHead className="w-[200px]">Actions</TableHead>
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
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.jobId?.jobTitle || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusBadgeClass(candidate.status)}
                      >
                        {candidate.status || 'Pending Review'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.jobId?.companyName || candidate.addedBy?.orgName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(val) => handleStatusChange(candidate._id, val)}
                        defaultValue={candidate.status}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending Review">Pending Review</SelectItem>
                          <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                          <SelectItem value="Engaged">Engaged</SelectItem>
                          <SelectItem value="Taken">Taken</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
