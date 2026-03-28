import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  MoreVertical,
  Download,
  Loader2,
  Building2
} from 'lucide-react'
import { licencaService } from '../../services/licenca.service'
import type { LicencaDTO, StatusLicenca } from '@greenly/shared'

const statusConfig: Record<StatusLicenca, { color: string, label: string, icon: any }> = {
  ATIVA: { color: 'text-emerald-500 bg-emerald-500/10', label: 'Ativa', icon: CheckCircle2 },
  VENCIDA: { color: 'text-red-500 bg-red-500/10', label: 'Vencida', icon: AlertCircle },
  EM_RENOVACAO: { color: 'text-blue-500 bg-blue-500/10', label: 'Em Renovação', icon: Clock },
  SUSPENSA: { color: 'text-amber-500 bg-amber-500/10', label: 'Suspensa', icon: AlertCircle },
  CASSADA: { color: 'text-red-700 bg-red-700/10', label: 'Cassada', icon: AlertCircle },
  AGUARDANDO_EMISSAO: { color: 'text-slate-400 bg-slate-400/10', label: 'Aguardando', icon: Clock },
  DISPENSADA: { color: 'text-purple-500 bg-purple-500/10', label: 'Dispensada', icon: CheckCircle2 },
  ARQUIVADA: { color: 'text-slate-600 bg-slate-600/10', label: 'Arquivada', icon: FileText }
}

export function LicenseListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: licencas, isLoading, error } = useQuery({
    queryKey: ['licencas'],
    queryFn: licencaService.listar
  })

  const filteredLicencas = licencas?.filter(l => 
    l.numeroLicenca?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="glass-card p-10 rounded-[32px] text-center border-red-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar licenças</h2>
        <p className="text-slate-400">Certifique-se de que o servidor está online.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Licenças Ambientais</h1>
          <p className="text-slate-400 font-medium">Controle de validade, renovações e compliance legal.</p>
        </div>
        
        <button className="btn-premium flex items-center justify-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Cadastrar Licença</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-emerald-500/10">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Licenças Ativas</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white tracking-tight">{licencas?.filter(l => l.status === 'ATIVA').length || 0}</h3>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">Saudável</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl border-red-500/10">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Vencidas ou Críticas</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white tracking-tight">{licencas?.filter(l => l.status === 'VENCIDA').length || 0}</h3>
            <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-lg">Ação Requerida</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl border-blue-500/10">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Em Renovação</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white tracking-tight">{licencas?.filter(l => l.status === 'EM_RENOVACAO').length || 0}</h3>
            <span className="text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-lg">Protocolado</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por número, cliente ou tipo..." 
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
          <Filter size={20} />
          Filtrar
        </button>
      </div>

      {/* License Table */}
      <div className="glass-card rounded-[32px] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center w-24">Tipo</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Número / Identificação</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Cliente</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Vencimento</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <p className="font-medium animate-pulse">Carregando inventário de licenças...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLicencas?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="text-slate-500 italic">Nenhuma licença encontrada.</div>
                  </td>
                </tr>
              ) : (
                filteredLicencas?.map((licenca) => {
                  const s = statusConfig[licenca.status]
                  const Icon = s.icon
                  return (
                    <tr key={licenca.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-black text-emerald-500/40 tracking-tighter group-hover:text-emerald-500 transition-colors">
                          {licenca.tipo}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-white font-bold leading-tight mb-1">{licenca.numeroLicenca || 'S/N'}</p>
                          <p className="text-xs text-slate-500 tracking-wide truncate max-w-[200px]">{licenca.atividadeLicenciada}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                              <Building2 size={16} />
                           </div>
                           <span className="text-sm font-medium text-slate-300">{licenca.cliente?.nome}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={16} className="text-slate-600" />
                          <span className="text-sm font-medium">
                            {licenca.dataValidade ? new Date(licenca.dataValidade).toLocaleDateString('pt-BR') : 'Indeterminado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
                          <Icon size={12} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/licencas/${licenca.id}/condicionantes`)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
