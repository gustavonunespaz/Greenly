import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  BarChart3, 
  ClipboardList, 
  MapPin, 
  Calendar,
  MoreVertical,
  ChevronRight,
  Loader2,
  Building2,
  Scale
} from 'lucide-react'
import { api } from '../../services/api'

// Mocking some service calls for inventory as it might be a custom endpoint
const fetchInventory = async () => {
    // This would normally be inventoryService.listar()
    const { data } = await api.get('/residuos/inventario')
    return data
}

export function InventoryListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: inventario, isLoading, error } = useQuery({
    queryKey: ['inventario'],
    queryFn: fetchInventory
  })

  // Mock data for the MVP if the endpoint is empty
  const mockData = [
    { id: '1', residuo: 'Papelão Ondulado', volume: 450, unidade: 'KG', cliente: 'Logística Express', data: '2026-03-10' },
    { id: '2', residuo: 'Plástico Filme', volume: 120, unidade: 'KG', cliente: 'Logística Express', data: '2026-03-12' },
    { id: '3', residuo: 'Óleo Lubrificante Usado', volume: 200, unidade: 'LITRO', cliente: 'Oficina Central', data: '2026-03-15' },
  ]

  const displayData = inventario || mockData

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Inventário de Resíduos</h1>
          <p className="text-slate-400 font-medium">Controle de entradas e registro histórico de geração mensal.</p>
        </div>
        
        <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
                <BarChart3 size={20} />
                Relatórios
            </button>
            <button className="btn-premium flex items-center justify-center gap-2 group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span>Lançar Resíduo</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
             <div className="col-span-full py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-slate-500 italic">Carregando histórico...</p>
             </div>
        ) : (
            displayData.map((item: any) => (
                <div key={item.id} className="glass-card p-6 rounded-[32px] border-white/5 hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                            <Scale size={24} />
                        </div>
                        <button className="text-slate-600 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-white leading-tight">{item.residuo}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Building2 size={14} />
                            <span>{item.cliente}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Quantidade</p>
                            <p className="text-lg font-black text-white">{item.volume} <span className="text-xs text-slate-600 uppercase tracking-tighter">{item.unidade}</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Data Registro</p>
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs pt-1">
                                <Calendar size={14} className="text-slate-700" />
                                {new Date(item.data).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
        
        {/* Placeholder for "Quick Add" Card */}
        <div className="glass-card p-6 rounded-[32px] border-dashed border-white/10 flex flex-col items-center justify-center text-slate-600 hover:bg-white/[0.02] hover:border-emerald-500/20 hover:text-emerald-500 transition-all cursor-pointer min-h-[220px]">
            <Plus size={40} className="mb-4 opacity-50" />
            <p className="font-bold tracking-tight">Adicionar Registro</p>
            <p className="text-xs text-slate-500">Novo lançamento rápido</p>
        </div>
      </div>
    </div>
  )
}
