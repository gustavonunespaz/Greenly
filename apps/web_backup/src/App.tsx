import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import LicencasPage from "./pages/LicencasPage";
import MTRsPage from "./pages/MTRsPage";
import CondicionantesPage from "./pages/CondicionantesPage";
import ClientesPage from "./pages/ClientesPage";
import NotificacoesPage from "./pages/NotificacoesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/licencas" element={<LicencasPage />} />
          <Route path="/mtrs" element={<MTRsPage />} />
          <Route path="/condicionantes" element={<CondicionantesPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
