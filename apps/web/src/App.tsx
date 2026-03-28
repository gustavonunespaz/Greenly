import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import Index from "./pages/Index";
import LicencasPage from "./pages/LicencasPage";
import MTRsPage from "./pages/MTRsPage";
import CondicionantesPage from "./pages/CondicionantesPage";
import ClientesPage from "./pages/ClientesPage";
import NotificacoesPage from "./pages/NotificacoesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/licencas" element={<ProtectedRoute><LicencasPage /></ProtectedRoute>} />
              <Route path="/licencas/:id" element={<ProtectedRoute><LicencasPage /></ProtectedRoute>} />
              <Route path="/mtrs" element={<ProtectedRoute><MTRsPage /></ProtectedRoute>} />
              <Route path="/mtrs/:id" element={<ProtectedRoute><MTRsPage /></ProtectedRoute>} />
              <Route path="/condicionantes" element={<ProtectedRoute><CondicionantesPage /></ProtectedRoute>} />
              <Route path="/condicionantes/:id" element={<ProtectedRoute><CondicionantesPage /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
              <Route path="/clientes/:id" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
              <Route path="/notificacoes" element={<ProtectedRoute><NotificacoesPage /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
