import { useEffect, useState } from "react";
import { getAllPartners, getPendingPartners, getApprovedPartners, approvePartner, rejectPartner } from "../api/admin/admin.api";
import { toast } from "react-toastify";
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
import { Search, MoreVertical, Eye, CheckCircle, XCircle, FileText, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Partners() {
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const [partnerToReject, setPartnerToReject] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const fetchPartners = async (tab: string = activeTab) => {
        setIsLoading(true);
        try {
            let res;
            if (tab === "pending") {
                res = await getPendingPartners();
            } else if (tab === "approved") {
                res = await getApprovedPartners();
            } else {
                res = await getAllPartners();
            }
            setPartners(res.data.partners || res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch partners");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [activeTab]);

    const filteredPartners = partners.filter(partner =>
        partner.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = async (id: string) => {
        try {
            await approvePartner(id);
            toast.success("Partner approved successfully");
            fetchPartners();
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve partner");
        }
    };

    const handleReject = (partner: any) => {
        setPartnerToReject(partner);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (!partnerToReject) return;
        try {
            await rejectPartner(partnerToReject._id, rejectionReason || "Does not meet criteria");
            toast.success("Partner rejected");
            setIsRejectDialogOpen(false);
            setRejectionReason("");
            fetchPartners();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject partner");
        } finally {
            setPartnerToReject(null);
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending Request</Badge>;
        }
    };

    return (
        <>
            <DashboardLayout title="Partner Management">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <Tabs
                            defaultValue="all"
                            className="w-full md:w-auto"
                            onValueChange={setActiveTab}
                        >
                            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                                <TabsTrigger value="all">All Partners</TabsTrigger>
                                <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                                <TabsTrigger value="approved">Approved</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search partner, company, or email..."
                                className="pl-10 h-10 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Partner Details</TableHead>
                                    <TableHead className="font-semibold">Organization</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Applied On</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <span className="text-muted-foreground animate-pulse">Loading partners...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPartners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="h-8 w-8 opacity-20" />
                                                <span>No partners found.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPartners.map((partner) => (
                                        <TableRow key={partner._id} className="hover:bg-muted/30 transition-colors group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{partner.partnerName}</span>
                                                    <span className="text-xs text-muted-foreground">{partner.email}</span>
                                                    <span className="text-xs text-muted-foreground">{partner.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{partner.organizationName}</span>
                                            </TableCell>
                                            <TableCell>
                                                {statusBadge(partner.status)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(partner.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {partner.resumeUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 hidden md:flex"
                                                            onClick={() => window.open(`http://localhost:5000${partner.resumeUrl}`, '_blank')}
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Resume
                                                        </Button>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Manage Partner</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem onClick={() => window.open(`http://localhost:5000${partner.resumeUrl}`, '_blank')}>
                                                                <Eye className="mr-2 h-4 w-4 text-blue-500" /> View Resume
                                                            </DropdownMenuItem>

                                                            {partner.status === 'pending' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleApprove(partner._id)}>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve Partner
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleReject(partner)}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject Partner
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            {partner.status === 'rejected' && (
                                                                <DropdownMenuItem onClick={() => handleApprove(partner._id)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve Instead
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-muted-foreground text-xs italic">
                                                                ID: {partner._id.substring(0, 8)}...
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </motion.div>
                </div>
            </DashboardLayout>

            <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Partner Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting <strong>{partnerToReject?.partnerName}</strong> from <strong>{partnerToReject?.organizationName}</strong>.
                            An email will be sent to them automatically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="e.g. Incomplete documentation, low experience..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setRejectionReason(""); setPartnerToReject(null); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmReject}
                            disabled={!rejectionReason}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Reject Partner
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
