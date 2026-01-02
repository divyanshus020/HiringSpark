import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { candidates, Candidate } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const statusStyles: Record<Candidate['status'], string> = {
  'Engaged': 'bg-primary/10 text-primary border-primary/20',
  'Pending Review': 'bg-warning/10 text-warning border-warning/20',
  'Taken': 'bg-muted text-muted-foreground border-muted',
};

const statusOptions: Candidate['status'][] = ['Engaged', 'Pending Review', 'Taken'];

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [candidatesList, setCandidatesList] = useState(candidates);

  const filteredCandidates = candidatesList.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (candidateId: string, newStatus: Candidate['status']) => {
    setCandidatesList(prev =>
      prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
    );
  };

  return (
    <DashboardLayout title="Candidates">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <h2 className="text-lg font-semibold text-foreground">All Candidates</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HR Company</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell>{candidate.jobTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[candidate.status]}>
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.hrCompany}</TableCell>
                    <TableCell>
                      <Select
                        value={candidate.status}
                        onValueChange={(value: Candidate['status']) => handleStatusChange(candidate.id, value)}
                      >
                        <SelectTrigger className="w-[150px] h-9">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCandidates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No candidates found matching your criteria.
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