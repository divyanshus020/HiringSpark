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
  MoreHorizontal,
  UserCheck,
  Phone,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = (): JSX.Element => {
  const hrUser = JSON.parse(localStorage.getItem("hrUser") || "{}");

  const stats = [
    { label: "Active Jobs", value: "12", change: "+3 this week", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
    { label: "Total Applicants", value: "1,234", change: "+156 today", icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "Pending Review", value: "89", change: "23 urgent", icon: Clock, color: "from-orange-500 to-red-500" },
    { label: "Hired This Month", value: "8", change: "+33%", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  ];

  const recentJobs = [
    { id: 1, title: "Senior Software Engineer", company: "TechCorp India", location: "Bangalore", applicants: 45, status: "Active" },
    { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Mumbai", applicants: 0, status: "Processing" },
    { id: 3, title: "UI/UX Designer", company: "DesignHub", location: "Remote", applicants: 120, status: "Closed" },
  ];

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "outline" => {
    switch (status) {
      case "Active":
        return "default";
      case "Processing":
        return "secondary";
      case "Closed":
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
              Welcome back, {hrUser.name || "HR"} 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Managing hiring for{" "}
              <span className="font-semibold">
                {hrUser.companyName || hrUser.company || "your company"}
              </span>
            </p>
          </div>

          {/* Right: Button */}
          <div className="flex justify-start md:justify-end">
            <Link to="/create-job">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
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

        {/* Recent Jobs */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                Recent Job Posts
              </CardTitle>
              <CardDescription>Manage and track your job postings</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentJobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-5 rounded-xl border bg-white hover:bg-indigo-50 transition"
              >
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-gray-600">
                    {job.company} • {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div whileHover={{ y: -6 }}>
            <Card className="border-0 shadow-xl p-6 flex items-center gap-4 cursor-pointer hover:bg-blue-50">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-100">
                <UserCheck className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold">View Shortlisted</p>
                <p className="text-sm text-gray-600">89 candidates</p>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -6 }}>
            <Card className="border-0 shadow-xl p-6 flex items-center gap-4 cursor-pointer hover:bg-red-50">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-100">
                <Phone className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <p className="font-bold">Scheduled Calls</p>
                <p className="text-sm text-gray-600">3 pending</p>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -6 }}>
            <Card className="border-0 shadow-xl p-6 flex items-center gap-4 cursor-pointer hover:bg-emerald-50">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-100">
                <BarChart3 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold">Analytics</p>
                <p className="text-sm text-gray-600">View reports</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
