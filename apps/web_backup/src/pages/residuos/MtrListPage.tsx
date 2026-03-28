import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  MoreVertical,
  Loader2,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react'
import { mtrService } from '../../services/mtr.service'
import type { MTRDTO, StatusMTR } from '@greenly/shared'

const statusConfig: Record<StatusMTR, { color: string, label: string, icon: any }> = {
  EMITIDO: { color: 'text-blue-400 bg-blue-400/10', label: 'Emitido', icon: FileText },
  EM_TRANSITO: { color: 'text-amber-400 bg-amber-400/10', label: 'Em Trânsito', icon: Truck },
  RECEBIDO: { color: 'text-emerald-500 bg-emerald-500/10', label: 'Recebido', icon: CheckCircle2 },
  CDF_EMITIDO: { color: 'text-emerald-600 bg-emerald-600/10', label: 'C.D.F Emitido', icon: CheckCircle2 },
  CANCELADO: { color: 'text-red-500 bg-red-500/10', label: 'Cancelado', icon: AlertTriangle },
  COM_DIVERGENCIA: { color: 'text-red-400 bg-red-400/10', label: 'Divergência', icon: AlertTriangle }
}

export function MtrListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: mtrs, isLoading, error } = useQuery({
    queryKey: ['mtrs'],
    queryFn: mtrService.listar
  })

  const filteredMtrs = mtrs?.filter(m => 
    m.numeroMTR?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="glass-card p-10 rounded-[32px] text-center border-red-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar MTRs</h2>
        <p className="text-slate-400">Verifique sua conexão com o servidor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Manifestos (MTR)</h1>
          <p className="text-slate-400 font-medium">Rastreabilidade total do transporte e destinação de resíduos.</p>
        </div>
        
        <button className="btn-premium flex items-center justify-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Novo Manifesto</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por número ou cliente..." 
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
          <Filter size={20} />
          Status
        </button>
      </div>

      {/* MTR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-slate-500 italic">Sincronizando manifestos...</p>
          </div>
        ) : filteredMtrs?.length === 0 ? (
          <div className="col-span-full glass-card p-20 text-center rounded-[32px]">
            <p className="text-slate-500 italic">Nenhum manifesto encontrado.</p>
          </div>
        ) : (
          filteredMtrs?.map((mtr) => {
            const s = statusConfig[mtr.status]
            const Icon = s.icon
            return (
              <div key={mtr.id} className="glass-card p-6 rounded-[32px] border-white/5 hover:border-emerald-500/20 transition-all group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${s.color}`}>
                      <Icon size={12} />
                      {s.label}
                    </span>
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">MTR: {mtr.numeroMTR || 'A Emitir'}</h3>
                    <p className="text-sm text-slate-500 font-medium truncate">{mtr.cliente?.nome}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Volume</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-white font-bold">{mtr.volume}</span>
                        <span className="text-xs text-slate-500 font-medium">{mtr.unidadeMedida}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Data Emissão</p>
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs">
                        <Calendar size={12} className="text-slate-600" />
                        {new Date(mtr.dataEmissao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Layers size={14} className="text-slate-600" />
                      <span>{mtr.tipoDestinacao.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Truck size={14} className="text-slate-600" />
                      <span>{mtr.placaVeiculo || 'Placa não inf.'} - {mtr.nomeMotorista || 'Mot. não inf.'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex items-center gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Download size={14} />
                    MTR PDF
                  </button>
                  {mtr.status === 'CDF_EMITIDO' && (
                    <button className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      CDF
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
