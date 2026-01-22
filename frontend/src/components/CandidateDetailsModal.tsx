import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
    User,
    Mail,
    Phone,
    Linkedin,
    MapPin,
    Briefcase,
    GraduationCap,
    Wrench,
    Award,
    CheckCircle2,
    AlertCircle,
    FileText,
    Target
} from "lucide-react";

interface CandidateDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: any;
}

export const CandidateDetailsModal = ({
    isOpen,
    onClose,
    candidate,
}: CandidateDetailsModalProps) => {
    if (!candidate) return null;

    const {
        basicInfo,
        executiveSummary,
        education = [],
        workExperience = [],
        skills = {},
        aiAssessment,
        atsScore,
        certifications = [],
        parsingStatus
    } = candidate;

    const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-gray-500">{label}:</span>
            <span className="text-gray-900">{value || "N/A"}</span>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] md:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl">
                <DialogHeader className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <User className="h-6 w-6" />
                                {basicInfo?.fullName || candidate.name}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 mt-1">
                                Candidate Profile Analysis
                            </DialogDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium opacity-80 mb-1">ATS Score</div>
                            <div className="text-3xl font-bold">{atsScore || 0}%</div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pb-20">
                        {/* Left Column: Contact & Summary */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-indigo-500" /> Contact Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1 text-sm bg-gray-50 p-2 rounded-md">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <Mail className="h-4 w-4 text-indigo-500 shrink-0" /> Email
                                        </div>
                                        <div className="text-gray-900 break-all pl-6">
                                            {basicInfo?.email || candidate.email || "N/A"}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm bg-gray-50 p-2 rounded-md">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <Phone className="h-4 w-4 text-indigo-500 shrink-0" /> Phone
                                        </div>
                                        <div className="text-gray-900 pl-6">
                                            {basicInfo?.phone || candidate.phoneNumber || "N/A"}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm bg-gray-50 p-2 rounded-md">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <Linkedin className="h-4 w-4 text-indigo-500 shrink-0" /> LinkedIn
                                        </div>
                                        <div className="text-gray-900 break-all pl-6">
                                            {basicInfo?.linkedin ? (
                                                <a href={basicInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {basicInfo.linkedin}
                                                </a>
                                            ) : "N/A"}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm bg-gray-50 p-2 rounded-md">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <MapPin className="h-4 w-4 text-indigo-500 shrink-0" /> Location
                                        </div>
                                        <div className="text-gray-900 pl-6">
                                            {basicInfo?.location || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-indigo-500" /> AI Assessment
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Strengths</p>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            {aiAssessment?.strengths?.map((s: string, i: number) => (
                                                <li key={i} className="flex gap-2 items-start">
                                                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                                                    <span>{s}</span>
                                                </li>
                                            )) || <li className="text-gray-400 italic">No assessment available</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-600 uppercase mb-1">Weaknesses</p>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            {aiAssessment?.weaknesses?.map((w: string, i: number) => (
                                                <li key={i} className="flex gap-2 items-start">
                                                    <AlertCircle className="h-3 w-3 mt-1 text-red-500 shrink-0" />
                                                    <span>{w}</span>
                                                </li>
                                            )) || <li className="text-gray-400 italic">No assessment available</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Experience, Education, Skills */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Executive Summary */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" /> Executive Summary
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {executiveSummary || "No summary provided."}
                                </p>
                            </div>

                            {/* Work Experience */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-indigo-500" /> Work Experience
                                </h3>
                                <div className="space-y-6">
                                    {workExperience.length > 0 ? workExperience.map((exp: any, i: number) => (
                                        <div key={i} className="relative pl-6 border-l-2 border-indigo-100 pb-1 last:pb-0">
                                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-500 border-2 border-white" />
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                                                <h4 className="font-bold text-gray-900 leading-tight">{exp.jobTitle}</h4>
                                                <Badge variant="outline" className="text-[10px] w-fit shrink-0 whitespace-nowrap">{exp.dateRange}</Badge>
                                            </div>
                                            <p className="text-sm font-medium text-indigo-600 mb-2">{exp.company}</p>
                                            <p className="text-sm text-gray-600 leading-snug">{exp.responsibilities}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 italic">No work experience listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-indigo-500" /> Education
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {education.length > 0 ? education.map((edu: any, i: number) => (
                                        <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <h4 className="font-bold text-sm text-gray-900">{edu.degree}</h4>
                                            <p className="text-xs text-indigo-700 font-medium">{edu.institution}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{edu.dateRange}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 italic">No education listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-indigo-500" /> Skills & Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(skills).map(([category, items]: [string, any]) => (
                                        Array.isArray(items) && items.map((skill, si) => (
                                            <Badge key={`${category}-${si}`} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                                                {skill}
                                            </Badge>
                                        ))
                                    ))}
                                    {Object.keys(skills).length === 0 && <p className="text-sm text-gray-400 italic">No skills listed.</p>}
                                </div>
                            </div>

                            {/* Certifications */}
                            {certifications.length > 0 && (
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-indigo-500" /> Certifications
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {certifications.map((cert: string, i: number) => (
                                            <Badge key={i} variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                                {cert}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
