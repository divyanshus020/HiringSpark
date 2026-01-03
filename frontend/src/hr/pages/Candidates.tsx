import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users as UsersIcon, FileText, Loader2, ExternalLink, Mail, Phone } from 'lucide-react';
import { getCandidatesByJob, getMyCandidates, updateCandidateStatus } from '../../api/hr/candidates.api';
import { getSingleJob } from '../../api/hr/jobs.api';
import { toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (jobId) {
          // Fetch candidates for this job
          const candidatesResponse = await getCandidatesByJob(jobId);
          if (candidatesResponse.data.success) {
            setCandidates(candidatesResponse.data.candidates || []);
          }

          // Fetch job details for header
          try {
            const jobResponse = await getSingleJob(jobId);
            if (jobResponse.data.success) {
              setJobDetails(jobResponse.data.job);
            }
          } catch (e) {
            console.log("Error fetching job details", e);
          }
        } else {
          // Fetch all candidates for the current HR
          const candidatesResponse = await getMyCandidates();
          if (candidatesResponse.data.success) {
            setCandidates(candidatesResponse.data.candidates || []);
            setJobDetails(null);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || 'Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast.success("Candidate status updated");
      // Optimistic update
      setCandidates(candidates.map(c =>
        c._id === candidateId ? { ...c, hrFeedback: newStatus } : c
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleViewCV = (cvUrl: string) => {
    if (!cvUrl) {
      toast.error('CV not available');
      return;
    }

    // If backend returned a relative path (e.g. /uploads/resumes/...),
    // open it from the backend host so the browser can fetch the file.
    try {
      const isFullUrl = /^https?:\/\//i.test(cvUrl);
      const backendHost = 'http://localhost:5000';
      const openUrl = isFullUrl ? cvUrl : `${backendHost}${cvUrl}`;
      window.open(openUrl, '_blank');
    } catch (err) {
      console.error('Failed to open CV:', err);
      toast.error('Failed to open CV');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="container py-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent flex items-center gap-3">
            <UsersIcon className="h-10 w-10 text-indigo-600" />
            {jobDetails ? 'Candidates' : 'All Candidates'}
          </h1>
          {jobDetails ? (
            <p className="text-gray-600 mt-2 text-lg">
              Applications for <span className="font-semibold">{jobDetails.jobTitle}</span>
            </p>
          ) : (
            <p className="text-gray-600 mt-2 text-lg">
              Showing candidates from all your job postings
            </p>
          )}
        </div>

        {/* Candidates Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Applicants ({candidates.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
                <p className="text-gray-500">Candidates who apply for this job will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Job Title</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Update Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => (
                      <tr
                        key={candidate._id}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{candidate.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-indigo-600">{candidate.jobId?.jobTitle || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{candidate.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{candidate.phoneNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                            {candidate.hrFeedback || 'Pending Review'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={candidate.hrFeedback || "Pending Review"}
                            onValueChange={(val) => handleStatusChange(candidate._id, val)}
                          >
                            <SelectTrigger className="w-[180px] text-gray-700 border-gray-200 h-8 text-xs font-medium">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending Review">Pending Review</SelectItem>
                              <SelectItem value="Shortlisted by HR">Shortlisted by HR</SelectItem>
                              <SelectItem value="Interviewed">Interviewed</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="Hired">Hired</SelectItem>
                              <SelectItem value="Engaged">Engaged</SelectItem>
                              <SelectItem value="Taken">Taken</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4">
                          {candidate.resumeUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCV(candidate.resumeUrl)}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View CV
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-400">No CV</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Candidates;
