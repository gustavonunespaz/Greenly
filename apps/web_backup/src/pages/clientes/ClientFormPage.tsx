import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  FileText,
  Loader2
} from 'lucide-react'
import { clienteService } from '../../services/cliente.service'
import type { CreateClienteDTO } from '@greenly/shared'

export function ClientFormPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateClienteDTO>()

  const onSubmit = async (data: CreateClienteDTO) => {
    try {
      await clienteService.criar(data)
      navigate('/clientes')
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      alert('Ocorreu um erro ao cadastrar o cliente.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/clientes')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Novo Cliente</h1>
            <p className="text-slate-400 font-medium">Cadastre uma nova empresa contratante.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div className="glass-card rounded-[32px] p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Building2 size={22} />
            </div>
            <h3 className="text-xl font-bold text-white">Informações da Empresa</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Razão Social / Nome</label>
              <input 
                {...register('nome', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Indústria Química S.A." 
                className={`input-premium ${errors.nome ? 'border-red-500/50' : ''}`}
              />
              {errors.nome && <p className="text-xs text-red-500 ml-1">{errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">CNPJ</label>
              <input 
                {...register('cnpj', { required: 'CNPJ é obrigatório' })}
                placeholder="00.000.000/0000-00" 
                className={`input-premium ${errors.cnpj ? 'border-red-500/50' : ''}`}
              />
              {errors.cnpj && <p className="text-xs text-red-500 ml-1">{errors.cnpj.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  {...register('email')}
                  placeholder="empresa@exemplo.com" 
                  className="input-premium pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Telefone Principal</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  {...register('telefone')}
                  placeholder="(00) 0000-0000" 
                  className="input-premium pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Setor de Atuação</label>
              <input 
                {...register('setor')}
                placeholder="Ex: Industrial, Saúde, etc." 
                className="input-premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">CNAE Principal</label>
              <input 
                {...register('cnae')}
                placeholder="0000-0/00" 
                className="input-premium"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="glass-card rounded-[32px] p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MapPin size={22} />
            </div>
            <h3 className="text-xl font-bold text-white">Endereço da Unidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">CEP</label>
              <input 
                {...register('cep')}
                placeholder="00000-000" 
                className="input-premium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Logradouro</label>
              <input 
                {...register('logradouro')}
                placeholder="Rua, Avenida, etc." 
                className="input-premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Número</label>
              <input 
                {...register('numero')}
                placeholder="123" 
                className="input-premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Bairro</label>
              <input 
                {...register('bairro')}
                placeholder="Centro" 
                className="input-premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Cidade</label>
              <input 
                {...register('cidade')}
                placeholder="Sua Cidade" 
                className="input-premium"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate('/clientes')}
            className="px-8 py-3 rounded-2xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all font-bold"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="btn-premium px-10 py-3 flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                <span>Salvar Cliente</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
