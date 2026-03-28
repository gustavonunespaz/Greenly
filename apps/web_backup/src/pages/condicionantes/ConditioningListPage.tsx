import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileUp,
  ExternalLink,
  MoreVertical,
  Loader2,
  Calendar,
  User as UserIcon
} from 'lucide-react'
import { condicionanteService } from '../../services/condicionante.service'
import { licencaService } from '../../services/licenca.service'
import type { CondicionanteDTO, StatusCondicionante } from '@greenly/shared'

const statusConfig: Record<StatusCondicionante, { color: string, label: string, icon: any }> = {
  A_CUMPRIR: { color: 'text-slate-400 bg-slate-400/10', label: 'A Cumprir', icon: Clock },
  EM_ANDAMENTO: { color: 'text-blue-500 bg-blue-500/10', label: 'Em Andamento', icon: Clock },
  CUMPRIDA: { color: 'text-emerald-500 bg-emerald-500/10', label: 'Cumprida', icon: CheckCircle2 },
  ATRASADA: { color: 'text-red-500 bg-red-500/10', label: 'Atrasada', icon: AlertCircle },
  DISPENSADA: { color: 'text-purple-500 bg-purple-500/10', label: 'Dispensada', icon: CheckCircle2 }
}

export function ConditioningListPage() {
  const { licencaId } = useParams<{ licencaId: string }>()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: licenca } = useQuery({
    queryKey: ['licenca', licencaId],
    queryFn: () => licencaService.buscarPorId(licencaId!)
  })

  const { data: condicionantes, isLoading } = useQuery({
    queryKey: ['condicionantes', licencaId],
    queryFn: () => condicionanteService.listarPorLicenca(licencaId!)
  })

  const filteredCondicionantes = condicionantes?.filter(c => 
    c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/licencas')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Condicionantes</h1>
            <p className="text-slate-400 font-medium">
              Licença: <span className="text-emerald-400">{licenca?.numeroLicenca || 'Carregando...'}</span>
            </p>
          </div>
        </div>
        
        <button className="btn-premium flex items-center justify-center gap-2">
          <Plus size={20} />
          <span>Nova Condicionante</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou código..." 
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-slate-500 font-medium italic">Sincronizando obrigações...</p>
          </div>
        ) : filteredCondicionantes?.length === 0 ? (
          <div className="glass-card p-20 text-center rounded-[32px]">
            <p className="text-slate-500">Nenhuma condicionante encontrada para esta licença.</p>
          </div>
        ) : (
          filteredCondicionantes?.map((c) => {
            const s = statusConfig[c.status]
            const StatusIcon = s.icon
            return (
              <div key={c.id} className="glass-card p-6 rounded-3xl border-white/5 hover:border-emerald-500/20 transition-all group">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Status & Date */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center p-4 rounded-2xl bg-white/5 min-w-[160px]">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider mb-2 ${s.color}`}>
                      <StatusIcon size={12} />
                      {s.label}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs font-bold leading-none">
                        {c.prazo ? new Date(c.prazo).toLocaleDateString('pt-BR') : 'Sem Prazo'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                        {c.codigo ? `${c.codigo} - ` : ''}{c.descricao}
                      </h4>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500 text-slate-400 hover:text-white transition-all">
                            <FileUp size={18} />
                         </button>
                         <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                            <MoreVertical size={18} />
                         </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <Clock size={12} /> {c.tipo === 'PERIODICA' ? 'Recorrente' : 'Evento Único'}
                      </span>
                      {c.responsavelCliente && (
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <UserIcon size={12} /> {c.responsavelCliente}
                        </span>
                      )}
                      {c.evidenciaUrl ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-bold cursor-pointer hover:underline">
                          <ExternalLink size={12} /> Ver Evidência
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-500/50 italic">
                          Sem evidência anexada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
