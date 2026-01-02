import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { candidates } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const statusStyles = {
    'Engaged': 'bg-primary/10 text-primary border-primary/20',
    'Pending Review': 'bg-warning/10 text-warning border-warning/20',
    'Taken': 'bg-muted text-muted-foreground border-muted',
} as const;

export default function CandidateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const candidate = candidates.find(c => c.id === id);

    if (!candidate) {
        return (
            <DashboardLayout title="Candidate Not Found">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Candidate not found</p>
                    <Button onClick={() => navigate('/candidates')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Candidates
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Candidates">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/candidates')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Candidates
                    </Button>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">{candidate.name}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">FULL NAME</h3>
                            <p className="text-foreground">{candidate.name}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">EMAIL</h3>
                            <p className="text-foreground">{candidate.email}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">JOB TITLE</h3>
                            <p className="text-foreground">{candidate.jobTitle}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">HR COMPANY</h3>
                            <p className="text-foreground">{candidate.hrCompany}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">STATUS</h3>
                            <Badge variant="outline" className={statusStyles[candidate.status]}>
                                {candidate.status}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">APPLIED DATE</h3>
                            <p className="text-foreground">{candidate.appliedAt}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
