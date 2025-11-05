import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReportFound from "./pages/ReportFound";
import RecoverItem from "./pages/RecoverItem";
import BrowseItems from "./pages/BrowseItems";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Messages from "./pages/Messages";
import MyItems from "./pages/MyItems";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/recover-item" element={<RecoverItem />} />
          <Route path="/browse-items" element={<BrowseItems />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
