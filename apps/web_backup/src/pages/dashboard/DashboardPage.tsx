import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  FileText, 
  Trash2, 
  Users, 
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { useAuthStore } from '../../stores/auth.store'
import { clienteService } from '../../services/cliente.service'
import { licencaService } from '../../services/licenca.service'
import { mtrService } from '../../services/mtr.service'

export function DashboardPage() {
  const { user } = useAuthStore()

  // Data Fetching
  const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: clienteService.listar })
  const { data: licencas } = useQuery({ queryKey: ['licencas'], queryFn: licencaService.listar })
  const { data: mtrs } = useQuery({ queryKey: ['mtrs'], queryFn: mtrService.listar })

  // Mock data for charts (recharts needs specific formats)
  const wasteData = [
    { month: 'Jan', volume: 45 },
    { month: 'Fev', volume: 52 },
    { month: 'Mar', volume: 48 },
    { month: 'Abr', volume: 61 },
    { month: 'Mai', volume: 55 },
    { month: 'Jun', volume: 67 },
  ]

  const statusData = [
    { name: 'Ativas', value: licencas?.filter(l => l.status === 'ATIVA').length || 0, color: '#10b981' },
    { name: 'Vencidas', value: licencas?.filter(l => l.status === 'VENCIDA').length || 0, color: '#ef4444' },
    { name: 'Reno.', value: licencas?.filter(l => l.status === 'EM_RENOVACAO').length || 0, color: '#3b82f6' },
  ]

  const stats = [
    { label: 'Licenças Ativas', value: licencas?.filter(l => l.status === 'ATIVA').length || '12', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+2' },
    { label: 'Condicionantes', value: '8', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'Críticas' },
    { label: 'MTRs Emitidos', value: mtrs?.length || '45', icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'Mês Atual' },
    { label: 'Clientes Ativos', value: clientes?.length || '6', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: 'SaaS' },
  ]

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-400 font-medium">Resumo estratégico das operações ambientais — <span className="text-emerald-500 font-bold">{user?.nome?.split(' ')[0]}</span></p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-slate-300">
          <CalendarIcon size={18} className="text-emerald-500" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-3xl p-6 group hover:translate-y-[-4px] transition-all duration-300 border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-slate-500 group-hover:text-white transition-colors">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1 opacity-60">{stat.label}</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-8">
           {/* Waste Generation Chart */}
           <div className="glass-card rounded-[32px] p-8 border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <TrendingUp className="text-emerald-500" /> 
                       Geração de Resíduos (t)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Performance Semestral</p>
                 </div>
                 <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none hover:bg-white/10 transition-all">
                    <option>Últimos 6 Meses</option>
                    <option>Ano Atual</option>
                 </select>
              </div>
              
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wasteData}>
                       <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ color: '#10b981' }}
                       />
                       <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Alerts List */}
           <div className="glass-card rounded-[32px] p-8 border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <AlertCircle className="text-amber-500" /> 
                    Condicionantes Pendentes
                 </h3>
                 <button className="text-xs text-emerald-500 font-black tracking-widest uppercase hover:text-emerald-400 transition-colors">VER TODAS</button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500 shadow-inner'}`}>
                       <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold mb-0.5 tracking-tight">Condicionante #{142 + i}</p>
                      <p className="text-xs text-slate-500 font-medium">Prazo: {10 + i} de Abril • Multinacional S.A</p>
                    </div>
                    <button className="p-2 rounded-lg text-slate-600 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar Dashboard Stats */}
        <div className="space-y-8">
           {/* Licensing Status Chart */}
           <div className="glass-card rounded-[32px] p-8 border-white/5">
              <h3 className="text-lg font-bold text-white mb-8 border-b border-white/5 pb-4">Status de Licenciamento</h3>
              <div className="h-[200px] w-full mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                       <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                          {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                 {statusData.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                       <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{s.name}</span>
                       <span className="text-white font-black">{s.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="glass-card rounded-[32px] p-8 bg-emerald-600/5 border-emerald-500/10 space-y-6">
              <h3 className="text-lg font-bold text-white">Atalhos Operacionais</h3>
              <div className="space-y-3">
                 <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all group">
                    <span>Emitir Novo MTR</span>
                    <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all">
                    <span>Relatório Mensal</span>
                    <FileText size={18} />
                 </button>
              </div>
           </div>

           {/* Recent Log */}
           <div className="glass-card rounded-[32px] p-8 border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">Histórico Recente</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                    <div className="flex-1">
                       <p className="text-xs font-bold text-white">MTR #2026-880 Confirmado</p>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Logística TransGlobal • Hoje</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    <div className="flex-1">
                       <p className="text-xs font-bold text-white">Licença Renovada</p>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Posto de Reciclagem • Ontem</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
