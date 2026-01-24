import { LayoutDashboard, Users, UserCheck, Briefcase, Settings, LogOut, Handshake } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/api/admin/admin.api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "HR Accounts", url: "/admin/hr-accounts", icon: Users },
  { title: "Partners", url: "/admin/partners", icon: Handshake },
  { title: "Candidates", url: "/admin/candidates", icon: UserCheck },
  { title: "Job Postings", url: "/admin/job-postings", icon: Briefcase },
  // { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.data.success) {
          setPendingCount(res.data.data.pendingJobsCount || 0);
        }
      } catch (error) {
        console.error("Error fetching sidebar stats:", error);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">

            <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              HiringBazaar
            </span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center mx-auto shadow-md">
            <span className="text-white font-bold text-sm">HS</span>
          </div>
        )}
      </div>

      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                const isJobPostings = item.title === "Job Postings";

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors w-full ${isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </div>

                        {isJobPostings && pendingCount > 0 && (
                          <div className={collapsed
                            ? "absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-sidebar"
                            : "bg-destructive text-destructive-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm"
                          }>
                            {!collapsed && pendingCount}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => window.location.href = '/admin/auth'}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
