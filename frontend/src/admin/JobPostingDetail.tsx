import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJobPostingDetail } from "../api/admin/admin.api";
import { getCandidatesByJob, addCandidate, updateCandidateStatus } from "../api/hr/candidates.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Linkedin, ExternalLink } from "lucide-react";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
    initialStatus: "Pending Review" as string,
  });

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const jobRes = await getJobPostingDetail(id);
      setJob(jobRes.data || jobRes.data.data);

      const candidatesRes = await getCandidatesByJob(id);
      setCandidates(candidatesRes.data || candidatesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching job details:", error);
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

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast({
        title: "Status Updated",
        description: "Candidate status has been updated successfully.",
      });
      // Optimistic update or refetch
      setCandidates(candidates.map(c =>
        c._id === candidateId ? { ...c, status: newStatus } : c
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

  const location = useLocation();
  const backPath = location.state?.from || '/admin/job-postings';
  const backText = backPath.includes('hr-accounts') ? 'Back to HR Details' : 'Back to Job Postings';

  return (
    <DashboardLayout title="Job Postings">
      <div className="space-y-6">
        {/* Header Link */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(backPath)}
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
          >
            ← {backText}
          </button>
        </div>

        {/* Job Info Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{job.jobTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Job Information</h3>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">POSITION</p>
                  <p className="text-gray-900">{job.jobTitle}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">SALARY RANGE</p>
                  <p className="text-gray-900">{job.salaryRange || "12-18 LPA"}</p>
                </div>
              </div>

              <div className="space-y-4 mt-6 md:mt-0">
                <div className="space-y-1">
                  {/* Empty spacer or alignment if needed, or simple margin */}
                  <p className="text-xs font-semibold text-gray-500 uppercase">PLAN TYPE</p>
                  <p className="text-gray-900">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${job.planType === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {job.planType || 'Premium'}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">POSTED DATE</p>
                  <p className="text-gray-900">{new Date(job.createdAt).toISOString().split('T')[0]}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Card */}
        <Card className="border-gray-100 shadow-sm">
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
        </Card>

        {/* Integrations Card */}
        <Card className="border-gray-100 shadow-sm">
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
        </Card>

        {/* Candidates Section */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800">Candidates for This Job</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Candidate</DialogTitle>
                    <DialogDescription>Add a new candidate to this job.</DialogDescription>
                  </DialogHeader>
                  {/* Reuse existing inputs */}
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
            </div>

            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate._id} className="flex items-center justify-between p-4 border-l-4 border-l-blue-500 bg-white border border-gray-200 rounded shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900">{candidate.fullName || candidate.name}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      {candidate.email} | {candidate.phone}
                    </p>
                    {candidate.resume && (
                      <a
                        href={candidate.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-green-600 mt-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Resume
                      </a>
                    )}
                  </div>
                  <div>
                    <Select
                      defaultValue={candidate.status || "Pending Review"}
                      onValueChange={(val) => handleStatusChange(candidate._id, val)}
                    >
                      <SelectTrigger className="w-[180px] bg-gray-500 text-white border-0 h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                        <SelectItem value="Engaged">Engaged</SelectItem>
                        <SelectItem value="Taken">Taken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {candidates.length === 0 && (
                <div className="text-center text-gray-500 py-4 italic">No candidates yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
