
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Scan from "./pages/Scan";
import Wifi from "./pages/Wifi";
import Barcode from "./pages/Barcode";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/AuthGuard";
import SignIn from "./pages/SignIn";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/dashboard/folder/:folderId" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/generate" element={
              <AuthGuard>
                <Generate />
              </AuthGuard>
            } />
            <Route path="/scan" element={
              <AuthGuard>
                <Scan />
              </AuthGuard>
            } />
            <Route path="/wifi" element={
              <AuthGuard>
                <Wifi />
              </AuthGuard>
            } />
            <Route path="/barcode" element={
              <AuthGuard>
                <Barcode />
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
