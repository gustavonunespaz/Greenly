import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, Bell, LogOut, User, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/licencas': 'Licenças Ambientais',
  '/condicionantes': 'Condicionantes',
  '/mtrs': 'Manifestos de Transporte',
  '/clientes': 'Clientes',
  '/notificacoes': 'Notificações',
  '/configuracoes': 'Configurações',
};

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const breadcrumb = breadcrumbMap[location.pathname] || title || '';

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Premium Header */}
          <header className="h-14 flex items-center justify-between border-b border-white/[0.06] px-5 backdrop-blur-md bg-background/70 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />
              {breadcrumb && (
                <div className="hidden sm:flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Logo Greenly"
                    className="h-5 w-5 object-contain scale-[1.3]"
                  />
                  <span className="text-muted-foreground/30">/</span>
                  <h1 className="text-sm font-medium text-foreground tracking-tight">
                    {breadcrumb}
                  </h1>
                </div>
              )}
              {/* Mobile title */}
              {title && (
                <h1 className="sm:hidden text-sm font-medium text-foreground truncate">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button className="p-2 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200">
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate('/notificacoes')}
                className="p-2 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200 relative"
              >
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
                  title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              )}

              {/* Divider */}
              <div className="h-5 w-px bg-white/[0.06] mx-1" />

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary text-[10px] font-semibold ring-1 ring-primary/20">
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-foreground hidden sm:block">{user?.nome?.split(' ')[0]}</span>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card p-1.5 z-50 animate-scale-in">
                    <div className="px-3 py-2.5 mb-1">
                      <p className="text-sm font-medium text-foreground">{user?.nome}</p>
                      <p className="text-[11px] text-muted-foreground/60">{user?.email}</p>
                    </div>
                    <div className="h-px bg-white/[0.06] mx-2 mb-1" />
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/configuracoes'); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/configuracoes'); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Configurações
                    </button>
                    <div className="h-px bg-white/[0.06] mx-2 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
