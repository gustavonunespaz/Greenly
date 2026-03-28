import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Trash2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User,
  Leaf
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

const NavItem = ({ to, icon, label, active, onClick }: NavItemProps) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`nav-item ${active ? 'nav-item-active' : ''}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
)

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { to: '/licencas', icon: <FileCheck size={20} />, label: 'Legal & Licenças' },
    { to: '/residuos', icon: <Trash2 size={20} />, label: 'Resíduos & MTRs' },
    { to: '/configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 glass-sidebar transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Greenly</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
            
            <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/5 mt-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.nome} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role === 'CONSULTORIA_ADMIN' ? 'Administrador' : 'Analista'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-slate-950/20 backdrop-blur-md z-30">
          <button 
            className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-medium text-slate-400">
              {menuItems.find(i => location.pathname === i.to || (i.to !== '/' && location.pathname.startsWith(i.to)))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </button>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user?.nome}</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
