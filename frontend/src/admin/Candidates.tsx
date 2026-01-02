import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/admin/admin.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
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
import { Search, UserCheck, FileText, Mail, Phone, ExternalLink, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

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

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobId?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCV = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('CV not available');
    }
  };

  return (
    <DashboardLayout title="Candidates">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, email or job..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Resume</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {candidate.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{candidate.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {candidate.jobId?.jobTitle || 'General Application'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.addedBy?.fullName || 'Self Applied'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {candidate.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {candidate.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {candidate.status || 'Received'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {candidate.resumeUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleViewCV(candidate.resumeUrl)}
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No File</span>
                      )}
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
