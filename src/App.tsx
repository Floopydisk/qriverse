
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Scan from "./pages/Scan";
import Wifi from "./pages/Wifi";
import Barcode from "./pages/Barcode";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/AuthGuard";
import SignIn from "./pages/SignIn";

// Get Auth0 domain and client ID from environment variables
const auth0Domain = "barqr.uk.auth0.com";
const auth0ClientId = "cMRroZbMB3j2Izpe71AWAh7cVECy2HpO";
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || "";

const queryClient = new QueryClient();

const App = () => (
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: auth0Audience
    }}
  >
    <BrowserRouter>
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
    </BrowserRouter>
  </Auth0Provider>
);

export default App;
