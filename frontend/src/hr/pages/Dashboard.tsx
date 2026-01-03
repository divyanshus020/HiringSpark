import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getHrDashboardStats } from "../../api/hr/dashbaord.api";
import { getAllJobs, deleteJob } from "../../api/hr/jobs.api";
import { toast } from "react-toastify";

const Dashboard = (): JSX.Element => {
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const jobsResponse = await getAllJobs();
      if (jobsResponse.data.success) {
        const jobs = jobsResponse.data.jobs || [];
        // Filter out draft jobs without jobTitle and show only first 3
        const completedJobs = jobs.filter((job: any) => job.jobTitle && job.jobTitle.trim() !== '');
        setRecentJobs(completedJobs.slice(0, 3));
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch dashboard stats
        const statsResponse = await getHrDashboardStats();
        if (statsResponse.data.success) {
          setStats(statsResponse.data.dashboard.stats);
        }

        // Fetch recent jobs
        await fetchJobs();
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      return;
    }

    setDeletingJobId(jobId);
    try {
      const response = await deleteJob(jobId);
      if (response.data.success) {
        toast.success("Job deleted successfully!");
        // Refresh jobs list
        await fetchJobs();
      }
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(error.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleViewCandidates = (jobId: string) => {
    navigate(`/hr/candidates?jobId=${jobId}`);
  };

  const statsCards = stats ? [
    { label: "Active Jobs", value: stats.activeJobs?.value || "0", change: stats.activeJobs?.change || "0 this week", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
    { label: "Total Applicants", value: stats.totalApplicants?.value || "0", change: stats.totalApplicants?.change || "0 today", icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "Pending Review", value: stats.pendingReview?.value || "0", change: stats.pendingReview?.change || "0 urgent", icon: Clock, color: "from-orange-500 to-red-500" },
    { label: "Hired This Month", value: stats.hiredThisMonth?.value || "0", change: stats.hiredThisMonth?.change || "0%", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  ] : [];

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status?.toLowerCase()) {
      case "active":
      case "posted":
        return "default";
      case "draft":
      case "processing":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="container py-8">
        {/* ✅ WELCOME SECTION (GRID-BASED, NO CUTTING) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-[1fr_auto] items-start mb-8"
        >
          {/* Left: Text */}
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent whitespace-normal break-words leading-snug">
              Welcome back, {user.fullName || "HR"} 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Managing hiring for{" "}
              <span className="font-semibold">
                {user.companyName || "your company"}
              </span>
            </p>
          </div>

          {/* Right: Button */}
          <div className="flex justify-start md:justify-end">
            <Link to="/hr/create-job">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Create New Job Post
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recent Jobs */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-indigo-600" />
                Recent Job Posts
              </CardTitle>
              <CardDescription>Manage and track your job postings</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No jobs posted yet. Create your first job!</p>
              </div>
            ) : (
              recentJobs.map((job) => (
                <motion.div
                  key={job._id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-5 rounded-xl border bg-white hover:bg-indigo-50 transition"
                >
                  <div>
                    <p className="font-semibold">{job.jobTitle || 'Untitled Job'}</p>
                    <p className="text-sm text-gray-600">
                      {job.companyName || 'Company'} • {job.location || 'Location'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(job.status)}>{job.statusText || job.status}</Badge>
                    <span className="text-sm text-gray-500">{job.applications || 0} applications</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewCandidates(job._id)}
                      title="View Candidates"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteJob(job._id, job.jobTitle)}
                      disabled={deletingJobId === job._id}
                      title="Delete Job"
                      className="hover:text-red-600"
                    >
                      {deletingJobId === job._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>


      </main>
    </div>
  );
};

export default Dashboard;
