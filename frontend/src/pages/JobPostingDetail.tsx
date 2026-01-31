import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { candidates } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Linkedin, Plus, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSingleJob } from "@/api/hr/jobs.api";
import { toggleJobContactVisibility } from "@/api/admin/admin.api";
import { Switch } from "@/components/ui/switch";


const planStyles = {
    'Premium': 'bg-primary/10 text-primary border-primary/20',
    'Basic': 'bg-secondary text-secondary-foreground border-secondary',
} as const;

const statusStyles = {
    'Engaged': 'bg-primary/10 text-primary border-primary/20',
    'Pending Review': 'bg-warning/10 text-warning border-warning/20',
    'Taken': 'bg-muted text-muted-foreground border-muted',
} as const;

export default function JobPostingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [job, setJob] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const jobCandidates = job ? candidates.filter(c => c.jobTitle === job.jobTitle || c.jobTitle === job.position) : [];

    const [candidateStatuses, setCandidateStatuses] = useState(
        jobCandidates.reduce((acc, c) => ({ ...acc, [c.id]: c.status }), {} as Record<string, string>)
    );

    const [idForVisibility, setIdForVisibility] = useState<string | null>(null);
    const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const res = await getSingleJob(id);
                const jobData = res.data.job || res.data.data || res.data;
                setJob(jobData);
            } catch (error) {
                console.error("Error fetching job details:", error);
                toast({
                    title: "Error",
                    description: "Failed to load job details",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [id, toast]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCandidate, setNewCandidate] = useState({
        name: "",
        email: "",
        phone: "",
        resume: null as File | null,
        initialStatus: "Pending Review" as string,
    });

    if (isLoading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }


    if (!job) {
        return (
            <DashboardLayout title="Job Posting Not Found">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Job posting not found</p>
                    <Button onClick={() => navigate('/job-postings')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Job Postings
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const handleStatusChange = (candidateId: string, newStatus: string) => {
        setCandidateStatuses(prev => ({ ...prev, [candidateId]: newStatus }));
    };

    const handleUploadCandidate = () => {
        if (!newCandidate.name || !newCandidate.email || !newCandidate.phone) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const resumeInfo = newCandidate.resume ? ` (Resume: ${newCandidate.resume.name})` : "";
        toast({
            title: "Candidate Uploaded",
            description: `${newCandidate.name} has been added with status: ${newCandidate.initialStatus}${resumeInfo}`,
        });

        setNewCandidate({ name: "", email: "", phone: "", resume: null, initialStatus: "Pending Review" });
        setIsDialogOpen(false);
    };

    return (
        <DashboardLayout title="HR Accounts">
            <div className="space-y-6">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Candidates
                    </Button>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">{job.position}</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Job Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">POSITION</h4>
                                    <p className="text-foreground">{job.position}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">PLAN TYPE</h4>
                                    <Badge variant="outline" className={planStyles[job.plan]}>
                                        {job.plan}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">SALARY RANGE</h4>
                                    <p className="text-foreground">12-18 LPA</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">POSTED DATE</h4>
                                    <p className="text-foreground">{job.createdAt}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Job Description</h3>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                    {job.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Requirements</h3>
                            <div className="space-y-2">
                                {job.requirements && job.requirements.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {job.requirements.map((req: string, idx: number) => (
                                            <li key={idx} className="text-foreground">{req}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground">No requirements specified</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills && job.skills.length > 0 ? (
                                    job.skills.map((skill: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">{skill}</Badge>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No skills specified</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Availability for Calls</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">Mon-Fri 10am-6pm</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">Weekends by appointment</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Selected Integrations</h3>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="gap-2 px-3 py-1.5">
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </Badge>
                                <Badge variant="outline" className="gap-2 px-3 py-1.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                    </svg>
                                    Naukri
                                </Badge>
                                <Badge variant="outline" className="gap-2 px-3 py-1.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    Indeed
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Candidates for This Job</h3>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Upload Candidate
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Upload Candidate</DialogTitle>
                                    <DialogDescription>
                                        Add a new candidate to this job posting. Fill in their details below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Candidate Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter candidate name"
                                            value={newCandidate.name}
                                            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email"
                                            value={newCandidate.email}
                                            onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={newCandidate.phone}
                                            onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="resume">Resume/CV</Label>
                                        <Input
                                            id="resume"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setNewCandidate({ ...newCandidate, resume: e.target.files?.[0] || null })}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="initialStatus">Initial Status</Label>
                                        <Select
                                            value={newCandidate.initialStatus}
                                            onValueChange={(value) => setNewCandidate({ ...newCandidate, initialStatus: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select initial status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending Review">Pending Review</SelectItem>
                                                <SelectItem value="Engaged">Engaged</SelectItem>
                                                <SelectItem value="Taken">Taken</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUploadCandidate}>
                                        Upload Candidate
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {jobCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex items-center justify-between p-4 border-l-4 border-primary bg-muted/30 rounded"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{candidate.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {candidate.email} | {candidate.hrCompany.includes('9876543210') ? candidate.hrCompany : '+91-9876543210'}
                                    </p>
                                </div>
                                <Select
                                    value={candidateStatuses[candidate.id] || candidate.status}
                                    onValueChange={(value) => handleStatusChange(candidate.id, value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Engaged">Engaged</SelectItem>
                                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                                        <SelectItem value="Taken">Taken</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        {jobCandidates.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No candidates found for this job posting.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
