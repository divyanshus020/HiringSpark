import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { hrAccounts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { jobPostings } from "@/data/mockData";

const statusStyles = {
    'Active': 'bg-success/10 text-success border-success/20',
    'Pending': 'bg-warning/10 text-warning border-warning/20',
    'Inactive': 'bg-muted text-muted-foreground border-muted',
} as const;

export default function HRAccountDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const account = hrAccounts.find(acc => acc.id === id);

    if (!account) {
        return (
            <DashboardLayout title="HR Account Not Found">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">HR Account not found</p>
                    <Button onClick={() => navigate('/hr-accounts')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to HR Accounts
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const accountJobs = jobPostings.filter(job => job.hrCompany === account.company);

    return (
        <DashboardLayout title="HR Accounts">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/hr-accounts')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to HR List
                    </Button>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">{account.name}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">FULL NAME</h3>
                            <p className="text-foreground">{account.name}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">EMAIL</h3>
                            <p className="text-foreground">{account.email}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">COMPANY</h3>
                            <p className="text-foreground">{account.company}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">PHONE</h3>
                            <p className="text-foreground">+91-9876543210</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">ACCOUNT STATUS</h3>
                            <Badge variant="outline" className={statusStyles[account.status]}>
                                {account.status}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">JOINED DATE</h3>
                            <p className="text-foreground">{account.createdAt}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Job Postings by This HR</h3>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Position</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Posted Date</TableHead>
                                    <TableHead className="text-center">Candidates</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountJobs.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">{job.position}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={job.plan === 'Premium' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-secondary-foreground border-secondary'}>
                                                {job.plan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{job.createdAt}</TableCell>
                                        <TableCell className="text-center">{job.candidatesCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/job-postings/${job.id}`)}
                                            >
                                                View Job
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {accountJobs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No job postings found for this HR account.
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
