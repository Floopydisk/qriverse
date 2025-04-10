
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/AuthGuard";
import SignIn from "./pages/SignIn";
import Barcode from "./pages/Barcode";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";

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
            <Route path="/scan" element={<Scan />} />
            
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
            <Route path="/barcode" element={
              <AuthGuard>
                <Barcode />
              </AuthGuard>
            } />
            <Route path="/profile" element={
              <AuthGuard>
                <Profile />
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
