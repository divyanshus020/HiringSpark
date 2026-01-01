import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { hrAccounts as initialHRAccounts, HRAccount } from "@/data/mockData";
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
import { AddHRForm } from "@/components/AddHRForm";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<HRAccount['status'], string> = {
  'Active': 'bg-success/10 text-success border-success/20',
  'Pending': 'bg-warning/10 text-warning border-warning/20',
  'Inactive': 'bg-muted text-muted-foreground border-muted',
};

export default function HRAccounts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState(initialHRAccounts);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const navigate = useNavigate();

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddHRAccount = () => {
    setIsAddFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    const newAccount: HRAccount = {
      id: String(accounts.length + 1),
      name: data.name,
      email: data.email,
      company: data.company,
      jobsPosted: 0,
      status: "Pending",
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleViewAccount = (account: HRAccount) => {
    navigate(`/hr-accounts/${account.id}`);
  };

  return (
    <DashboardLayout title="HR Accounts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2" onClick={handleAddHRAccount}>
            <Plus className="h-4 w-4" />
            Add HR Account
          </Button>
        </div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-center">Jobs Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell>{account.company}</TableCell>
                  <TableCell className="text-center">{account.jobsPosted}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[account.status]}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleViewAccount(account)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No HR accounts found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card Layout - Hidden on Desktop */}
        <div className="md:hidden space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No HR accounts found matching your search.
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <div key={account.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">{account.name}</h3>
                    <p className="text-xs text-muted-foreground break-all">{account.email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 shrink-0"
                    onClick={() => handleViewAccount(account)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden xs:inline">View</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium text-foreground break-words">{account.company}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jobs Posted</p>
                    <p className="font-medium text-foreground">{account.jobsPosted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={`${statusStyles[account.status]} text-xs px-2 py-1`}
                  >
                    {account.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* HR detail view is now a separate page at /hr-accounts/:id */}
        <AddHRForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}