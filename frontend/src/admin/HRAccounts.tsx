import { useEffect, useState } from "react";
import { getAllHRs } from "../api/admin/admin.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { AddHRForm } from "../components/AddHRForm";
import { HRAccountModal } from "../components/HRAccountModal";
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
import { Search, UserPlus, MoreVertical, Eye, Mail, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export default function HRAccounts() {
  const [hrs, setHrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedHR, setSelectedHR] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchHRs = async () => {
    setIsLoading(true);
    try {
      const res = await getAllHRs();
      setHrs(res.data.hrs || res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const filteredHRs = hrs.filter(hr =>
    hr.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.orgName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (hr: any) => {
    // Transform API data to match component expectations if needed
    const transformedHR = {
      ...hr,
      name: hr.fullName,
      company: hr.orgName,
      status: hr.isActive ? "Active" : "Inactive",
      jobsPosted: 0, // Placeholder
      createdAt: new Date(hr.createdAt).toLocaleDateString()
    };
    setSelectedHR(transformedHR);
    setIsDetailModalOpen(true);
  };

  return (
    <DashboardLayout title="HR Accounts">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search HR name, email or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddFormOpen(true)} className="gap-2 w-full sm:w-auto">
            <UserPlus className="h-4 w-4" />
            Add HR Account
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
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    Loading HR accounts...
                  </TableCell>
                </TableRow>
              ) : filteredHRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    No HR accounts found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHRs.map((hr) => (
                  <TableRow key={hr._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">{hr.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{hr.email}</TableCell>
                    <TableCell className="text-muted-foreground">{hr.orgName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={hr.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
                      >
                        {hr.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(hr.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => handleViewDetails(hr)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
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

      <AddHRForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={fetchHRs}
      />

      <HRAccountModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        account={selectedHR}
      />
    </DashboardLayout>
  );
}
