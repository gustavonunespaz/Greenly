import { useState } from 'react'
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Plus,
  MoreVertical,
  Trash2,
  Lock
} from 'lucide-react'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing'>('profile')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Configurações</h1>
        <p className="text-slate-400 font-medium">Gerencie sua consultoria, equipe e preferências da conta.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Perfil da Consultoria
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'team' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Minha Equipe
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Assinatura & Planos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'profile' && (
          <>
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-[32px] border-white/5 space-y-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                   <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                      G
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white">Greenly Consultoria</h3>
                      <p className="text-slate-500 text-sm">Atualize os dados que aparecem nos seus documentos e MTRs.</p>
                   </div>
                   <button className="ml-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all">
                      Alterar Logo
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Razão Social</label>
                    <div className="relative group">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <input type="text" className="input-premium pl-12" defaultValue="Greenly Consultoria Ambiental LTDA" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                    <input type="text" className="input-premium" defaultValue="12.345.678/0001-90" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <input type="email" className="input-premium pl-12" defaultValue="contato@greenly.com.br" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                    <div className="relative group">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <input type="text" className="input-premium pl-12" defaultValue="(11) 99999-9999" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                   <button className="btn-premium w-full flex items-center justify-center gap-2 py-4">
                      <Save size={20} />
                      Salvar Alterações
                   </button>
                </div>
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
               <div className="glass-card p-6 rounded-[32px] border-white/5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <ShieldCheck size={20} className="text-emerald-500" />
                     Segurança
                  </h4>
                  <div className="space-y-4">
                     <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-sm font-medium text-slate-300 hover:bg-white/10 transition-all flex items-center justify-between group">
                        <span>Alterar Senha</span>
                        <Lock size={16} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                     </button>
                     <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-sm font-medium text-slate-300 hover:bg-white/10 transition-all flex items-center justify-between group">
                        <span>Autenticação em 2 Etapas</span>
                        <div className="w-8 h-4 bg-slate-800 rounded-full relative">
                           <div className="w-3 h-3 bg-slate-600 rounded-full absolute left-0.5 top-0.5" />
                        </div>
                     </button>
                  </div>
               </div>
            </div>
          </>
        )}

        {activeTab === 'team' && (
           <div className="col-span-full">
              <div className="glass-card rounded-[32px] overflow-hidden border-white/5">
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-bold text-white">Equipe de Analistas</h3>
                       <p className="text-slate-500 text-sm">Gerencie quem tem acesso à plataforma e suas permissões.</p>
                    </div>
                    <button className="btn-premium flex items-center gap-2">
                       <Plus size={20} />
                       Convidar Membro
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-white/5">
                             <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-20">Analista</th>
                             <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                             <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                             <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Cargo / Role</th>
                             <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {[
                             { name: 'Admin Principal', email: 'admin@greenly.com.br', role: 'ADMIN', initial: 'A' },
                             { name: 'Ricardo Silva', email: 'ricardo@greenly.com.br', role: 'ANALISTA_SENIOR', initial: 'R' },
                             { name: 'Marina Fontes', email: 'marina@greenly.com.br', role: 'ANALISTA_PLENO', initial: 'M' },
                          ].map((user) => (
                             <tr key={user.email} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-5">
                                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center mx-auto shadow-inner">
                                      {user.initial}
                                   </div>
                                </td>
                                <td className="px-8 py-5 font-bold text-white">{user.name}</td>
                                <td className="px-8 py-5 text-slate-400">{user.email}</td>
                                <td className="px-8 py-5">
                                   <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest uppercase">
                                      {user.role}
                                   </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button className="p-2 rounded-lg text-slate-600 hover:text-white transition-colors">
                                      <MoreVertical size={20} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  )
}
