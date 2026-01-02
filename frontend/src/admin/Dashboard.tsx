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
        setStats(res.data.data || res.data);
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
            <h2 className="text-2xl font-bold mb-2">Welcome to HireSpark Admin</h2>
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
              trend={{ value: 12, isPositive: true }}
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
              trend={{ value: 8, isPositive: true }}
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
              trend={{ value: 23, isPositive: true }}
            />
          </motion.div>
        </div>

        {/* Activity Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Platform Activity
                </CardTitle>
                <CardDescription>Recent platform statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">Active HRs</span>
                    </div>
                    <span className="font-semibold">{stats?.totalHRs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground">Open Positions</span>
                    </div>
                    <span className="font-semibold">{stats?.totalJobs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-muted-foreground">Applications</span>
                    </div>
                    <span className="font-semibold">{stats?.totalCandidates || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>Month-over-month growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">HR Signups</span>
                      <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Job Posts</span>
                      <span className="text-sm font-medium text-blue-600">+8%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Applications</span>
                      <span className="text-sm font-medium text-purple-600">+23%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
              <div className="grid gap-4 md:grid-cols-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">View HRs</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Briefcase className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">View Jobs</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Candidates</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Activity className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
