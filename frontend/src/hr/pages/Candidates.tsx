import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users as UsersIcon, FileText, FileX, Loader2, ExternalLink, Mail, Phone, Eye, AlertCircle, CheckCircle2, Search as SearchIcon, Lock } from 'lucide-react';


import { CandidateDetailsModal } from '../../components/CandidateDetailsModal';
import { getCandidatesByJob, getMyCandidates, updateCandidateStatus } from '../../api/hr/candidates.api';
import { getSingleJob } from '../../api/hr/jobs.api';
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getFileUrl } from "@/lib/utils";

const ContactIcon = ({ icon: Icon, isLocked }: { icon: any, isLocked: boolean }) => (
  <div className="relative inline-flex">
    <Icon className={`h-4 w-4 ${isLocked ? 'text-gray-300' : 'text-indigo-500'} shrink-0`} />
    {isLocked && (
      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 ring-2 ring-white">
        <Lock className="h-2 w-2 text-orange-500" />
      </div>
    )}
  </div>
);

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobDetails, setJobDetails] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minAtsFilter, setMinAtsFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, minAtsFilter]);

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = (
        (candidate.basicInfo?.fullName || candidate.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.basicInfo?.email || candidate.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === "ALL" || (candidate.hrFeedback || "PENDING") === statusFilter;
      const matchesAts = (candidate.atsScore || 0) >= minAtsFilter;

      return matchesSearch && matchesStatus && matchesAts;
    })
    .sort((a, b) => {
      // Default Sort: Latest Created First
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCandidates = async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);

      let newCandidates = [];

      if (jobId) {
        const candidatesResponse = await getCandidatesByJob(jobId);
        if (candidatesResponse.data.success) {
          newCandidates = candidatesResponse.data.candidates || [];
        }
      } else {
        const candidatesResponse = await getMyCandidates();
        if (candidatesResponse.data.success) {
          newCandidates = candidatesResponse.data.candidates || [];
        }
      }
      setCandidates(newCandidates);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (!isSilent) toast.error(error.response?.data?.message || 'Failed to load candidates');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchCandidates(false);
      // Fetch job details separately
      if (jobId) {
        try {
          const jobResponse = await getSingleJob(jobId);
          if (jobResponse.data.success) {
            setJobDetails(jobResponse.data.job);
          }
        } catch (e) {
          console.log("Error fetching job details", e);
        }
      } else {
        setJobDetails(null);
      }
    };
    initData();
  }, [jobId]);

  // Polling for processing candidates
  useEffect(() => {
    const isProcessing = candidates.some(
      (c) => c.parsingStatus && c.parsingStatus !== 'COMPLETED' && c.parsingStatus !== 'FAILED'
    );

    let intervalId: NodeJS.Timeout;

    if (isProcessing) {
      intervalId = setInterval(() => {
        fetchCandidates(true);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [candidates, jobId]);

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

    try {
      const openUrl = getFileUrl(cvUrl);
      window.open(openUrl, '_blank');
    } catch (err) {
      console.error('Failed to open CV:', err);
      toast.error('Failed to open CV');
    }
  };

  const openCandidateModal = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const getStatusBadge = (candidate: any) => {
    const status = candidate?.parsingStatus || 'PENDING';
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Parsed
          </Badge>
        );
      case 'FAILED':
      case 'MANUAL_REVIEW':
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 w-fit">
              <AlertCircle className="w-3 h-3" /> Requires Manual Review
            </Badge>
            {candidate.parsingStatusMessage && (
              <span className="text-[10px] text-orange-600 font-medium whitespace-normal max-w-[200px]">
                {candidate.parsingStatusMessage}
              </span>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 w-fit">
              <Loader2 className="w-3 h-3 animate-spin" /> Processing {candidate.parsingProgress || 0}%
            </Badge>
            {candidate.parsingStatusMessage && (
              <span className="text-[10px] text-yellow-600 font-medium italic animate-pulse whitespace-normal max-w-[200px]">
                {candidate.parsingStatusMessage}
              </span>
            )}
            <div className="h-1.5 w-full bg-yellow-100 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${candidate.parsingProgress || 0}%` }}
              />
            </div>
          </div>
        );
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
              <>
                {/* Filters and Search Toolbar */}
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
                        <div className="mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">HR Status</div>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin Status</div>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Shortlisted by HB">Shortlisted by HB</SelectItem>
                        <SelectItem value="Engaged">Engaged</SelectItem>
                        <SelectItem value="Taken">Taken</SelectItem>
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

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">#</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Score</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Job Title</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Phone</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCandidates.map((candidate, index) => (
                        <tr
                          key={candidate._id}
                          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">{candidate.basicInfo?.fullName || candidate.name}</div>
                            <div className="mt-1">
                              {getStatusBadge(candidate)}
                            </div>
                            <div className="text-[10px] text-gray-400 max-w-xs truncate mt-1">{candidate.executiveSummary}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`${(candidate.atsScore || 0) > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {candidate.atsScore || 0}%
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-indigo-600">{candidate.jobId?.jobTitle || jobDetails?.jobTitle || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Select
                              value={candidate.hrFeedback || "PENDING"}
                              onValueChange={(value) => handleStatusChange(candidate._id, value)}
                              disabled={candidate.parsingStatus === 'PROCESSING' || candidate.parsingStatus === 'PENDING'}
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">HR Actions</div>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                                <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>

                                <div className="mt-2 mb-1 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin Status (Read Only)</div>
                                <SelectItem value="Pending Review" disabled>Pending Review</SelectItem>
                                <SelectItem value="Shortlisted by HB" disabled>Shortlisted by HB</SelectItem>
                                <SelectItem value="Engaged" disabled>Engaged</SelectItem>
                                <SelectItem value="Taken" disabled>Taken</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <ContactIcon icon={Mail} isLocked={candidate.jobId?.contactDetailsVisible === false} />
                              <div className="relative">
                                <span className={`text-sm ${(candidate.jobId?.contactDetailsVisible === false) ? 'blur-[6px] select-none opacity-25 italic text-gray-400' : ''}`}>
                                  {candidate.basicInfo?.email || candidate.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap">
                              <ContactIcon icon={Phone} isLocked={candidate.jobId?.contactDetailsVisible === false} />
                              <div className="relative">
                                <span className={`text-sm ${(candidate.jobId?.contactDetailsVisible === false) ? 'blur-[4px] select-none opacity-40 italic' : ''}`}>
                                  {candidate.basicInfo?.phone || candidate.phoneNumber || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                onClick={() => openCandidateModal(candidate)}
                                disabled={candidate.parsingStatus === 'PROCESSING' || candidate.parsingStatus === 'PENDING'}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {candidate.jobId?.contactDetailsVisible === false ? (
                                <div className="relative group/resume">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 cursor-not-allowed grayscale bg-gray-50 border-gray-200"
                                    disabled
                                    title="Resume view restricted by admin"
                                  >
                                    <ContactIcon icon={FileText} isLocked={true} />
                                    <span className="sr-only">Resume Locked</span>
                                  </Button>
                                </div>
                              ) : candidate.resumeUrl ? (
                                <div className="relative group/resume">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewCV(candidate.resumeUrl)}
                                    className="gap-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50"
                                    title="View CV"
                                  >
                                    <ContactIcon icon={FileText} isLocked={false} />
                                    <span className="sr-only">View CV</span>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center opacity-40" title="No CV uploaded">
                                  <FileX className="h-4 w-4 text-gray-400" />
                                  <span className="text-[9px] font-bold uppercase tracking-tighter">No CV</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


                {/* Pagination Controls */}
                {
                  totalPages > 1 && (
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
                  )
                }
              </>
            )}
          </CardContent >
        </Card >
      </main >

      <CandidateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
      />
    </div >
  );
};

export default Candidates;
