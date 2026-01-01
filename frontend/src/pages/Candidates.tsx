import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { candidates, Candidate } from "@/data/mockData";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";

const statusStyles: Record<Candidate['status'], string> = {
  'Shortlisted': 'bg-success/10 text-success border-success/20',
  'Engaged': 'bg-primary/10 text-primary border-primary/20',
  'Pending Review': 'bg-warning/10 text-warning border-warning/20',
  'Taken': 'bg-muted text-muted-foreground border-muted',
};

const statusOptions: Candidate['status'][] = ['Shortlisted', 'Engaged', 'Pending Review', 'Taken'];

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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>HR Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                  <TableCell>{candidate.jobTitle}</TableCell>
                  <TableCell>{candidate.hrCompany}</TableCell>
                  <TableCell>
                    <Select
                      value={candidate.status}
                      onValueChange={(value: Candidate['status']) => handleStatusChange(candidate.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <Badge variant="outline" className={statusStyles[candidate.status]}>
                          {candidate.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
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

        {/* Mobile Card Layout - Hidden on Desktop */}
        <div className="md:hidden space-y-3">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates found matching your criteria.
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">{candidate.name}</h3>
                    <p className="text-xs text-muted-foreground break-all">{candidate.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 shrink-0">
                    <Eye className="h-4 w-4" />
                    <span className="hidden xs:inline">View</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Job Title</p>
                    <p className="font-medium text-foreground break-words">{candidate.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">HR Company</p>
                    <p className="font-medium text-foreground break-words">{candidate.hrCompany}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Select
                    value={candidate.status}
                    onValueChange={(value: Candidate['status']) => handleStatusChange(candidate.id, value)}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs border-0 p-0 bg-transparent">
                      <Badge 
                        variant="outline" 
                        className={`${statusStyles[candidate.status]} cursor-pointer px-2 py-1 text-xs`}
                      >
                        {candidate.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}