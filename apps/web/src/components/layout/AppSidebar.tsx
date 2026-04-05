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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { ClienteContextSelector } from "@/features/clientes/components/ClienteContextSelector";

type NavChild = {
  title: string
  url: string
  match?: (location: { pathname: string; search: string }) => boolean
}

type NavItem = {
  title: string
  url: string
  icon: any
  children?: NavChild[]
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

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Building2 },
  {
    title: "Agenda",
    url: "/agenda",
    icon: CalendarDays,
    children: [
      { title: "Tarefas (Kanban)", url: "/tarefas" },
    ],
  },
  {
    title: "Licenças",
    url: "/licencas",
    icon: FileCheck,
    children: [
      { title: "Condicionantes", url: "/condicionantes" },
    ],
  },
  { title: "Operação de Resíduos", url: "/mtrs", icon: Truck },
  {
    title: "Obrigações Oficiais",
    url: "/obrigacoes/ibama",
    icon: ShieldCheck,
    children: [
      { title: "IBAMA · CTF", url: "/obrigacoes/ibama?tipo=IBAMA_CTF" },
      { title: "IBAMA · TCFA", url: "/obrigacoes/ibama?tipo=IBAMA_TCFA" },
      { title: "IBAMA · RAPP", url: "/obrigacoes/ibama?tipo=IBAMA_RAPP" },
      { title: "Resíduos · SINIR Inventário", url: "/obrigacoes/residuos?tipo=SINIR_INVENTARIO_NACIONAL" },
      { title: "Resíduos · SINIR DMR", url: "/obrigacoes/residuos?tipo=SINIR_DMR" },
      {
        title: "Resíduos · IAT Inventário Industrial",
        url: "/obrigacoes/residuos?tipo=IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS",
      },
      { title: "Emissões · Inventário GEE", url: "/obrigacoes/emissoes?tipo=GEE_INVENTARIO" },
      {
        title: "Emissões · IAT Carga Poluidora",
        url: "/obrigacoes/emissoes?tipo=IAT_DECLARACAO_CARGA_POLUIDORA",
      },
      {
        title: "Emissões · IAT Emissões Atmosféricas",
        url: "/obrigacoes/emissoes?tipo=IAT_DECLARACAO_EMISSOES_ATMOSFERICAS",
      },
    ],
  },
  { title: "Documentos", url: "/documentos", icon: FileSearch },
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
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-3 mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const childActive =
                  item.children?.some((child) =>
                    child.match
                      ? child.match(location)
                      : isRouteActive(location.pathname, location.search, child.url, { exactPath: true }),
                  ) ?? false
                const selfActive = isRouteActive(location.pathname, location.search, item.url)
                const active = selfActive || childActive
                
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
                    {!collapsed && item.children?.length ? (
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const childIsActive = child.match
                            ? child.match(location)
                            : isRouteActive(location.pathname, location.search, child.url, { exactPath: true })
                          return (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton asChild isActive={childIsActive}>
                                <NavLink to={child.url} className="text-[12px]">
                                  <span>{child.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    ) : null}
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
