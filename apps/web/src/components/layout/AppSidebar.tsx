import {
  LayoutDashboard,
  FileCheck,
  Truck,
  FileSearch,
  Building2,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  CalendarDays,
  ShieldCheck,
  ClipboardList,
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
import { ClienteContextSelector } from "@/features/clientes/components/ClienteContextSelector";

type NavItem = {
  title: string
  url: string
  icon: any
}

type NavSection = {
  label: string
  items: NavItem[]
}

function isRouteActive(
  pathname: string,
  search: string,
  url: string,
  options?: { exactPath?: boolean },
) {
  const [urlPath, rawQuery] = url.split('?')
  const isRoot = urlPath === '/'
  const pathMatches = options?.exactPath
    ? pathname === urlPath
    : isRoot
      ? pathname === '/'
      : pathname.startsWith(urlPath)

  if (!pathMatches) return false
  if (!rawQuery) return true

  const expectedQuery = new URLSearchParams(rawQuery)
  const currentQuery = new URLSearchParams(search)
  for (const [key, value] of expectedQuery.entries()) {
    if (currentQuery.get(key) !== value) return false
  }
  return true
}

const navSections: NavSection[] = [
  {
    label: "Operação",
    items: [
      { title: "Documentos", url: "/documentos", icon: FileSearch },
      { title: "Licenças", url: "/licencas", icon: FileCheck },
      { title: "Operação de Resíduos", url: "/mtrs", icon: Truck },
      { title: "Condicionantes", url: "/condicionantes", icon: ClipboardList },
    ],
  },
  {
    label: "Estratégia",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Agenda", url: "/agenda", icon: CalendarDays },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Clientes", url: "/clientes", icon: Building2 },
    ],
  },
  {
    label: "Compliance",
    items: [
      { title: "Obrigações Oficiais", url: "/obrigacoes/ibama", icon: ShieldCheck },
    ],
  },
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

  function renderNavItem(item: NavItem, layoutId: string) {
    const active = isRouteActive(location.pathname, location.search, item.url);

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground group relative"
            activeClassName="bg-primary/[0.08] text-primary font-medium"
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="text-[13px]">{item.title}</span>}
            {!collapsed && active && (
              <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary/50" strokeWidth={1.5} />
            )}
            {item.title === "Notificações" && (
              <span className="absolute top-2 left-7 h-2 w-2 rounded-full bg-destructive ring-2 ring-sidebar" />
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo */}
      <div
        className={`border-b border-white/[0.06] ${
          collapsed ? "px-2 py-4 flex justify-center" : "px-3 py-4"
        }`}
      >
        {collapsed ? (
          <div className="h-11 w-11 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo Greenly"
              className="h-11 w-11 object-contain scale-[1.55]"
            />
          </div>
        ) : (
          <div className="h-14 w-[210px] overflow-hidden">
            <img
              src="/logo-comp.png"
              alt="Logo Greenly"
              className="h-full w-full object-contain object-left scale-[1.7] origin-left dark:brightness-[1.3] dark:contrast-110"
            />
          </div>
        )}
      </div>

      {/* Client Context Selector */}
      <div className="border-b border-white/[0.06] py-3">
        <ClienteContextSelector collapsed={collapsed} />
      </div>

      <SidebarContent className="px-2 pt-4">
        {navSections.map((section, sectionIndex) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel
              className={`text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-3 mb-2 ${
                sectionIndex > 0 ? "mt-4" : ""
              }`}
            >
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => renderNavItem(item, "sidebar-active"))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3">
                <p className="text-[11px] font-medium text-primary">Da operação à estratégia</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  1. Operação (Documentos, Licenças, MTR)
                  <br />
                  2. Compliance (Condicionantes, Obrigações)
                  <br />
                  3. Estratégia (Dashboard e Agenda)
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-3 mb-2 mt-4">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => renderNavItem(item, "sidebar-active-system"))}
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
