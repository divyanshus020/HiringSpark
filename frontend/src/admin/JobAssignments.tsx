import { useEffect, useState } from "react";
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
import { Search, Building2, Calendar, Briefcase, User } from "lucide-react";
// @ts-ignore
import { getAllJobAssignments } from "../api/admin/admin.api";
import { format } from "date-fns";

export default function JobAssignments() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const res = await getAllJobAssignments();
            setAssignments(res.data.assignments || []);
        } catch (error) {
            console.error("Failed to fetch job assignments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(item =>
        item.job?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partner?.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partner?.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Job Assignments">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search job, company or partner..."
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
                                <TableHead>Assigned Partner</TableHead>
                                <TableHead>Assigned Date</TableHead>
                                <TableHead>Job Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                                        Loading assignments...
                                    </TableCell>
                                </TableRow>
                            ) : filteredAssignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                                        No assignments found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-foreground">{assignment.job?.jobTitle}</div>
                                            <div className="text-xs text-muted-foreground">{assignment.job?.location}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Building2 className="h-3 w-3" />
                                                {assignment.job?.companyName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{assignment.partner?.organizationName}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {assignment.partner?.partnerName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {assignment.sharedAt ? format(new Date(assignment.sharedAt), 'MMM dd, yyyy') : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                assignment.job?.status === 'active' ? "bg-green-50 text-green-700 border-green-200" :
                                                    "bg-gray-50 text-gray-700 border-gray-200"
                                            }>
                                                {assignment.job?.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
