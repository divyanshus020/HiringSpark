import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Admin App
import AdminApp from "./admin/AdminApp";

// Import HR App
import HRApp from "./hr/HRApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect to admin */}
          <Route path="/" element={<Navigate to="/hr" replace />} />

          {/* Admin Routes - All routes starting with /admin */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* HR Routes - All routes starting with /hr */}
          <Route path="/hr/*" element={<HRApp />} />

          {/* 404 Not Found - redirect to admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;