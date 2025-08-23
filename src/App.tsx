import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuthLayout from "./components/AuthLayout";
import MainLayout from "./components/MainLayout";
import Clients from "./pages/clients/Clients";
import Cases from "./pages/cases/Cases";
import CaseDetails from "./pages/cases/CaseDetails";
import Hearings from "./pages/hearings/Hearings";
import Tasks from "./pages/tasks/Tasks";
import CalendarPage from "./pages/calendar/CalendarPage";
import Settings from "./pages/settings/Settings";
import DocumentTemplates from "./pages/DocumentTemplates"; // استيراد صفحة قوالب الوثائق

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            element={
              <AuthLayout>
                <MainLayout />
              </AuthLayout>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:caseId" element={<CaseDetails />} />
            <Route path="/hearings" element={<Hearings />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/document-templates" element={<DocumentTemplates />} /> {/* إضافة المسار الجديد */}
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;