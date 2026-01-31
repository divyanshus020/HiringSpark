import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Mail, Phone, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { getSingleCandidate } from "@/api/hr/candidates.api";
import { useToast } from "@/hooks/use-toast";

const statusStyles = {
    'Engaged': 'bg-primary/10 text-primary border-primary/20',
    'Pending Review': 'bg-warning/10 text-warning border-warning/20',
    'Taken': 'bg-muted text-muted-foreground border-muted',
    'INTERVIEW_SCHEDULED': 'bg-blue-100 text-blue-700 border-blue-200',
    'HIRED': 'bg-green-100 text-green-700 border-green-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200',
    'SHORTLISTED': 'bg-purple-100 text-purple-700 border-purple-200',
} as const;

export default function CandidateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [candidate, setCandidate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const res = await getSingleCandidate(id);
                setCandidate(res.data.candidate);
            } catch (error: any) {
                console.error("Error fetching candidate:", error);
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Failed to load candidate details",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandidate();
    }, [id, toast]);

    if (isLoading) {
        return (
            <DashboardLayout title="Loading Candidate...">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

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

    const isContactVisible = candidate.jobId?.contactDetailsVisible !== false;

    const BlurredField = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
        <div className="relative group">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 items-center flex gap-2">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </h3>
            <div className={`relative rounded-md transition-all duration-300 ${!isContactVisible ? 'select-none' : ''}`}>
                <p className={`text-foreground ${!isContactVisible ? 'blur-[5px] opacity-40' : ''}`}>
                    {value}
                </p>
                {!isContactVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/5 rounded-md backdrop-blur-[2px]">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/90 rounded border border-border/50 shadow-sm animate-in fade-in zoom-in duration-300">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground tracking-tight">HIDDEN BY ADMIN</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

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

                <div className="bg-card rounded-lg border border-border p-6 overflow-hidden relative">
                    {!isContactVisible && (
                        <div className="absolute top-4 right-6 animate-pulse">
                            <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20 gap-1.5 py-1">
                                <Lock className="h-3.5 w-3.5" />
                                Contact Details Locked
                            </Badge>
                        </div>
                    )}

                    <h2 className="text-xl font-semibold text-foreground mb-6">{candidate.name}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name</h3>
                            <p className="text-foreground font-medium">{candidate.name}</p>
                        </div>

                        <BlurredField label="EMAIL" value={candidate.email} icon={Mail} />

                        <BlurredField label="PHONE NUMBER" value={candidate.phoneNumber || candidate.basicInfo?.phone || '+91-XXXXXXXXXX'} icon={Phone} />

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">JOB TITLE</h3>
                            <p className="text-foreground">{candidate.jobId?.jobTitle || candidate.jobTitle}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">HR COMPANY</h3>
                            <p className="text-foreground">{candidate.uploaderDetails?.organizationName || candidate.hrCompany || 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">STATUS</h3>
                            <Badge
                                variant="outline"
                                className={statusStyles[candidate.hrFeedback as keyof typeof statusStyles] || statusStyles['Pending Review']}
                            >
                                {candidate.hrFeedback || 'Pending Review'}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">APPLIED DATE</h3>
                            <p className="text-foreground">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {!isContactVisible && (
                        <div className="mt-8 p-4 bg-muted/30 border border-dashed border-border rounded-lg flex flex-col items-center text-center">
                            <div className="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h4 className="font-semibold text-foreground">Contact Details Hidden</h4>
                            <p className="text-sm text-muted-foreground max-w-md mt-1">
                                The administrator has restricted access to this candidate's contact information.
                                Please contact the admin if you need to reach out to the candidate.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

