import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, Briefcase, DollarSign, Calendar, Users } from "lucide-react";

interface JobPostingModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

export function JobPostingModal({ isOpen, onClose, job }: JobPostingModalProps) {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{job.position || job.jobTitle}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4" />
                        {job.hrCompany || job.companyName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status and Basic Info */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{job.minExp}-{job.maxExp} years</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{job.minSalary}-{job.maxSalary} LPA</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant="outline" className={
                            job.status === 'Posted' || job.status === 'posted'
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }>
                            {job.status}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Job Description */}
                    <div>
                        <h3 className="font-semibold mb-2">Job Description</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {job.jobDescription || "No description provided"}
                        </p>
                    </div>

                    {/* Skills Required */}
                    {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-2">Skills Required</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.skillsRequired.map((skill: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Additional Details */}
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Posted On:</span>
                            <p className="font-medium">{job.createdAt || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Candidates:</span>
                            <p className="font-medium flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {job.candidatesCount || 0}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Plan:</span>
                            <p className="font-medium">{job.plan || "Basic"}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Job Type:</span>
                            <p className="font-medium">{job.jobType || "Full-time"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
