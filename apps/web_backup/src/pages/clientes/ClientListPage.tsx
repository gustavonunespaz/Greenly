import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Building2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { clienteService } from '../../services/cliente.service'
import type { ClienteDTO } from '@greenly/shared'

export function ClientListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.listar
  })

  const filteredClientes = clientes?.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm)
  )

  if (error) {
    return (
      <div className="glass-card p-10 rounded-[32px] text-center border-red-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar clientes</h2>
        <p className="text-slate-400">Não foi possível sincronizar os dados com o servidor. Tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Clientes</h1>
          <p className="text-slate-400 font-medium">Gerenciamento de empresas contratantes e unidades.</p>
        </div>
        
        <button className="btn-premium flex items-center justify-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {/* Table / List Container */}
      <div className="glass-card rounded-[32px] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Cliente / Empresa</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">CNPJ</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Localização</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <p className="font-medium animate-pulse">Sincronizando clientes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClientes?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Search size={40} className="mb-4 text-slate-600 opacity-20" />
                      <p className="text-xl font-bold text-white">Nenhum cliente encontrado</p>
                      <p>Tente ajustar os termos da sua busca.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClientes?.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <p className="text-white font-bold leading-tight mb-1">{cliente.nome}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                             <span className="flex items-center gap-1"><Mail size={12} /> {cliente.email || 'N/A'}</span>
                             <span className="flex items-center gap-1"><Phone size={12} /> {cliente.telefone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-emerald-400 font-medium bg-emerald-400/5 px-2 py-1 rounded-md text-sm">
                        {cliente.cnpj}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={16} className="text-slate-600" />
                        <span className="text-sm">{cliente.cidade || 'N/A'} - {cliente.estado || '--'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cliente.ativo 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-emerald-500 transition-all">
                          <ChevronRight size={18} />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-blue-500 transition-all">
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
