import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { ClienteContextProvider } from '@/features/clientes/components/ClienteContextProvider'

const Index = lazy(() => import('./pages/Index'))
const DocumentosPage = lazy(() => import('./pages/DocumentosPage'))
const LicencasPage = lazy(() => import('./pages/LicencasPage'))
const MTRsPage = lazy(() => import('./pages/MTRsPage'))
const CondicionantesPage = lazy(() => import('./pages/CondicionantesPage'))
const ClientesPage = lazy(() => import('./pages/ClientesPage'))
const NotificacoesPage = lazy(() => import('./pages/NotificacoesPage'))
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AgendaPage = lazy(() => import('./pages/AgendaPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
})

const PageLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
    Carregando...
  </div>
)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ClienteContextProvider>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documentos"
                  element={
                    <ProtectedRoute>
                      <DocumentosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/licencas"
                  element={
                    <ProtectedRoute>
                      <LicencasPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/licencas/:id"
                  element={
                    <ProtectedRoute>
                      <LicencasPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mtrs"
                  element={
                    <ProtectedRoute>
                      <MTRsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mtrs/:id"
                  element={
                    <ProtectedRoute>
                      <MTRsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/condicionantes"
                  element={
                    <ProtectedRoute>
                      <CondicionantesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/condicionantes/:id"
                  element={
                    <ProtectedRoute>
                      <CondicionantesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute>
                      <ClientesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes/:id"
                  element={
                    <ProtectedRoute>
                      <ClientesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notificacoes"
                  element={
                    <ProtectedRoute>
                      <NotificacoesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <ConfiguracoesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agenda"
                  element={
                    <ProtectedRoute>
                      <AgendaPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ClienteContextProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
