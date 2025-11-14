import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Aanbod from "./pages/Aanbod";
import Verkocht from "./pages/Verkocht";
import LPG from "./pages/LPG";
import Contact from "./pages/Contact";
import Reviews from "./pages/Reviews";
import CarDetail from "./pages/CarDetail";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aanbod" element={<Aanbod />} />
          <Route path="/verkocht" element={<Verkocht />} />
          <Route path="/lpg" element={<LPG />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auto/:id" element={<CarDetail />} />
          <Route path="/panel" element={<Admin />} />
          <Route path="/panel/dashboard" element={<AdminDashboard />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
