import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./Dashboard";
import Auth from "./Auth";
import HRAccounts from "./HRAccounts";
import Candidates from "./Candidates";
import JobPostings from "./JobPostings";
import NotFound from "./NotFound";
import HRDetail from "./HRDetail";
import JobPostingDetail from "./JobPostingDetail";

const queryClient = new QueryClient();

const AdminApp = () => {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <ToastContainer position="top-right" autoClose={3000} />
                    {/* No BrowserRouter here - it's already in main App.tsx */}
                    <Routes>
                        {/* Admin routes - all paths relative to /admin */}
                        <Route path="/" element={<Navigate to="/admin/auth" replace />} />

                        {/* Public */}
                        <Route path="/auth" element={<Auth />} />

                        {/* Protected */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/hr-accounts" element={<HRAccounts />} />
                        <Route path="/hr-accounts/:id" element={<HRDetail />} />
                        <Route path="/candidates" element={<Candidates />} />
                        <Route path="/job-postings" element={<JobPostings />} />
                        <Route path="/job-postings/:id" element={<JobPostingDetail />} />


                        <Route path="/*" element={<NotFound />} />
                    </Routes>
                </TooltipProvider>
            </QueryClientProvider>
        </HelmetProvider>
    );
};

export default AdminApp;
