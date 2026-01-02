import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users as UsersIcon, FileText, Loader2, ExternalLink, Mail, Phone } from 'lucide-react';
import { getCandidatesByJob } from '../../api/hr/candidates.api';
import { getSingleJob } from '../../api/hr/jobs.api';
import { toast } from 'react-toastify';

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) {
        toast.error('No job selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch job details
        const jobResponse = await getSingleJob(jobId);
        if (jobResponse.data.success) {
          setJobDetails(jobResponse.data.job);
        }

        // Fetch candidates for this job
        const candidatesResponse = await getCandidatesByJob(jobId);
        if (candidatesResponse.data.success) {
          setCandidates(candidatesResponse.data.candidates || []);
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

  const handleViewCV = (cvUrl: string) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    } else {
      toast.error('CV not available');
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
            Candidates
          </h1>
          {jobDetails && (
            <p className="text-gray-600 mt-2 text-lg">
              Applications for <span className="font-semibold">{jobDetails.jobTitle}</span>
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
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Experience</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
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
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{candidate.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{candidate.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {candidate.experience || 'Not specified'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">
                            {candidate.status || 'Applied'}
                          </Badge>
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
