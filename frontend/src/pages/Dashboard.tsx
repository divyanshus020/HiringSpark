import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { dashboardStats } from "@/data/mockData";
import { Users, Briefcase, UserCheck } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-foreground mb-1">Welcome back, Admin</h2>
          <p className="text-muted-foreground text-sm">Here's what's happening with your platform today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total HRs"
            value={dashboardStats.totalHRs}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Job Postings"
            value={dashboardStats.activeJobPostings}
            icon={Briefcase}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Candidates"
            value={dashboardStats.totalCandidates}
            icon={UserCheck}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New HR registered", company: "TechCorp Inc.", time: "2 hours ago" },
                { action: "Job posting created", company: "Innovate.io", time: "4 hours ago" },
                { action: "Candidate shortlisted", company: "StartupXYZ", time: "6 hours ago" },
                { action: "New application", company: "Global HR Solutions", time: "8 hours ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.company}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Premium Plans</span>
                <span className="text-sm font-medium text-foreground">3</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Basic Plans</span>
                <span className="text-sm font-medium text-foreground">3</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '50%' }} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="text-sm font-semibold text-success">24.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}