import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ParsingStatusWidget } from "../ParsingStatusWidget";

interface DashboardLayoutProps {
  children: ReactNode;
  title: ReactNode;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader title={title} />
          <main className="flex-1 p-4 lg:p-6 overflow-auto relative">
            {children}
            <ParsingStatusWidget />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}