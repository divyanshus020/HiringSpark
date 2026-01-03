import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHRDetail, getJobsByHR } from "../api/admin/admin.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const statusStyles = {
  'Active': 'bg-green-50 text-green-700 border-green-200',
  'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Inactive': 'bg-red-50 text-red-700 border-red-200',
} as const;

export default function HRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hr, setHr] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const hrRes = await getHRDetail(id);
        console.log(hrRes.data.hr);
        const hrData = hrRes.data.hr || hrRes.data.data;
        setHr(hrData);

        // Fetch jobs for this specific HR (including drafts)
        const jobsRes = await getJobsByHR(id);
        console.log(jobsRes.data.jobs);
        setJobs(jobsRes.data.jobs || []);

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout title="HR Details">
        <div className="flex items-center justify-center h-64">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!hr) {
    return (
      <DashboardLayout title="HR Account Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">HR Account not found</p>
          <Button onClick={() => navigate('/admin/hr-accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HR Accounts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hrStatus = hr.isActive ? 'Active' : 'Inactive';

  return (
    <DashboardLayout title="HR Accounts">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">{hr.fullName}</h2>
          <button
            onClick={() => navigate('/admin/hr-accounts')}
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
          >
            ← Back to HR List
          </button>
        </div>

        {/* Account Info Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-2">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">FULL NAME</h4>
                  <p className="text-gray-900 font-medium">{hr?.fullName || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">COMPANY</h4>
                  <p className="text-gray-900 font-medium">{hr?.orgName || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">ACCOUNT STATUS</h4>
                  <p className="text-gray-900 font-medium">{hrStatus}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">EMAIL</h4>
                  <p className="text-gray-900 font-medium">{hr?.email || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">PHONE</h4>
                  <p className="text-gray-900 font-medium">{hr?.phone || "+91-9876543210"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">JOINED DATE</h4>
                  <p className="text-gray-900 font-medium">{hr?.createdAt ? new Date(hr.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Postings Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Job Postings by This HR</h3>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                    <TableHead className="font-semibold text-gray-600">Position</TableHead>
                    <TableHead className="font-semibold text-gray-600">Plan</TableHead>
                    <TableHead className="font-semibold text-gray-600">Posted Date</TableHead>
                    <TableHead className="font-semibold text-gray-600">Candidates</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 italic">
                        No job postings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job._id} className="hover:bg-gray-50 border-gray-100">
                        <TableCell className="font-medium text-gray-900">{job.jobTitle}</TableCell>
                        <TableCell>
                          <span className={`${job.planType === 'Premium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} px-2 py-0.5 rounded text-xs font-medium`}>
                            {job.planType || 'Basic'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{new Date(job.createdAt).toISOString().split('T')[0]}</TableCell>
                        <TableCell className="text-gray-600 pl-8">{job.candidateCount || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white shadow-none h-8"
                            onClick={() => navigate(`/admin/job-postings/${job._id}`)}
                          >
                            View Job
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
