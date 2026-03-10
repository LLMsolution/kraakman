import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useSiteSettings } from "./hooks/useSiteSettings";

const Home = lazy(() => import("./pages/Home"));
const Aanbod = lazy(() => import("./pages/Aanbod"));
const Verkocht = lazy(() => import("./pages/Verkocht"));
const LPG = lazy(() => import("./pages/LPG"));
const Contact = lazy(() => import("./pages/Contact"));
const Reviews = lazy(() => import("./pages/Reviews"));
const CarDetail = lazy(() => import("./pages/CarDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component that uses hooks inside QueryClientProvider
const AppContent = () => {
  // Load site settings (colors) on app start — applies CSS vars to :root
  useSiteSettings();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/aanbod" element={<Aanbod />} />
              <Route path="/verkocht" element={<Verkocht />} />
              <Route path="/lpg" element={<LPG />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auto/:id" element={<CarDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
