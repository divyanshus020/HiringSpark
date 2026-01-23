import { useEffect, useState } from "react";
import { getAdminStats } from "../api/admin/admin.api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatCard } from "../components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Briefcase, FileText, TrendingUp, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAdminStats()
      .then((res) => {
        setStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground">
            <h2 className="text-2xl font-bold mb-2">Welcome to HiringBazaar Admin</h2>
            <p className="text-primary-foreground/90">
              Monitor and manage your recruitment platform from here
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total HR Accounts"
              value={stats?.totalHRs || 0}
              icon={Users}
              trend={{ value: stats?.trends?.hrTrend || 0, isPositive: stats?.trends?.hrTrend > 0 ? true : false }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Total Job Postings"
              value={stats?.totalJobs || 0}
              icon={Briefcase}
              trend={{ value: stats?.trends?.jobTrend || 0, isPositive: stats?.trends?.jobTrend > 0 ? true : false }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Total Candidates"
              value={stats?.totalCandidates || 0}
              icon={FileText}
              trend={{ value: stats?.trends?.candidateTrend || 0, isPositive: stats?.trends?.candidateTrend > 0 ? true : false }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Pending Review"
              value={stats?.pendingJobsCount || 0}
              icon={Clock}
            />
          </motion.div>
        </div>

        {/* Activity Overview and Growth Metrics removed to simplify admin dashboard UI */}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your platform efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => window.location.href = '/admin/hr-accounts'}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">HR Accounts</span>
                </button>
                <button
                  onClick={() => window.location.href = '/admin/job-postings'}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Briefcase className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Job Postings</span>
                </button>
                <button
                  onClick={() => window.location.href = '/admin/candidates'}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Candidates</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
