import { useEffect, useState } from "react";
import { getAdminStats } from "../api/admin/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Briefcase, Users, FileText, Loader2 } from "lucide-react";
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

  const statsCards = stats
    ? [
      {
        label: "Total HR Accounts",
        value: stats.totalHRs || "0",
        icon: Users,
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
      },
      {
        label: "Open Jobs",
        value: stats.totalJobs || "0",
        icon: Briefcase,
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
      },
      {
        label: "Total Candidates",
        value: stats.totalCandidates || "0",
        icon: FileText,
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50",
      },
    ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</p>
          <p className="text-gray-500">
            Manage your hiring platform with ease
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`mt-2 h-2 rounded-full ${stat.bgColor}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">
                Welcome to HireSpark Admin Panel
              </h2>
              <p className="text-indigo-100">
                Monitor and manage all HR accounts, job postings, and candidates
                from this central dashboard.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
