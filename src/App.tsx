
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import DynamicQR from "./pages/DynamicQR";
import EditDynamicQR from "./pages/EditDynamicQR";
import DynamicQRStats from "./pages/DynamicQRStats";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import FolderView from "./pages/FolderView";
import Barcode from "./pages/Barcode";
import Wifi from "./pages/Wifi";
import Scan from "./pages/Scan";
import Guides from "./pages/Guides";
import ApiManagement from "./pages/ApiManagement";
import WebhookManagement from "./pages/WebhookManagement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import GdprPolicy from "./pages/GdprPolicy";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SecurityProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/gdpr" element={<GdprPolicy />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/guides" element={<Guides />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                <Route path="/generate" element={<AuthGuard><Generate /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                <Route path="/dynamic-qr" element={<AuthGuard><DynamicQR /></AuthGuard>} />
                <Route path="/dynamic-qr/edit/:id" element={<AuthGuard><EditDynamicQR /></AuthGuard>} />
                <Route path="/dynamic-qr/stats/:id" element={<AuthGuard><DynamicQRStats /></AuthGuard>} />
                <Route path="/teams" element={<AuthGuard><Teams /></AuthGuard>} />
                <Route path="/teams/:teamId" element={<AuthGuard><TeamDetail /></AuthGuard>} />
                <Route path="/folder/:folderId" element={<AuthGuard><FolderView /></AuthGuard>} />
                <Route path="/barcode" element={<AuthGuard><Barcode /></AuthGuard>} />
                <Route path="/wifi" element={<AuthGuard><Wifi /></AuthGuard>} />
                <Route path="/api-management" element={<AuthGuard><ApiManagement /></AuthGuard>} />
                <Route path="/webhooks" element={<AuthGuard><WebhookManagement /></AuthGuard>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SecurityProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
