import {
  LayoutDashboard,
  FileCheck,
  Truck,
  ClipboardList,
  Building2,
  Settings,
  Bell,
  Leaf,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Licenças", url: "/licencas", icon: FileCheck },
  { title: "Condicionantes", url: "/condicionantes", icon: ClipboardList },
  { title: "MTRs", url: "/mtrs", icon: Truck },
  { title: "Clientes", url: "/clientes", icon: Building2 },
];

const systemNav = [
  { title: "Notificações", url: "/notificacoes", icon: Bell },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]">
        <div className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <Leaf className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight gradient-text">
            Greenly
          </span>
        )}
      </div>

      <SidebarContent className="px-2 pt-4">
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-3 mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground group relative"
                        activeClassName="bg-primary/[0.08] text-primary font-medium"
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                        {!collapsed && (
                          <span className="text-[13px]">{item.title}</span>
                        )}
                        {!collapsed && active && (
                          <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary/50" strokeWidth={1.5} />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-3 mb-2 mt-4">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => {
                const active = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground relative"
                        activeClassName="bg-primary/[0.08] text-primary font-medium"
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-system"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="text-[13px]">{item.title}</span>}
                        {/* Notification dot */}
                        {item.title === "Notificações" && (
                          <span className="absolute top-2 left-7 h-2 w-2 rounded-full bg-destructive ring-2 ring-sidebar" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with real user info */}
      <SidebarFooter className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0 ring-1 ring-primary/20">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.nome || 'Carregando...'}</p>
              <p className="text-[11px] text-muted-foreground/60 truncate">{user?.email || ''}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              title="Sair"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
