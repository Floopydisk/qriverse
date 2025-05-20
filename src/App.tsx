
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import Guides from "./pages/Guides";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import GdprPolicy from "./pages/GdprPolicy";
import FolderView from "./pages/FolderView";
import DynamicQR from "./pages/DynamicQR";
import DynamicQRStats from "./pages/DynamicQRStats";
import EditDynamicQR from "./pages/EditDynamicQR";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HashRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/gdpr" element={<GdprPolicy />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/dashboard/folder/:folderId" element={
                <AuthGuard>
                  <FolderView />
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
              <Route path="/dynamic-qr" element={
                <AuthGuard>
                  <DynamicQR />
                </AuthGuard>
              } />
              <Route path="/dynamic-qr/stats/:id" element={
                <AuthGuard>
                  <DynamicQRStats />
                </AuthGuard>
              } />
              <Route path="/dynamic-qr/edit/:id" element={
                <AuthGuard>
                  <EditDynamicQR />
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </HashRouter>
);

export default App;
