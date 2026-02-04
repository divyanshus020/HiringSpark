import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJobPostingDetail, updateJobStatus, toggleJobContactVisibility } from "../api/admin/admin.api";
import { Switch } from "@/components/ui/switch";

import { getCandidatesByJob, addCandidate, updateCandidateStatus, reparseCandidate } from "../api/hr/candidates.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Linkedin, ExternalLink, Check, X, Eye, Loader2, AlertCircle, CheckCircle2, SearchIcon, Users as UsersIcon, RefreshCcw } from "lucide-react";

import { CandidateDetailsModal } from "@/components/CandidateDetailsModal";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function JobPostingDetail() {
  // All hooks must be called at the top before any conditional returns
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filter, Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minAtsFilter, setMinAtsFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
    initialStatus: "Pending Review" as string,
  });

  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

  const handleReparse = async (candidateId: string) => {
    try {
      await reparseCandidate(candidateId);
      toast({
        title: "Re-Queued",
        description: "Candidate has been sent back for parsing.",
      });
      // Update local state
      setCandidates(candidates.map(c =>
        c._id === candidateId ? {
          ...c,
          parsingStatus: 'PENDING',
          parsingStatusMessage: 'Waiting in queue...',
          parsingProgress: 0
        } : c
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger re-parse.",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {

    if (!id) return;
    setIsLoading(true);
    try {
      const jobRes = await getJobPostingDetail(id);
      // Access the job object correctly from the response
      setJob(jobRes.data.job || jobRes.data.data || jobRes.data);

      const candidatesRes = await getCandidatesByJob(id);
      setCandidates(candidatesRes.data.candidates || []);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details. Showing cached/mock data.",
        variant: "destructive",
      });
      // Fallback to mock data since backend route might be missing
      setJob({
        _id: id,
        jobTitle: "Senior Software Engineer",
        salaryRange: "12-18 LPA",
        planType: "Premium",
        createdAt: new Date().toISOString(),
      });
      // Keep candidates empty or mock them if you want
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, minAtsFilter]);

  // Derived state for Filtering, Sorting, Pagination
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = (
        (candidate.basicInfo?.fullName || candidate.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.basicInfo?.email || candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === "ALL" || (candidate.hrFeedback || "Pending Review") === statusFilter;
      const matchesAts = (candidate.atsScore || 0) >= minAtsFilter;
      return matchesSearch && matchesStatus && matchesAts;
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); // Latest first

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast({
        title: "Status Updated",
        description: "Candidate status has been updated successfully.",
      });
      // Optimistic update or refetch
      setCandidates(candidates.map(c =>
        c._id === candidateId ? { ...c, hrFeedback: newStatus } : c
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleViewCV = (cvUrl: string) => {
    if (!cvUrl || cvUrl === '#') {
      toast({
        title: "Info",
        description: "CV not available or access restricted",
      });
      return;
    }
    try {
      const isFullUrl = /^https?:\/\//i.test(cvUrl);
      const backendHost = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
      const openUrl = isFullUrl ? cvUrl : `${backendHost}${cvUrl}`;
      window.open(openUrl, '_blank');
    } catch (err) {
      console.error('Failed to open CV:', err);
      toast({
        title: "Error",
        description: "Failed to open CV",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    if (!id) return;
    setIsVisibilityLoading(true);
    try {
      const res = await toggleJobContactVisibility(id, checked);
      if (res.data.success) {
        setJob((prev: any) => ({ ...prev, contactDetailsVisible: res.data.contactDetailsVisible }));
        toast({
          title: "Success",
          description: `Contact visibility ${res.data.contactDetailsVisible ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update visibility",
        variant: "destructive",
      });
    } finally {
      setIsVisibilityLoading(false);
    }
  };

  const handleUploadCandidate = async () => {

    // ... existing upload logic remains the same ...
    if (!newCandidate.name || !newCandidate.email || !newCandidate.phone || !id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      // Backend expects these exact field names
      formData.append("name", newCandidate.name);
      formData.append("email", newCandidate.email);
      formData.append("phoneNumber", newCandidate.phone);
      formData.append("jobId", id);
      // optional source for tracking where candidate was added
      formData.append("source", "HR_PORTAL");
      if (newCandidate.resume) {
        formData.append("resume", newCandidate.resume);
      }

      await addCandidate(formData);

      toast({
        title: "Candidate Uploaded",
        description: `${newCandidate.name} has been added successfully.`,
      });

      setNewCandidate({ name: "", email: "", phone: "", resume: null, initialStatus: "Pending Review" });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: "Failed to upload candidate.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Job Details">
        <div className="flex items-center justify-center h-64">
          {/* Simple loader matching design */}
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout title="Job Details">
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-gray-800">Job Posting Not Found</h2>
          <p className="text-gray-500 mt-2">The job posting you are looking for does not exist or has been removed.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/admin/job-postings')}
          >
            Back to Job Postings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate back path and text
  const backPath = location.state?.from || '/admin/job-postings';
  const backText = backPath.includes('hr-accounts') ? 'Back to HR Details' : 'Back to Job Postings';

  // Safe date formatting helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout title="Job Postings">
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {job.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 h-8"
                  onClick={async () => {
                    try {
                      await updateJobStatus(job._id, "active");
                      toast({ title: "Approved", description: "Job is now active." });
                      fetchData();
                    } catch (e) { toast({ title: "Error", description: "Failed to approve", variant: "destructive" }); }
                  }}
                >
                  <Check className="h-4 w-4" /> Approve Job
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 gap-2 h-8 border-red-200"
                  onClick={async () => {
                    try {
                      await updateJobStatus(job._id, "rejected");
                      toast({ title: "Rejected", description: "Job has been rejected." });
                      fetchData();
                    } catch (e) { toast({ title: "Error", description: "Failed to reject", variant: "destructive" }); }
                  }}
                >
                  <X className="h-4 w-4" /> Reject Job
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2 h-9"
                  disabled={job.status !== 'active' && job.status !== 'posted'}
                  title={job.status !== 'active' && job.status !== 'posted' ? "Only active jobs can accept candidates" : ""}
                >
                  <Plus className="h-4 w-4" />
                  Upload Candidate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Candidate</DialogTitle>
                  <DialogDescription>Add a new candidate to this job.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Candidate Name</Label>
                    <Input value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={newCandidate.phone} onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={newCandidate.initialStatus} onValueChange={(val) => setNewCandidate({ ...newCandidate, initialStatus: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                        <SelectItem value="Engaged">Engaged</SelectItem>
                        <SelectItem value="Taken">Taken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Resume (PDF/Doc)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewCandidate({ ...newCandidate, resume: file });
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUploadCandidate}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 gap-2 h-9"
                  disabled={job.status !== 'active' && job.status !== 'posted'}
                >
                  <Plus className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Upload Resumes</DialogTitle>
                  <DialogDescription>Select up to 100 resumes (PDF, DOC, DOCX) to upload and parse.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Select Files (PDF/Doc/Docx)</Label>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 100) {
                          toast({
                            title: "Too many files",
                            description: "Maximum 100 files allowed",
                            variant: "destructive"
                          });
                          return;
                        }
                        if (files.length > 0 && id) {
                          try {
                            toast({ title: "Uploading", description: `Uploading ${files.length} resumes...` });
                            const { bulkUploadCandidates } = await import("../api/hr/candidates.api");
                            await bulkUploadCandidates(id, files);
                            toast({ title: "Success", description: "Resumes uploaded and queued for parsing" });
                            fetchData();
                          } catch (err) {
                            toast({ title: "Error", description: "Bulk upload failed", variant: "destructive" });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button
              onClick={() => navigate(backPath)}
              className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 ml-2"
            >
              ← {backText}
            </button>
          </div>
        </div>

        {/* Prominent Visibility Toggle Banner */}
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900">Candidate Contact Visibility</h3>
              <p className="text-xs text-indigo-700 opacity-80">Control if HR can see candidate email and phone numbers for this job</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-indigo-200">
            <Label htmlFor="contact-visibility-prominent" className="text-sm font-bold text-gray-700 cursor-pointer whitespace-nowrap">
              {job.contactDetailsVisible ? 'Contacts Visible' : 'Contacts Hidden'}
            </Label>
            <Switch
              id="contact-visibility-prominent"
              checked={job.contactDetailsVisible}
              onCheckedChange={handleToggleVisibility}
              disabled={isVisibilityLoading}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Job Info Card */}

        <Card className="border-gray-100 shadow-sm">

          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">{job.jobTitle}</h2>
              <Badge
                variant="outline"
                className={
                  job.status === 'active' || job.status === 'posted'
                    ? "bg-green-50 text-green-700 border-green-200"
                    : job.status === 'pending'
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : job.status === 'rejected'
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {job.status === 'active' || job.status === 'posted' ? 'Active' :
                  job.status === 'pending' ? 'Pending Review' :
                    job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Job Information</h3>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">POSITION</p>
                  <p className="text-gray-900">{job.jobTitle}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">SALARY RANGE</p>
                  <p className="text-gray-900">
                    {job.salaryRange || (job.minSalary && job.maxSalary ? `${job.minSalary / 100000}-${job.maxSalary / 100000} LPA` : "N/A")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-6 md:mt-0">
                <div className="space-y-1">
                  {/* Empty spacer or alignment if needed, or simple margin */}
                  <p className="text-xs font-semibold text-gray-500 uppercase">PLAN TYPE</p>
                  <p className="text-gray-900">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${job.plan === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {job.plan || 'basic'}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">POSTED DATE</p>
                  <p className="text-gray-900">{formatDate(job.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card >

        {/* Availability Card */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Job Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description || 'No description provided'}
              </p>
            </div>
          </CardContent>
        </Card >
        {/* Requirements Card */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Requirements</h3>
            <div className="space-y-2">
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No requirements specified</p>
              )}
            </div>
          </CardContent>
        </Card >

        {/* Skills Card */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill: string, idx: number) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800 hover:bg-blue-200">{skill}</Badge>
                ))
              ) : (
                <p className="text-gray-500">No skills specified</p>
              )}
            </div>
          </CardContent>
        </Card >
        {/* Availability Card */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Availability for Calls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Mon-Fri 10am-6pm</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Weekends by appointment</span>
              </div>
            </div>
          </CardContent>
        </Card >

        {/* Integrations Card */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Selected Integrations</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Naukri</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Indeed</span>
              </div>
            </div>
          </CardContent>
        </Card >

        {/* Candidates Section */}
        < Card className="border-gray-100 shadow-sm" >
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">Candidates for This Job</h3>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No candidates yet</h3>
                <p className="mt-1 text-sm text-gray-500">Upload a candidate to get started.</p>
              </div>
            ) : (
              <>
                {/* Search and Filters Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    <div className="relative w-full md:w-64">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <div className="mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin Status</div>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                        <SelectItem value="Engaged">Engaged</SelectItem>
                        <SelectItem value="Taken">Taken</SelectItem>
                        <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">HR Status</div>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={minAtsFilter.toString()} onValueChange={(val) => setMinAtsFilter(Number(val))}>
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="ATS Score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Scores</SelectItem>
                        <SelectItem value="50">ATS &gt; 50%</SelectItem>
                        <SelectItem value="70">ATS &gt; 70%</SelectItem>
                        <SelectItem value="90">ATS &gt; 90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {paginatedCandidates.length} of {filteredCandidates.length} candidates
                  </div>
                </div>

                <div className="space-y-4">
                  {paginatedCandidates.map((candidate) => (
                    <div key={candidate._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-l-4 border-l-blue-500 bg-white border border-gray-200 rounded shadow-sm gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{candidate.basicInfo?.fullName || candidate.fullName || candidate.name}</p>
                          {/* Parsing Status Badge */}
                          {candidate.parsingStatus === 'COMPLETED' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1 py-0 h-5 gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Parsed
                            </Badge>
                          ) : candidate.parsingStatus === 'FAILED' || candidate.parsingStatus === 'MANUAL_REVIEW' ? (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1 py-0 h-5 gap-1">
                              <AlertCircle className="w-3 h-3" /> Manual Review
                            </Badge>
                          ) : (
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-1 py-0 h-5 gap-1 w-fit">
                                <Loader2 className="w-3 h-3 animate-spin" /> Processing {candidate.parsingProgress}%
                              </Badge>
                              {candidate.parsingStatusMessage && (
                                <span className="text-[9px] text-yellow-600 font-medium italic animate-pulse">
                                  {candidate.parsingStatusMessage}
                                </span>
                              )}
                              <div className="h-1 w-full bg-yellow-100 rounded-full overflow-hidden mt-0.5">
                                <div
                                  className="h-full bg-yellow-400 transition-all duration-500"
                                  style={{ width: `${candidate.parsingProgress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {/* ATS Score Badge */}
                          {(candidate.atsScore !== undefined) && (
                            <Badge className={`text-[10px] px-1 py-0 h-5 ${candidate.atsScore > 70 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}`}>
                              ATS: {candidate.atsScore}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-blue-500 mt-1">
                          {candidate.basicInfo?.email || candidate.email} | {candidate.basicInfo?.phone || candidate.phoneNumber || candidate.phone || 'No Phone'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {candidate.resumeUrl && (
                            <button
                              onClick={() => handleViewCV(candidate.resumeUrl)}
                              className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Resume
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsDetailsModalOpen(true);
                            }}
                            disabled={candidate.parsingStatus === 'PROCESSING' || candidate.parsingStatus === 'PENDING'}
                            className={`flex items-center gap-1 text-xs font-medium ${candidate.parsingStatus !== 'PROCESSING' && candidate.parsingStatus !== 'PENDING' ? 'text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                          </button>
                          {(candidate.parsingStatus === 'FAILED' || candidate.parsingStatus === 'MANUAL_REVIEW' || (candidate.parsingStatus === 'PENDING' && new Date(candidate.createdAt).getTime() < Date.now() - 30000)) && (
                            <button
                              onClick={() => handleReparse(candidate._id)}
                              className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
                              title="Force Re-parse"
                            >
                              <RefreshCcw className="h-3 w-3" />
                              Retry Parsing
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <Select
                          value={candidate.hrFeedback || "Pending Review"}
                          onValueChange={(val) => handleStatusChange(candidate._id, val)}
                        >
                          <SelectTrigger className="w-[180px] text-black  border-gray-200 border-2 h-8 text-xs font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Actions</div>
                            <SelectItem value="Pending Review">Pending Review</SelectItem>
                            <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                            <SelectItem value="Engaged">Engaged</SelectItem>
                            <SelectItem value="Taken">Taken</SelectItem>

                            <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">HR Status (Read Only)</div>
                            <SelectItem value="PENDING" disabled>Pending</SelectItem>
                            <SelectItem value="SHORTLISTED" disabled>Shortlisted</SelectItem>
                            <SelectItem value="INTERVIEW_SCHEDULED" disabled>Interview</SelectItem>
                            <SelectItem value="REJECTED" disabled>Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}

                  {filteredCandidates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No candidates match your search filters.
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm font-medium text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>



      <CandidateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        candidate={selectedCandidate}
        showAllDetails={true}
      />

    </DashboardLayout>

  );
}
